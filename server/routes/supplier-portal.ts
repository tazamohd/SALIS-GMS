import { Router } from 'express';

const router = Router();

// ─── Types ───────────────────────────────────────────────────────────────────

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categories: string[];
  rating: number;
  orderCount: number;
  totalSpend: number;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  paymentTerms: string;
  leadTimeDays: number;
}

interface OrderItem {
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string | null;
  trackingNumber: string | null;
  notes: string;
}

// ─── Demo Data ───────────────────────────────────────────────────────────────

const demoSuppliers: Supplier[] = [
  {
    id: 'sup-001', name: 'Al-Rajhi Auto Parts', contactPerson: 'Ahmed Al-Rajhi',
    email: 'ahmed@alrajhi-parts.sa', phone: '+966 50 123 4567', address: 'Riyadh Industrial Area, Block 7',
    categories: ['Engine Parts', 'Filters', 'Belts'], rating: 4.8, orderCount: 142, totalSpend: 485200,
    status: 'active', joinedDate: '2023-01-15', paymentTerms: 'Net 30', leadTimeDays: 3,
  },
  {
    id: 'sup-002', name: 'Gulf Tire Trading', contactPerson: 'Mohammad Hassan',
    email: 'info@gulftire.com', phone: '+966 55 987 6543', address: 'Jeddah Port District, Unit 12',
    categories: ['Tires', 'Wheels', 'Alignment Parts'], rating: 4.5, orderCount: 89, totalSpend: 312800,
    status: 'active', joinedDate: '2023-03-20', paymentTerms: 'Net 45', leadTimeDays: 5,
  },
  {
    id: 'sup-003', name: 'Bosch Automotive KSA', contactPerson: 'Klaus Weber',
    email: 'ksa@bosch-automotive.com', phone: '+966 11 456 7890', address: 'Dammam Free Zone, Warehouse 3',
    categories: ['Electrical', 'Sensors', 'Ignition'], rating: 4.9, orderCount: 67, totalSpend: 278500,
    status: 'active', joinedDate: '2022-11-01', paymentTerms: 'Net 60', leadTimeDays: 7,
  },
  {
    id: 'sup-004', name: 'Saudi Brake Systems', contactPerson: 'Khalid Ibrahim',
    email: 'khalid@saudibrake.sa', phone: '+966 50 222 3333', address: 'Riyadh, Al Sulay Industrial',
    categories: ['Brake Pads', 'Rotors', 'Calipers'], rating: 4.2, orderCount: 53, totalSpend: 167400,
    status: 'active', joinedDate: '2023-06-10', paymentTerms: 'Net 30', leadTimeDays: 2,
  },
  {
    id: 'sup-005', name: 'Petromin Lubricants', contactPerson: 'Faisal Al-Otaibi',
    email: 'faisal@petromin.com.sa', phone: '+966 55 444 5555', address: 'Jeddah, Petromin Tower',
    categories: ['Engine Oil', 'Lubricants', 'Fluids'], rating: 4.6, orderCount: 210, totalSpend: 523000,
    status: 'active', joinedDate: '2022-08-05', paymentTerms: 'Net 15', leadTimeDays: 1,
  },
  {
    id: 'sup-006', name: 'Eastern Motors Spares', contactPerson: 'Nasser Al-Dosari',
    email: 'nasser@easternmotors.sa', phone: '+966 50 666 7777', address: 'Dammam, Eastern Province Hub',
    categories: ['Body Parts', 'Suspension', 'Steering'], rating: 3.9, orderCount: 34, totalSpend: 98600,
    status: 'inactive', joinedDate: '2023-09-15', paymentTerms: 'Net 30', leadTimeDays: 4,
  },
];

const demoPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001', poNumber: 'PO-2026-0001', supplierId: 'sup-001', supplierName: 'Al-Rajhi Auto Parts',
    items: [
      { partName: 'Oil Filter', partNumber: 'OF-2024', quantity: 50, unitPrice: 12.5, lineTotal: 625 },
      { partName: 'Air Filter', partNumber: 'AF-3010', quantity: 30, unitPrice: 18.0, lineTotal: 540 },
    ],
    subtotal: 1165, tax: 174.75, total: 1339.75, status: 'delivered',
    orderDate: '2026-02-10', expectedDelivery: '2026-02-13', actualDelivery: '2026-02-12',
    trackingNumber: 'TRK-SA-29481', notes: 'Regular monthly restock',
  },
  {
    id: 'po-002', poNumber: 'PO-2026-0002', supplierId: 'sup-002', supplierName: 'Gulf Tire Trading',
    items: [
      { partName: 'Michelin Pilot Sport 4', partNumber: 'MPS4-225', quantity: 20, unitPrice: 320, lineTotal: 6400 },
    ],
    subtotal: 6400, tax: 960, total: 7360, status: 'shipped',
    orderDate: '2026-03-01', expectedDelivery: '2026-03-06', actualDelivery: null,
    trackingNumber: 'TRK-SA-30112', notes: 'Summer tire pre-order',
  },
  {
    id: 'po-003', poNumber: 'PO-2026-0003', supplierId: 'sup-003', supplierName: 'Bosch Automotive KSA',
    items: [
      { partName: 'Oxygen Sensor', partNumber: 'BS-O2-4500', quantity: 15, unitPrice: 85, lineTotal: 1275 },
      { partName: 'Spark Plug Set', partNumber: 'BS-SPK-IR', quantity: 40, unitPrice: 22, lineTotal: 880 },
      { partName: 'Ignition Coil', partNumber: 'BS-IC-330', quantity: 10, unitPrice: 110, lineTotal: 1100 },
    ],
    subtotal: 3255, tax: 488.25, total: 3743.25, status: 'confirmed',
    orderDate: '2026-03-10', expectedDelivery: '2026-03-17', actualDelivery: null,
    trackingNumber: null, notes: 'Electrical components restock',
  },
  {
    id: 'po-004', poNumber: 'PO-2026-0004', supplierId: 'sup-004', supplierName: 'Saudi Brake Systems',
    items: [
      { partName: 'Ceramic Brake Pads (Front)', partNumber: 'SBS-CBP-F', quantity: 25, unitPrice: 45, lineTotal: 1125 },
      { partName: 'Brake Rotor 300mm', partNumber: 'SBS-BR-300', quantity: 12, unitPrice: 95, lineTotal: 1140 },
    ],
    subtotal: 2265, tax: 339.75, total: 2604.75, status: 'delivered',
    orderDate: '2026-01-20', expectedDelivery: '2026-01-22', actualDelivery: '2026-01-22',
    trackingNumber: 'TRK-SA-28750', notes: 'Brake service campaign',
  },
  {
    id: 'po-005', poNumber: 'PO-2026-0005', supplierId: 'sup-005', supplierName: 'Petromin Lubricants',
    items: [
      { partName: 'Mobil 1 5W-30 (5L)', partNumber: 'PM-M1-5W30', quantity: 100, unitPrice: 38, lineTotal: 3800 },
      { partName: 'ATF Fluid (1L)', partNumber: 'PM-ATF-1L', quantity: 50, unitPrice: 15, lineTotal: 750 },
      { partName: 'Coolant (4L)', partNumber: 'PM-CL-4L', quantity: 40, unitPrice: 22, lineTotal: 880 },
    ],
    subtotal: 5430, tax: 814.5, total: 6244.5, status: 'delivered',
    orderDate: '2026-02-25', expectedDelivery: '2026-02-26', actualDelivery: '2026-02-26',
    trackingNumber: 'TRK-SA-29980', notes: 'Monthly lubricant order',
  },
  {
    id: 'po-006', poNumber: 'PO-2026-0006', supplierId: 'sup-001', supplierName: 'Al-Rajhi Auto Parts',
    items: [
      { partName: 'Timing Belt Kit', partNumber: 'TB-KIT-200', quantity: 8, unitPrice: 145, lineTotal: 1160 },
      { partName: 'Water Pump', partNumber: 'WP-ALU-350', quantity: 6, unitPrice: 120, lineTotal: 720 },
    ],
    subtotal: 1880, tax: 282, total: 2162, status: 'submitted',
    orderDate: '2026-03-15', expectedDelivery: '2026-03-18', actualDelivery: null,
    trackingNumber: null, notes: 'Timing belt service parts',
  },
  {
    id: 'po-007', poNumber: 'PO-2026-0007', supplierId: 'sup-006', supplierName: 'Eastern Motors Spares',
    items: [
      { partName: 'Front Bumper Cover', partNumber: 'EM-FBC-CAM', quantity: 2, unitPrice: 450, lineTotal: 900 },
    ],
    subtotal: 900, tax: 135, total: 1035, status: 'cancelled',
    orderDate: '2026-02-05', expectedDelivery: '2026-02-09', actualDelivery: null,
    trackingNumber: null, notes: 'Cancelled - customer changed mind',
  },
  {
    id: 'po-008', poNumber: 'PO-2026-0008', supplierId: 'sup-003', supplierName: 'Bosch Automotive KSA',
    items: [
      { partName: 'ABS Sensor', partNumber: 'BS-ABS-120', quantity: 20, unitPrice: 55, lineTotal: 1100 },
    ],
    subtotal: 1100, tax: 165, total: 1265, status: 'delivered',
    orderDate: '2026-01-15', expectedDelivery: '2026-01-22', actualDelivery: '2026-01-21',
    trackingNumber: 'TRK-SA-28200', notes: 'ABS sensor bulk order',
  },
  {
    id: 'po-009', poNumber: 'PO-2026-0009', supplierId: 'sup-004', supplierName: 'Saudi Brake Systems',
    items: [
      { partName: 'Brake Caliper (Reman)', partNumber: 'SBS-RC-LF', quantity: 6, unitPrice: 180, lineTotal: 1080 },
      { partName: 'Brake Hose Kit', partNumber: 'SBS-BH-SET', quantity: 10, unitPrice: 35, lineTotal: 350 },
    ],
    subtotal: 1430, tax: 214.5, total: 1644.5, status: 'delivered',
    orderDate: '2026-02-18', expectedDelivery: '2026-02-20', actualDelivery: '2026-02-21',
    trackingNumber: 'TRK-SA-29600', notes: 'Brake repair kits',
  },
  {
    id: 'po-010', poNumber: 'PO-2026-0010', supplierId: 'sup-005', supplierName: 'Petromin Lubricants',
    items: [
      { partName: 'Brake Fluid DOT4 (1L)', partNumber: 'PM-BF-DOT4', quantity: 60, unitPrice: 12, lineTotal: 720 },
    ],
    subtotal: 720, tax: 108, total: 828, status: 'delivered',
    orderDate: '2026-03-05', expectedDelivery: '2026-03-06', actualDelivery: '2026-03-06',
    trackingNumber: 'TRK-SA-30250', notes: 'Brake fluid stock',
  },
  {
    id: 'po-011', poNumber: 'PO-2026-0011', supplierId: 'sup-002', supplierName: 'Gulf Tire Trading',
    items: [
      { partName: 'Bridgestone Turanza 205/55R16', partNumber: 'BT-T6-205', quantity: 16, unitPrice: 185, lineTotal: 2960 },
      { partName: 'Wheel Balancing Weights', partNumber: 'GT-WBW-KIT', quantity: 100, unitPrice: 2.5, lineTotal: 250 },
    ],
    subtotal: 3210, tax: 481.5, total: 3691.5, status: 'delivered',
    orderDate: '2026-01-28', expectedDelivery: '2026-02-02', actualDelivery: '2026-02-03',
    trackingNumber: 'TRK-SA-28900', notes: 'Tire replacement stock',
  },
  {
    id: 'po-012', poNumber: 'PO-2026-0012', supplierId: 'sup-001', supplierName: 'Al-Rajhi Auto Parts',
    items: [
      { partName: 'Cabin Air Filter', partNumber: 'CAF-HEPA', quantity: 40, unitPrice: 14, lineTotal: 560 },
      { partName: 'Fuel Filter', partNumber: 'FF-UNI-100', quantity: 25, unitPrice: 20, lineTotal: 500 },
    ],
    subtotal: 1060, tax: 159, total: 1219, status: 'delivered',
    orderDate: '2026-02-01', expectedDelivery: '2026-02-04', actualDelivery: '2026-02-03',
    trackingNumber: 'TRK-SA-29100', notes: 'Filter restock',
  },
  {
    id: 'po-013', poNumber: 'PO-2026-0013', supplierId: 'sup-005', supplierName: 'Petromin Lubricants',
    items: [
      { partName: 'Power Steering Fluid (1L)', partNumber: 'PM-PSF-1L', quantity: 30, unitPrice: 18, lineTotal: 540 },
    ],
    subtotal: 540, tax: 81, total: 621, status: 'confirmed',
    orderDate: '2026-03-18', expectedDelivery: '2026-03-19', actualDelivery: null,
    trackingNumber: null, notes: 'PS fluid for stock',
  },
  {
    id: 'po-014', poNumber: 'PO-2026-0014', supplierId: 'sup-003', supplierName: 'Bosch Automotive KSA',
    items: [
      { partName: 'Starter Motor', partNumber: 'BS-SM-200', quantity: 5, unitPrice: 280, lineTotal: 1400 },
      { partName: 'Alternator 120A', partNumber: 'BS-ALT-120', quantity: 4, unitPrice: 350, lineTotal: 1400 },
    ],
    subtotal: 2800, tax: 420, total: 3220, status: 'draft',
    orderDate: '2026-03-19', expectedDelivery: '2026-03-26', actualDelivery: null,
    trackingNumber: null, notes: 'Heavy electrical parts',
  },
  {
    id: 'po-015', poNumber: 'PO-2026-0015', supplierId: 'sup-004', supplierName: 'Saudi Brake Systems',
    items: [
      { partName: 'Brake Disc 320mm Vented', partNumber: 'SBS-BD-320V', quantity: 8, unitPrice: 130, lineTotal: 1040 },
    ],
    subtotal: 1040, tax: 156, total: 1196, status: 'submitted',
    orderDate: '2026-03-17', expectedDelivery: '2026-03-19', actualDelivery: null,
    trackingNumber: null, notes: 'Premium brake discs',
  },
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/supplier-portal/suppliers — Supplier list
router.get('/supplier-portal/suppliers', (req, res) => {
  res.json({ suppliers: demoSuppliers });
});

// GET /api/supplier-portal/suppliers/:id — Supplier detail with order history
router.get('/supplier-portal/suppliers/:id', (req, res) => {
  const supplier = demoSuppliers.find(s => s.id === req.params.id);
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }
  const orders = demoPurchaseOrders.filter(o => o.supplierId === supplier.id);
  res.json({ supplier, orders });
});

// POST /api/supplier-portal/suppliers — Add new supplier
router.post('/supplier-portal/suppliers', (req, res) => {
  const { name, contactPerson, email, phone, address, categories, paymentTerms, leadTimeDays } = req.body;
  if (!name || !contactPerson || !email) {
    return res.status(400).json({ error: 'name, contactPerson, and email are required' });
  }
  const newSupplier: Supplier = {
    id: `sup-${Date.now()}`,
    name,
    contactPerson,
    email,
    phone: phone || '',
    address: address || '',
    categories: categories || [],
    rating: 0,
    orderCount: 0,
    totalSpend: 0,
    status: 'pending',
    joinedDate: new Date().toISOString().split('T')[0],
    paymentTerms: paymentTerms || 'Net 30',
    leadTimeDays: leadTimeDays || 5,
  };
  demoSuppliers.push(newSupplier);
  res.status(201).json({ supplier: newSupplier });
});

// GET /api/supplier-portal/orders — All purchase orders
router.get('/supplier-portal/orders', (req, res) => {
  res.json({ orders: demoPurchaseOrders });
});

// GET /api/supplier-portal/performance — Supplier performance comparison
router.get('/supplier-portal/performance', (req, res) => {
  const activeSuppliers = demoSuppliers.filter(s => s.status === 'active');
  const performance = activeSuppliers.map(supplier => {
    const orders = demoPurchaseOrders.filter(o => o.supplierId === supplier.id);
    const delivered = orders.filter(o => o.status === 'delivered');
    const onTime = delivered.filter(o => {
      if (!o.actualDelivery) return false;
      return o.actualDelivery <= o.expectedDelivery;
    });
    const onTimePercent = delivered.length > 0 ? Math.round((onTime.length / delivered.length) * 100) : 0;

    // Simulated quality scores based on rating
    const qualityScore = Math.round(supplier.rating * 20);

    // Average response time in hours (simulated based on lead time)
    const avgResponseTime = Math.round(supplier.leadTimeDays * 8 + Math.random() * 12);

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      onTimePercent,
      qualityScore,
      avgResponseTimeHours: avgResponseTime,
      totalOrders: orders.length,
      deliveredOrders: delivered.length,
      rating: supplier.rating,
      categories: supplier.categories,
    };
  });

  res.json({ performance });
});

// GET /api/supplier-portal/analytics — Spend analytics
router.get('/supplier-portal/analytics', (req, res) => {
  // Spend by supplier
  const spendBySupplier = demoSuppliers
    .filter(s => s.totalSpend > 0)
    .map(s => ({
      name: s.name,
      value: s.totalSpend,
    }))
    .sort((a, b) => b.value - a.value);

  // Spend by category — aggregate from orders
  const categoryMap = new Map<string, number>();
  for (const supplier of demoSuppliers) {
    const share = supplier.totalSpend / (supplier.categories.length || 1);
    for (const cat of supplier.categories) {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + share);
    }
  }
  const spendByCategory = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  // Monthly spend trend (last 6 months)
  const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
  const monthlySpend = months.map((month, i) => ({
    month,
    spend: Math.round(45000 + Math.sin(i * 0.8) * 15000 + i * 3000),
    orders: Math.round(18 + i * 2 + Math.sin(i) * 5),
  }));

  // Summary stats
  const totalSpend = demoSuppliers.reduce((sum, s) => sum + s.totalSpend, 0);
  const totalOrders = demoSuppliers.reduce((sum, s) => sum + s.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;

  res.json({
    spendBySupplier,
    spendByCategory,
    monthlySpend,
    summary: {
      totalSpend,
      totalOrders,
      avgOrderValue,
      activeSuppliers: demoSuppliers.filter(s => s.status === 'active').length,
    },
  });
});

export default router;
