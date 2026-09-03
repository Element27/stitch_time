import { db } from './dexie';
import { Client, MeasurementTemplate, MeasurementLog, Order, FabricSwatch } from './types';

export const DEFAULT_TEMPLATES: Omit<MeasurementTemplate, 'user_id'>[] = [
  {
    id: 'tmpl_savile_suit',
    name: 'Bespoke 3-Piece Suit (Savile Row Cut)',
    category: 'suit',
    description: 'Comprehensive fitting measurements for custom jacket, vest, and trousers with posture notation.',
    fields: [
      'Chest (Full)',
      'Chest (Overarm)',
      'Waist (Natural)',
      'Waist (Trouser Band)',
      'Neck Circumference',
      'Shoulder Width',
      'Sleeve (Crown to Cuff)',
      'Half Back Width',
      'Front Jacket Length',
      'Back Jacket Length',
      'Bicep',
      'Wrist',
      'Trouser Outseam',
      'Trouser Inseam',
      'Thigh',
      'Knee',
      'Trouser Bottom / Cuff',
      'Crotch / U-Rise'
    ],
    created_at: new Date('2026-01-01').toISOString(),
    _synced: true
  },
  {
    id: 'tmpl_evening_gown',
    name: 'Haute Couture Evening Gown',
    category: 'dress',
    description: 'Precision architectural measurements for draped evening wear, corsetry, and floor-length skirts.',
    fields: [
      'Bust (Apex)',
      'Underbust',
      'Bust Span (Apex to Apex)',
      'Front Shoulder to Apex',
      'Waist (Natural)',
      'High Hip',
      'Full Hip',
      'Neck to Apex',
      'Front Waist Length',
      'Back Waist Length',
      'Shoulder to Floor (with heels)',
      'Waist to Floor',
      'Armhole / Scye',
      'Upper Arm',
      'Back Width'
    ],
    created_at: new Date('2026-01-01').toISOString(),
    _synced: true
  },
  {
    id: 'tmpl_bespoke_shirt',
    name: 'Classic Dress Shirt (Neapolitan Cut)',
    category: 'shirt',
    description: 'Precise collar, yoke, sleeve pitch, and torso measurements for luxury bespoke shirting.',
    fields: [
      'Collar / Neck',
      'Chest Circumference',
      'Waist Circumference',
      'Yoke / Shoulder Width',
      'Left Sleeve Length',
      'Right Sleeve Length',
      'Left Cuff (for watch)',
      'Right Cuff',
      'Bicep Circumference',
      'Shirt Back Length'
    ],
    created_at: new Date('2026-01-01').toISOString(),
    _synced: true
  },
  {
    id: 'tmpl_tailored_trouser',
    name: 'High-Waisted Gurkha & Pleated Trousers',
    category: 'trousers',
    description: 'Fittings for traditional high-rise pleated dress trousers and casual tailored linens.',
    fields: [
      'Waist (High Rise)',
      'Hips (Seat)',
      'Outseam (Waist to Floor)',
      'Inseam',
      'Thigh Circumference',
      'Knee Circumference',
      'Trouser Leg Opening',
      'Front Rise',
      'Back Rise'
    ],
    created_at: new Date('2026-01-01').toISOString(),
    _synced: true
  },
  {
    id: 'tmpl_traditional_kaftan',
    name: 'Ceremonial Kaftan & Agbada / Kimono',
    category: 'traditional',
    description: 'Measurements for draped ceremonial robes and structured artisanal traditional garments.',
    fields: [
      'Shoulder to Shoulder',
      'Chest Width',
      'Garment Full Length',
      'Sleeve Span',
      'Neck Opening',
      'Hem Circumference',
      'Armhole Depth'
    ],
    created_at: new Date('2026-01-01').toISOString(),
    _synced: true
  }
];

export const SAMPLE_SWATCHES: FabricSwatch[] = [
  {
    id: 'swatch_scabal_merino',
    name: 'Midnight Navy Super 160s Wool',
    mill_name: 'Scabal (Savile Row)',
    composition: '100% Super 160s Merino Wool with Silk Sheen',
    weight_gsm: '270g/m',
    color_code: '#18233C',
    pattern: 'Solid',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'swatch_dormeuil_chalk',
    name: 'Charcoal Chalkstripe Flannel',
    mill_name: 'Dormeuil (Yorkshire)',
    composition: '95% Wool, 5% Cashmere',
    weight_gsm: '340g/m',
    color_code: '#2F3034',
    pattern: 'Pinstripe',
    image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'swatch_loropiana_silk',
    name: 'Champagne Crepe de Chine Silk',
    mill_name: 'Loro Piana (Quarona)',
    composition: '100% Mulberry Silk',
    weight_gsm: '120g/m',
    color_code: '#E8DCC4',
    pattern: 'Silk Velvet',
    image_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'swatch_irish_linen',
    name: 'Bespoke Olive Herringbone Linen',
    mill_name: 'Baird McNutt (Ballymena)',
    composition: '100% Pure Irish Linen',
    weight_gsm: '290g/m',
    color_code: '#4A4F3D',
    pattern: 'Herringbone',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CLIENTS: Omit<Client, 'user_id'>[] = [
  {
    id: 'client_01_valerie',
    full_name: 'Lady Valerie Montgomery',
    email: 'valerie.montgomery@atelier-clients.com',
    phone: '+44 20 7946 0912',
    notes: 'Prefers 0.5" extra ease through the armscye. Prefers natural horn buttons. Right shoulder sits 0.25" lower than left.',
    vip_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'client_02_marcus',
    full_name: 'Julian Sterling, Esq.',
    email: 'julian.sterling@mayfair-invest.com',
    phone: '+44 7700 900143',
    notes: 'Erect posture, athletic taper (42" drop 8). Requests high 3.5" peak lapels and working surgeon cuffs with silk Milanese buttonhole.',
    vip_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'client_03_camille',
    full_name: 'Camille Laurent',
    email: 'claurent@studio-paris.fr',
    phone: '+33 6 12 34 56 78',
    notes: 'Corseted waistline preference. Gala season fitting in mid-September. Floor length with 4-inch stiletto allowance.',
    vip_status: false,
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'client_04_daisuke',
    full_name: 'Daisuke Takahashi',
    email: 'd.takahashi@tokyo-architects.jp',
    phone: '+81 90 1234 5678',
    notes: 'Minimalist Neapolitan soft shoulders (Spalla Camicia). Requests unlined jacket with bound seams in bordeaux silk.',
    vip_status: false,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    _synced: true
  }
];

export const INITIAL_MEASUREMENT_LOGS: MeasurementLog[] = [
  {
    id: 'log_01_julian_initial',
    client_id: 'client_02_marcus',
    template_id: 'tmpl_savile_suit',
    unit: 'inches',
    values: {
      'Chest (Full)': 42.5,
      'Chest (Overarm)': 48.0,
      'Waist (Natural)': 34.0,
      'Waist (Trouser Band)': 34.5,
      'Neck Circumference': 16.5,
      'Shoulder Width': 18.75,
      'Sleeve (Crown to Cuff)': 25.5,
      'Half Back Width': 16.0,
      'Front Jacket Length': 30.5,
      'Back Jacket Length': 29.75,
      'Bicep': 14.5,
      'Wrist': 7.25,
      'Trouser Outseam': 41.5,
      'Trouser Inseam': 32.0,
      'Thigh': 24.0,
      'Knee': 18.5,
      'Trouser Bottom / Cuff': 15.5,
      'Crotch / U-Rise': 27.0
    },
    fit_preferences: {
      fit_type: 'tailored',
      posture_notes: 'Athletic V-taper. Square shoulders.',
      shoulder_slope: 'square',
      ease_preference: '+2.0" over chest for comfort movement'
    },
    notes: 'Initial bespoke baseline fitting for winter gala wardrobe.',
    recorded_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'log_02_julian_baste_check',
    client_id: 'client_02_marcus',
    template_id: 'tmpl_savile_suit',
    unit: 'inches',
    values: {
      'Chest (Full)': 42.25,
      'Chest (Overarm)': 48.0,
      'Waist (Natural)': 33.75,
      'Waist (Trouser Band)': 34.25,
      'Neck Circumference': 16.5,
      'Shoulder Width': 18.75,
      'Sleeve (Crown to Cuff)': 25.75,
      'Half Back Width': 15.75,
      'Front Jacket Length': 30.5,
      'Back Jacket Length': 29.75,
      'Bicep': 14.5,
      'Wrist': 7.25,
      'Trouser Outseam': 41.5,
      'Trouser Inseam': 32.0,
      'Thigh': 23.75,
      'Knee': 18.25,
      'Trouser Bottom / Cuff': 15.5,
      'Crotch / U-Rise': 26.75
    },
    fit_preferences: {
      fit_type: 'tailored',
      posture_notes: 'Adjusted waist suppression slightly for cleaner back drape.',
      shoulder_slope: 'square'
    },
    notes: 'First baste fitting adjustment: tightened waist suppression by 0.25" and lengthened sleeve by 0.25" to show 0.5" shirt cuff.',
    recorded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'log_03_valerie_gown',
    client_id: 'client_01_valerie',
    template_id: 'tmpl_evening_gown',
    unit: 'inches',
    values: {
      'Bust (Apex)': 36.5,
      'Underbust': 30.0,
      'Bust Span (Apex to Apex)': 7.5,
      'Front Shoulder to Apex': 10.0,
      'Waist (Natural)': 27.5,
      'High Hip': 35.0,
      'Full Hip': 38.5,
      'Neck to Apex': 14.0,
      'Front Waist Length': 16.0,
      'Back Waist Length': 15.5,
      'Shoulder to Floor (with heels)': 59.0,
      'Waist to Floor': 43.5,
      'Armhole / Scye': 16.5,
      'Upper Arm': 11.0,
      'Back Width': 13.75
    },
    fit_preferences: {
      fit_type: 'classic',
      posture_notes: 'Right shoulder lower by 0.25". Boned bodice requested.',
      shoulder_slope: 'sloped'
    },
    notes: 'Measurements taken over targeted foundation garments.',
    recorded_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    _synced: true
  }
];

export const INITIAL_ORDERS: Omit<Order, 'user_id'>[] = [
  {
    id: 'order_01_sterling_tuxedo',
    client_id: 'client_02_marcus',
    measurement_log_id: 'log_02_julian_baste_check',
    title: 'Bespoke Midnight Tuxedo with Grosgrain Lapels',
    garment_type: 'Bespoke 3-Piece Tuxedo',
    status: 'sewing',
    due_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    total_price: 3450.00,
    deposit_paid: 1800.00,
    fabric_swatches: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80'
    ],
    swatch_details: [SAMPLE_SWATCHES[0]],
    priority: 'rush',
    notes: 'For the Royal Opera Gala. Include silk grosgrain facings, jetted pockets, and matching cummerbund.',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'order_02_valerie_gown',
    client_id: 'client_01_valerie',
    measurement_log_id: 'log_03_valerie_gown',
    title: 'Champagne Silk Crepe Draped Gala Gown',
    garment_type: 'Haute Couture Evening Gown',
    status: 'fitting',
    due_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    total_price: 4200.00,
    deposit_paid: 2500.00,
    fabric_swatches: [
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80'
    ],
    swatch_details: [SAMPLE_SWATCHES[2]],
    priority: 'editorial',
    notes: 'Second fitting scheduled next Tuesday. Hand-pleated bodice and hidden corset lacing.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'order_03_daisuke_linen',
    client_id: 'client_04_daisuke',
    title: 'Olive Irish Linen Safari Overshirt & Pleated Trousers',
    garment_type: 'Bespoke 2-Piece Linen Ensemble',
    status: 'cutting',
    due_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    total_price: 1950.00,
    deposit_paid: 1000.00,
    fabric_swatches: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
    ],
    swatch_details: [SAMPLE_SWATCHES[3]],
    priority: 'standard',
    notes: 'Horn buttons with unlined jacket construction and internal french seams.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    _synced: true
  },
  {
    id: 'order_04_camille_corset',
    client_id: 'client_03_camille',
    title: 'Sculpted Silk Velvet Corset & Drape Skirt',
    garment_type: 'Sculpted Evening Corsetry',
    status: 'pending',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    total_price: 2800.00,
    deposit_paid: 1400.00,
    fabric_swatches: [
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80'
    ],
    priority: 'standard',
    notes: 'Awaiting final swatch approval from Lyon supplier before fabric shears touch cloth.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    _synced: true
  }
];

export async function seedDatabaseIfEmpty(userId: string = 'user_default_atelier') {
  try {
    const clientCount = await db.clients.count();
    if (clientCount === 0) {
      console.log('Seeding initial bespoke atelier data...');

      // 1. Seed Templates
      const templatesToInsert = DEFAULT_TEMPLATES.map((tmpl) => ({
        ...tmpl,
        user_id: userId
      })) as MeasurementTemplate[];
      await db.measurement_templates.bulkPut(templatesToInsert);

      // 2. Seed Clients
      const clientsToInsert = INITIAL_CLIENTS.map((c) => ({
        ...c,
        user_id: userId
      })) as Client[];
      await db.clients.bulkPut(clientsToInsert);

      // 3. Seed Measurement Logs
      await db.measurement_logs.bulkPut(INITIAL_MEASUREMENT_LOGS);

      // 4. Seed Orders
      const ordersToInsert = INITIAL_ORDERS.map((o) => ({
        ...o,
        user_id: userId
      })) as Order[];
      await db.orders.bulkPut(ordersToInsert);

      console.log('Atelier database successfully seeded with bespoke presets.');
    }
  } catch (err) {
    console.error('Failed to seed atelier database:', err);
  }
}
