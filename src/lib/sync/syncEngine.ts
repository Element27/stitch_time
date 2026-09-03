import { db } from '../db/dexie';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/client';
import {
  Client,
  MeasurementTemplate,
  MeasurementLog,
  Order,
  SyncQueueItem,
  SyncTable,
  SyncActionType
} from '../db/types';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
  error: string | null;
  offlineSimulation: boolean;
}

type SyncListener = (state: SyncState) => void;
const listeners = new Set<SyncListener>();

let syncState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  error: null,
  offlineSimulation: false
};

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...syncState }));
}

export function subscribeSyncState(listener: SyncListener) {
  listeners.add(listener);
  listener({ ...syncState });
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncState(): SyncState {
  return { ...syncState };
}

export function setOfflineSimulation(enabled: boolean) {
  syncState.offlineSimulation = enabled;
  syncState.isOnline = enabled ? false : typeof navigator !== 'undefined' ? navigator.onLine : true;
  notifyListeners();
  if (!enabled && typeof navigator !== 'undefined' && navigator.onLine) {
    processSyncQueue();
  }
}

// Queue an action to sync_queue
export async function queueSyncAction(
  table: SyncTable,
  action: SyncActionType,
  record_id: string,
  payload: any
) {
  const item: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    table,
    action,
    record_id,
    payload,
    created_at: Date.now(),
    retry_count: 0,
    error: null
  };

  await db.sync_queue.add(item);
  await updatePendingCount();

  // If online, attempt to process right away
  if (syncState.isOnline && !syncState.offlineSimulation && !syncState.isSyncing) {
    processSyncQueue();
  }
}

export async function updatePendingCount() {
  try {
    const count = await db.sync_queue.count();
    syncState.pendingCount = count;
    notifyListeners();
  } catch {
    // ignore if db not ready
  }
}

// Process pending queue against Supabase
export async function processSyncQueue(): Promise<{ success: boolean; processed: number; error?: string }> {
  if (syncState.offlineSimulation || !syncState.isOnline) {
    return { success: false, processed: 0, error: 'Offline' };
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    // Local-only mode
    const count = await db.sync_queue.count();
    syncState.pendingCount = count;
    syncState.lastSyncedAt = new Date();
    notifyListeners();
    return { success: true, processed: 0 };
  }

  if (syncState.isSyncing) return { success: true, processed: 0 };

  syncState.isSyncing = true;
  syncState.error = null;
  notifyListeners();

  let processed = 0;

  try {
    const queueItems = await db.sync_queue.orderBy('created_at').toArray();

    for (const item of queueItems) {
      try {
        let err: any = null;

        if (item.action === 'INSERT' || item.action === 'UPDATE') {
          // Remove internal flags before upserting
          const { _synced, swatch_details, ...cleanPayload } = item.payload;
          const { error } = await supabase.from(item.table).upsert(cleanPayload);
          err = error;
        } else if (item.action === 'DELETE') {
          const { error } = await supabase.from(item.table).delete().eq('id', item.record_id);
          err = error;
        }

        if (err) {
          console.warn(`Sync failed for item ${item.id} on table ${item.table}:`, err.message);
          await db.sync_queue.update(item.id, {
            retry_count: item.retry_count + 1,
            error: err.message
          });
        } else {
          // Mark record as synced in Dexie
          if (item.table === 'clients') await db.clients.update(item.record_id, { _synced: true });
          if (item.table === 'measurement_templates') await db.measurement_templates.update(item.record_id, { _synced: true });
          if (item.table === 'measurement_logs') await db.measurement_logs.update(item.record_id, { _synced: true });
          if (item.table === 'orders') await db.orders.update(item.record_id, { _synced: true });

          // Remove from sync queue
          await db.sync_queue.delete(item.id);
          processed++;
        }
      } catch (itemErr: any) {
        console.error(`Item sync exception:`, itemErr);
      }
    }

    syncState.lastSyncedAt = new Date();
  } catch (err: any) {
    syncState.error = err.message || 'Sync failed';
  } finally {
    syncState.isSyncing = false;
    await updatePendingCount();
    notifyListeners();
  }

  return { success: !syncState.error, processed };
}

// Fetch changes from Supabase down to Dexie (Pull Sync)
export async function pullRemoteChanges(userId: string) {
  if (syncState.offlineSimulation || !syncState.isOnline) return;
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) return;

  try {
    // 1. Pull clients
    const { data: clients } = await supabase.from('clients').select('*').eq('user_id', userId);
    if (clients && clients.length > 0) {
      await db.clients.bulkPut(clients.map((c) => ({ ...c, _synced: true })));
    }

    // 2. Pull templates
    const { data: templates } = await supabase.from('measurement_templates').select('*').eq('user_id', userId);
    if (templates && templates.length > 0) {
      await db.measurement_templates.bulkPut(templates.map((t) => ({ ...t, _synced: true })));
    }

    // 3. Pull measurement logs
    const { data: logs } = await supabase.from('measurement_logs').select('*');
    if (logs && logs.length > 0) {
      await db.measurement_logs.bulkPut(logs.map((l) => ({ ...l, _synced: true })));
    }

    // 4. Pull orders
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', userId);
    if (orders && orders.length > 0) {
      await db.orders.bulkPut(orders.map((o) => ({ ...o, _synced: true })));
    }

    syncState.lastSyncedAt = new Date();
    notifyListeners();
  } catch (err) {
    console.error('Failed to pull remote changes from Supabase:', err);
  }
}

// Setup network event listeners
export function initSyncEngine() {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    if (!syncState.offlineSimulation) {
      syncState.isOnline = true;
      notifyListeners();
      processSyncQueue();
    }
  };

  const handleOffline = () => {
    syncState.isOnline = false;
    notifyListeners();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  updatePendingCount();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Offline-First Mutation APIs
export async function saveClientOfflineFirst(client: Client) {
  const clientToSave = { ...client, _synced: false, updated_at: new Date().toISOString() };
  await db.clients.put(clientToSave);
  await queueSyncAction('clients', 'INSERT', client.id, clientToSave);
  return clientToSave;
}

export async function updateClientOfflineFirst(id: string, updates: Partial<Client>) {
  const existing = await db.clients.get(id);
  if (!existing) throw new Error(`Client ${id} not found`);
  const updated = { ...existing, ...updates, _synced: false, updated_at: new Date().toISOString() };
  await db.clients.put(updated);
  await queueSyncAction('clients', 'UPDATE', id, updated);
  return updated;
}

export async function deleteClientOfflineFirst(id: string) {
  await db.clients.delete(id);
  await queueSyncAction('clients', 'DELETE', id, { id });
}

export async function saveMeasurementLogOfflineFirst(log: MeasurementLog) {
  const logToSave = { ...log, _synced: false };
  await db.measurement_logs.put(logToSave);
  await queueSyncAction('measurement_logs', 'INSERT', log.id, logToSave);
  return logToSave;
}

export async function saveOrderOfflineFirst(order: Order) {
  const orderToSave = { ...order, _synced: false, updated_at: new Date().toISOString() };
  await db.orders.put(orderToSave);
  await queueSyncAction('orders', 'INSERT', order.id, orderToSave);
  return orderToSave;
}

export async function updateOrderOfflineFirst(id: string, updates: Partial<Order>) {
  const existing = await db.orders.get(id);
  if (!existing) throw new Error(`Order ${id} not found`);
  const updated = { ...existing, ...updates, _synced: false, updated_at: new Date().toISOString() };
  await db.orders.put(updated);
  await queueSyncAction('orders', 'UPDATE', id, updated);
  return updated;
}

export async function deleteOrderOfflineFirst(id: string) {
  await db.orders.delete(id);
  await queueSyncAction('orders', 'DELETE', id, { id });
}

export async function saveTemplateOfflineFirst(template: MeasurementTemplate) {
  const templateToSave = { ...template, _synced: false };
  await db.measurement_templates.put(templateToSave);
  await queueSyncAction('measurement_templates', 'INSERT', template.id, templateToSave);
  return templateToSave;
}
