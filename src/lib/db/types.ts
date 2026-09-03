export type MeasurementUnit = 'inches' | 'cm';

export type OrderStatus = 'pending' | 'cutting' | 'sewing' | 'fitting' | 'ready' | 'delivered';

export interface Client {
  id: string; // UUID
  user_id: string; // Clerk user ID (e.g., user_2xxx)
  full_name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  vip_status?: boolean;
  avatar_url?: string | null;
  created_at: string; // ISO date string
  updated_at?: string;
  _synced?: boolean; // For offline sync tracking
}

export interface MeasurementTemplate {
  id: string; // UUID
  user_id: string; // Clerk user ID
  name: string;
  category?: 'suit' | 'dress' | 'trousers' | 'shirt' | 'outerwear' | 'traditional' | 'custom';
  description?: string;
  fields: string[]; // e.g. ["Chest", "Waist", "Neck", "Shoulder", "Sleeve Length", "Trouser Length", "Thigh", "Ankle", "Hips", "Inseam", "Bicep", "Wrist"]
  created_at?: string;
  _synced?: boolean;
}

export interface MeasurementLog {
  id: string; // UUID
  client_id: string; // Foreign key to Client
  template_id?: string | null; // Foreign key to MeasurementTemplate
  unit: MeasurementUnit; // 'inches' | 'cm'
  values: Record<string, number | string>; // e.g. {"Chest": 40.5, "Waist": 34.0}
  fit_preferences?: {
    fit_type?: 'ultra_slim' | 'tailored' | 'classic' | 'relaxed';
    posture_notes?: string;
    shoulder_slope?: 'regular' | 'square' | 'sloped';
    ease_preference?: string;
  };
  notes?: string | null;
  recorded_at: string; // ISO date string
  _synced?: boolean;
}

export interface FabricSwatch {
  id: string;
  name: string;
  mill_name?: string;
  composition?: string; // e.g. "100% Super 150s Merino Wool"
  weight_gsm?: string | number; // e.g. "280g"
  color_code?: string; // hex code for swatch visual
  image_url?: string;
  pattern?: 'Solid' | 'Pinstripe' | 'Glen Plaid' | 'Herringbone' | 'Houndstooth' | 'Jacquard' | 'Silk Velvet' | 'Linen Weave';
}

export interface Order {
  id: string; // UUID
  user_id: string; // Clerk user ID
  client_id: string; // Foreign key to Client
  measurement_log_id?: string | null; // Foreign key to MeasurementLog
  title: string;
  garment_type?: string; // e.g. "Bespoke 3-Piece Tuxedo", "Silk Evening Gown"
  status: OrderStatus;
  due_date?: string | null; // YYYY-MM-DD
  total_price: number;
  deposit_paid: number;
  fabric_swatches?: string[]; // Array of image URLs or swatch descriptors
  swatch_details?: FabricSwatch[];
  priority?: 'standard' | 'rush' | 'editorial';
  notes?: string | null;
  created_at: string; // ISO date string
  updated_at?: string;
  _synced?: boolean;
}

export type SyncActionType = 'INSERT' | 'UPDATE' | 'DELETE';
export type SyncTable = 'clients' | 'measurement_templates' | 'measurement_logs' | 'orders';

export interface SyncQueueItem {
  id: string;
  table: SyncTable;
  action: SyncActionType;
  record_id: string;
  payload: any;
  created_at: number; // Timestamp
  retry_count: number;
  error?: string | null;
}
