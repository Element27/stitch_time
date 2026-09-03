import Dexie, { type EntityTable } from 'dexie';
import { Client, MeasurementTemplate, MeasurementLog, Order, SyncQueueItem } from './types';

export class AtelierDatabase extends Dexie {
  clients!: EntityTable<Client, 'id'>;
  measurement_templates!: EntityTable<MeasurementTemplate, 'id'>;
  measurement_logs!: EntityTable<MeasurementLog, 'id'>;
  orders!: EntityTable<Order, 'id'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('StitchAndTimeAtelierDB');
    this.version(1).stores({
      clients: 'id, user_id, full_name, created_at, _synced',
      measurement_templates: 'id, user_id, name, _synced',
      measurement_logs: 'id, client_id, template_id, recorded_at, _synced',
      orders: 'id, user_id, client_id, status, due_date, created_at, _synced',
      sync_queue: 'id, table, action, record_id, created_at, retry_count'
    });
  }
}

export const db = new AtelierDatabase();
