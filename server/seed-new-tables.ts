import { Client } from 'pg';
import { randomUUID } from 'crypto';

const client = new Client({ connectionString: process.env.DATABASE_URL });
const GARAGE_ID = '034dc6c4-dc26-467d-887c-4a7f16c60d88';
const USER_ID = 'd88e9012-199c-4a78-82f1-ec12a76c0ef4';

const supplierIds = [randomUUID(), randomUUID()];
const taskIds = [randomUUID(), randomUUID(), randomUUID()];
const qrIds = [randomUUID(), randomUUID(), randomUUID()];
const deliveryIds = [randomUUID(), randomUUID()];
const sqIds = [randomUUID(), randomUUID()];

const suppliers = [
  { id: supplierIds[0], name: 'Al Rajhi Auto Parts', contact_person: 'Mohammed Al Rajhi', email: 'sales@alrajhi-parts.sa', phone: '+966501234567', address: 'Riyadh Industrial City', is_active: true, garage_id: GARAGE_ID },
  { id: supplierIds[1], name: 'Gulf Precision Engineering', contact_person: 'Ali Hassan', email: 'info@gulfprecision.sa', phone: '+966509876543', address: 'Jeddah Industrial Area', is_active: true, garage_id: GARAGE_ID },
];

const tasks = [
  { id: taskIds[0], task_number: 'PT-2026-001', garage_id: GARAGE_ID, title: 'Toyota Camry Filters', description: 'Engine oil filter, air filter, cabin filter for Toyota Camry 2023', source_type: 'procurement', source_name: 'Workshop Manager', priority: 'high', status: 'pending', store_location: 'Main Warehouse', due_date: new Date(Date.now() + 2*86400000).toISOString(), notes: 'Customer needs vehicle ready by Friday', assigned_to: USER_ID },
  { id: taskIds[1], task_number: 'PT-2026-002', garage_id: GARAGE_ID, title: 'Hyundai Tucson Brake Service', description: 'Front brake pads and discs for Hyundai Tucson 2022', source_type: 'procurement', source_name: 'Service Advisor', priority: 'medium', status: 'pending', store_location: 'Main Warehouse', due_date: new Date(Date.now() + 5*86400000).toISOString(), notes: 'Regular brake service', assigned_to: USER_ID },
  { id: taskIds[2], task_number: 'PT-2026-003', garage_id: GARAGE_ID, title: 'Nissan Patrol Suspension', description: 'Suspension bushings and shock absorbers for Nissan Patrol 2024', source_type: 'procurement', source_name: 'Technician', priority: 'low', status: 'pending', store_location: 'Parts Store', due_date: new Date(Date.now() + 14*86400000).toISOString(), notes: 'Customer flexible on timeline', assigned_to: USER_ID },
];

const taskParts = [
  { id: randomUUID(), task_id: taskIds[0], part_number: '90915-YZZD4', part_name: 'Engine Oil Filter', quantity: 1, urgency: 'high' },
  { id: randomUUID(), task_id: taskIds[0], part_number: '17801-21050', part_name: 'Air Filter', quantity: 1, urgency: 'high' },
  { id: randomUUID(), task_id: taskIds[0], part_number: '87139-30100', part_name: 'Cabin Filter', quantity: 1, urgency: 'medium' },
  { id: randomUUID(), task_id: taskIds[1], part_number: '58101-3B050', part_name: 'Front Brake Pads', quantity: 1, urgency: 'medium' },
  { id: randomUUID(), task_id: taskIds[1], part_number: '52111-3B050', part_name: 'Front Brake Discs', quantity: 2, urgency: 'medium' },
  { id: randomUUID(), task_id: taskIds[2], part_number: '54613-3B000', part_name: 'Suspension Bushing Kit', quantity: 4, urgency: 'low' },
  { id: randomUUID(), task_id: taskIds[2], part_number: '56110-3KA0A', part_name: 'Shock Absorber', quantity: 2, urgency: 'low' },
];

const qrs = [
  { id: qrIds[0], request_number: 'QR-2026-001', garage_id: GARAGE_ID, task_id: taskIds[0], title: 'Filters for Toyota Camry 2023', status: 'sent', store_location: 'Main Warehouse', due_date: new Date(Date.now()+3*86400000).toISOString(), created_by: USER_ID },
  { id: qrIds[1], request_number: 'QR-2026-002', garage_id: GARAGE_ID, task_id: taskIds[1], title: 'Brake Parts for Hyundai Tucson', status: 'received', store_location: 'Main Warehouse', due_date: new Date(Date.now()+5*86400000).toISOString(), created_by: USER_ID },
  { id: qrIds[2], request_number: 'QR-2026-003', garage_id: GARAGE_ID, task_id: taskIds[2], title: 'Suspension Parts for Nissan Patrol', status: 'draft', store_location: 'Parts Store', due_date: new Date(Date.now()+14*86400000).toISOString(), created_by: USER_ID },
];

const supplierQuotations = [
  { id: sqIds[0], quotation_request_id: qrIds[1], supplier_id: supplierIds[0], delivery_time: '3 business days', total_price: '1180.00', currency: 'SAR', valid_until: new Date(Date.now()+14*86400000).toISOString(), payment_terms: 'Net 30', notes: 'OEM parts available', is_recommended: true },
  { id: sqIds[1], quotation_request_id: qrIds[1], supplier_id: supplierIds[1], delivery_time: '5 business days', total_price: '1250.00', currency: 'SAR', valid_until: new Date(Date.now()+14*86400000).toISOString(), payment_terms: 'Net 30', notes: 'Aftermarket quality parts', is_recommended: false },
];

const quotationItems = [
  { id: randomUUID(), quotation_id: sqIds[0], part_number: '58101-3B050', part_name: 'Front Brake Pads', quantity: 1, unit_price: '280.00', availability: 'in_stock', lead_time: '1 day' },
  { id: randomUUID(), quotation_id: sqIds[0], part_number: '52111-3B050', part_name: 'Front Brake Discs', quantity: 2, unit_price: '450.00', availability: 'in_stock', lead_time: '1 day' },
  { id: randomUUID(), quotation_id: sqIds[1], part_number: '58101-3B050', part_name: 'Front Brake Pads', quantity: 1, unit_price: '310.00', availability: 'in_stock', lead_time: '3 days' },
  { id: randomUUID(), quotation_id: sqIds[1], part_number: '52111-3B050', part_name: 'Front Brake Discs', quantity: 2, unit_price: '470.00', availability: 'low_stock', lead_time: '4 days' },
];

const payments = [
  { id: randomUUID(), garage_id: GARAGE_ID, order_number: 'PO-2026-001', supplier_id: supplierIds[0], supplier_bank: 'Al Rajhi Bank', supplier_iban: 'SA4420000001234567890123', invoice_number: 'INV-2026-001', invoice_date: new Date(Date.now()-7*86400000).toISOString(), amount: '1180.00', currency: 'SAR', status: 'pending', due_date: new Date(Date.now()+23*86400000).toISOString(), payment_method: 'Bank Transfer', notes: 'Payment for brake parts', created_by: USER_ID },
  { id: randomUUID(), garage_id: GARAGE_ID, order_number: 'PO-2026-002', supplier_id: supplierIds[1], supplier_bank: 'Saudi National Bank', supplier_iban: 'SA6680000009876543210987', invoice_number: 'INV-2026-002', invoice_date: new Date(Date.now()-14*86400000).toISOString(), amount: '2500.00', currency: 'SAR', status: 'paid', paid_date: new Date(Date.now()-3*86400000).toISOString(), due_date: new Date(Date.now()-3*86400000).toISOString(), payment_method: 'Bank Transfer', payment_reference: 'TXN-2026-SB-00123', notes: 'Suspension parts - paid early', created_by: USER_ID },
];

const deliveries = [
  { id: deliveryIds[0], garage_id: GARAGE_ID, order_number: 'PO-2026-001', supplier_id: supplierIds[0], supplier_contact: 'Mohammed Al Rajhi', supplier_phone: '+966501234567', delivery_location: 'Main Warehouse', delivery_address: '123 Industrial Road, Riyadh', status: 'in_transit', estimated_delivery: new Date(Date.now()+2*86400000).toISOString(), tracking_number: 'TRK-SF-123456', carrier: 'SF Express', additional_notes: 'Fragile - handle with care', created_by: USER_ID },
  { id: deliveryIds[1], garage_id: GARAGE_ID, order_number: 'PO-2026-002', supplier_id: supplierIds[1], supplier_contact: 'Ali Hassan', supplier_phone: '+966509876543', delivery_location: 'Parts Store', delivery_address: '456 Parts Avenue, Jeddah', status: 'pending', estimated_delivery: new Date(Date.now()+5*86400000).toISOString(), created_by: USER_ID },
];

const deliveryItems = [
  { id: randomUUID(), delivery_id: deliveryIds[0], part_name: 'Front Brake Pads', quantity: 1 },
  { id: randomUUID(), delivery_id: deliveryIds[0], part_name: 'Front Brake Discs', quantity: 2 },
  { id: randomUUID(), delivery_id: deliveryIds[1], part_name: 'Shock Absorber', quantity: 2 },
];

const deliveryTimeline = [
  { id: randomUUID(), delivery_id: deliveryIds[0], status: 'Order Confirmed', timestamp: new Date(Date.now()-2*86400000).toISOString(), location: 'Al Rajhi Auto Parts, Riyadh', note: 'Order confirmed by supplier' },
  { id: randomUUID(), delivery_id: deliveryIds[0], status: 'Picked Up', timestamp: new Date(Date.now()-1*86400000).toISOString(), location: 'Al Rajhi Warehouse', note: 'Package picked up by SF Express' },
  { id: randomUUID(), delivery_id: deliveryIds[0], status: 'In Transit', timestamp: new Date(Date.now()-12*3600000).toISOString(), location: 'Riyadh Distribution Center', note: 'Package in transit' },
];

const liveStatuses = [
  { id: randomUUID(), delivery_id: deliveryIds[0], parts_description: 'Front brake pads and discs for Hyundai Tucson', destination_garage: 'SLIS Garage', destination_address: '123 Industrial Road, Riyadh', store_keeper_name: 'Ahmed', store_keeper_phone: '+966551112222', driver_name: 'Khalid', driver_phone: '+966553334444', vehicle_number: 'RIG-4521', current_stage: 'in_transit', estimated_arrival: '2 hours', stages: JSON.stringify([{name:'Confirmed',done:true,time:'10:00 AM'},{name:'Picked Up',done:true,time:'2:00 PM'},{name:'In Transit',done:true,time:'4:30 PM'},{name:'Arriving',done:false,time:''},{name:'Delivered',done:false,time:''}]), live_updates: JSON.stringify([{time:'4:30 PM',event:'Package left distribution center',location:'Riyadh'},{time:'2:00 PM',event:'Package picked up from supplier',location:'Al Rajhi Warehouse'}]) },
];

async function seed() {
  await client.connect();
  try {
    const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM suppliers');
    if (parseInt(count) === 0) {
      for (const s of suppliers) {
        await client.query(`INSERT INTO suppliers (id, name, contact_person, email, phone, address, is_active, garage_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [s.id, s.name, s.contact_person, s.email, s.phone, s.address, s.is_active, s.garage_id]);
      }
      console.log('✓ Suppliers');
    }

    for (const t of tasks) {
      await client.query(`INSERT INTO purchase_tasks (id, task_number, garage_id, title, description, source_type, source_name, priority, status, store_location, due_date, notes, assigned_to) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [t.id, t.task_number, t.garage_id, t.title, t.description, t.source_type, t.source_name, t.priority, t.status, t.store_location, t.due_date, t.notes, t.assigned_to]);
    }
    console.log('✓ Purchase Tasks');

    for (const p of taskParts) {
      await client.query(`INSERT INTO purchase_task_parts (id, task_id, part_number, part_name, quantity, urgency) VALUES ($1,$2,$3,$4,$5,$6)`, [p.id, p.task_id, p.part_number, p.part_name, p.quantity, p.urgency]);
    }
    console.log('✓ Task Parts');

    for (const q of qrs) {
      await client.query(`INSERT INTO quotation_requests (id, request_number, garage_id, task_id, title, status, store_location, due_date, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [q.id, q.request_number, q.garage_id, q.task_id, q.title, q.status, q.store_location, q.due_date, q.created_by]);
    }
    console.log('✓ Quotation Requests');

    for (const sq of supplierQuotations) {
      await client.query(`INSERT INTO supplier_quotations (id, quotation_request_id, supplier_id, delivery_time, total_price, currency, valid_until, payment_terms, notes, is_recommended) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [sq.id, sq.quotation_request_id, sq.supplier_id, sq.delivery_time, sq.total_price, sq.currency, sq.valid_until, sq.payment_terms, sq.notes, sq.is_recommended]);
    }
    console.log('✓ Supplier Quotations');

    for (const qi of quotationItems) {
      await client.query(`INSERT INTO quotation_items (id, quotation_id, part_number, part_name, quantity, unit_price, availability, lead_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [qi.id, qi.quotation_id, qi.part_number, qi.part_name, qi.quantity, qi.unit_price, qi.availability, qi.lead_time]);
    }
    console.log('✓ Quotation Items');

    for (const pay of payments) {
      await client.query(`INSERT INTO supplier_payments (id, garage_id, order_number, supplier_id, supplier_bank, supplier_iban, invoice_number, invoice_date, amount, currency, status, due_date, paid_date, payment_method, payment_reference, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [pay.id, pay.garage_id, pay.order_number, pay.supplier_id, pay.supplier_bank, pay.supplier_iban, pay.invoice_number, pay.invoice_date, pay.amount, pay.currency, pay.status, pay.due_date, pay.paid_date || null, pay.payment_method, pay.payment_reference || null, pay.notes, pay.created_by]);
    }
    console.log('✓ Supplier Payments');

    for (const d of deliveries) {
      await client.query(`INSERT INTO deliveries (id, garage_id, order_number, supplier_id, supplier_contact, supplier_phone, delivery_location, delivery_address, status, estimated_delivery, tracking_number, carrier, additional_notes, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [d.id, d.garage_id, d.order_number, d.supplier_id, d.supplier_contact, d.supplier_phone, d.delivery_location, d.delivery_address, d.status, d.estimated_delivery, d.tracking_number || null, d.carrier || null, d.additional_notes || null, d.created_by]);
    }
    console.log('✓ Deliveries');

    for (const di of deliveryItems) {
      await client.query(`INSERT INTO delivery_items (id, delivery_id, part_name, quantity) VALUES ($1,$2,$3,$4)`, [di.id, di.delivery_id, di.part_name, di.quantity]);
    }
    console.log('✓ Delivery Items');

    for (const dt of deliveryTimeline) {
      await client.query(`INSERT INTO delivery_timeline (id, delivery_id, status, timestamp, location, note) VALUES ($1,$2,$3,$4,$5,$6)`, [dt.id, dt.delivery_id, dt.status, dt.timestamp, dt.location, dt.note]);
    }
    console.log('✓ Delivery Timeline');

    for (const ls of liveStatuses) {
      await client.query(`INSERT INTO live_delivery_statuses (id, delivery_id, parts_description, destination_garage, destination_address, store_keeper_name, store_keeper_phone, driver_name, driver_phone, vehicle_number, current_stage, estimated_arrival, stages, live_updates) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [ls.id, ls.delivery_id, ls.parts_description, ls.destination_garage, ls.destination_address, ls.store_keeper_name, ls.store_keeper_phone, ls.driver_name, ls.driver_phone, ls.vehicle_number, ls.current_stage, ls.estimated_arrival, ls.stages, ls.live_updates]);
    }
    console.log('✓ Live Delivery Statuses');

    console.log('\n🎉 All seed data inserted successfully!');
  } finally {
    await client.end();
  }
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
