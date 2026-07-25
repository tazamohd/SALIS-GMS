/**
 * SALIS AUTO - Role-Based Access Control (RBAC) Configuration
 * 
 * This file defines all standard roles, permissions, and their mappings
 * for the comprehensive automotive ERP system with 141+ modules.
 */

// ============================================================================
// PERMISSION ACTIONS
// ============================================================================

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  ASSIGN: 'assign',
  MANAGE: 'manage',
  VIEW_ALL: 'view_all',
  VIEW_OWN: 'view_own',
  EDIT_ALL: 'edit_all',
  EDIT_OWN: 'edit_own',
  CANCEL: 'cancel',
  REFUND: 'refund',
  VOID: 'void',
  PRINT: 'print',
} as const;

// ============================================================================
// PERMISSION CATEGORIES
// ============================================================================

export const PERMISSION_CATEGORIES = {
  // Dashboard & Overview
  DASHBOARD: 'Dashboard & Overview',
  
  // Customer Management
  CUSTOMERS: 'Customer Management',
  APPOINTMENTS: 'Appointments & Scheduling',
  
  // Vehicle Management
  VEHICLES: 'Vehicle Management',
  FLEET: 'Fleet Management',
  
  // Service Operations
  JOB_CARDS: 'Job Cards & Service',
  INSPECTIONS: 'Inspections & Quality',
  DIAGNOSTICS: 'Diagnostics & OBD',
  
  // Parts & Inventory
  INVENTORY: 'Parts & Inventory',
  SUPPLIERS: 'Suppliers & Procurement',
  PURCHASE_ORDERS: 'Purchase Orders',
  
  // Financial
  INVOICING: 'Invoicing & Billing',
  PAYMENTS: 'Payments & Transactions',
  PAYROLL: 'Payroll & Expenses',
  ACCOUNTING: 'Accounting & Finance',
  
  // Analytics & Reports
  REPORTS: 'Reports & Analytics',
  BUSINESS_INTELLIGENCE: 'Business Intelligence',
  
  // HR & Team Management
  STAFF: 'Staff & HR Management',
  TECHNICIANS: 'Technician Management',
  PERFORMANCE: 'Performance Management',
  TRAINING: 'Training & Certification',
  
  // Marketing & Customer Experience
  MARKETING: 'Marketing & Campaigns',
  LOYALTY: 'Customer Loyalty',
  REVIEWS: 'Reviews & Feedback',
  
  // Enterprise & Franchise
  FRANCHISE: 'Franchise Management',
  ENTERPRISE: 'Enterprise Features',
  
  // Compliance & Safety
  COMPLIANCE: 'Compliance & Regulations',
  SAFETY: 'Safety & Incidents',
  QUALITY: 'Quality Management',
  
  // AI & Automation
  AI_FEATURES: 'AI & Automation',
  CHATBOT: 'AI Chatbot & Assistant',
  
  // Emerging Technologies
  BLOCKCHAIN: 'Blockchain & Smart Contracts',
  AR_VR: 'AR/VR & Emerging Tech',
  IOT: 'IoT & Telematics',
  
  // System Administration
  SYSTEM: 'System Administration',
  SECURITY: 'Security & Access Control',
  INTEGRATIONS: 'Integrations & APIs',
  SETTINGS: 'Settings & Configuration',
} as const;

// ============================================================================
// RESOURCES (Based on 141+ Modules)
// ============================================================================

export const RESOURCES = {
  // Dashboard & Overview
  dashboard: { category: PERMISSION_CATEGORIES.DASHBOARD, label: 'Dashboard' },
  kpi_dashboard: { category: PERMISSION_CATEGORIES.DASHBOARD, label: 'KPI Dashboard' },
  
  // Customer Management
  customers: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Customers' },
  customer_profiles: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Customer Profiles' },
  customer_notes: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Customer Notes' },
  customer_ltv: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Customer Lifetime Value' },
  
  // Appointments & Scheduling
  appointments: { category: PERMISSION_CATEGORIES.APPOINTMENTS, label: 'Appointments' },
  calendar: { category: PERMISSION_CATEGORIES.APPOINTMENTS, label: 'Calendar' },
  appointment_reminders: { category: PERMISSION_CATEGORIES.APPOINTMENTS, label: 'Appointment Reminders' },
  ai_scheduling: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'AI Scheduling' },
  
  // Vehicle Management
  vehicles: { category: PERMISSION_CATEGORIES.VEHICLES, label: 'Vehicles' },
  vehicle_history: { category: PERMISSION_CATEGORIES.VEHICLES, label: 'Vehicle History' },
  vehicle_inspections: { category: PERMISSION_CATEGORIES.INSPECTIONS, label: 'Vehicle Inspections' },
  vehicle_health: { category: PERMISSION_CATEGORIES.DIAGNOSTICS, label: 'Vehicle Health Monitoring' },
  vin_decoder: { category: PERMISSION_CATEGORIES.VEHICLES, label: 'VIN Decoder' },
  fleet_management: { category: PERMISSION_CATEGORIES.FLEET, label: 'Fleet Management' },
  fleet_tracking: { category: PERMISSION_CATEGORIES.FLEET, label: 'Fleet Tracking' },
  loaner_vehicles: { category: PERMISSION_CATEGORIES.VEHICLES, label: 'Loaner Vehicles' },
  
  // Service Operations
  job_cards: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Job Cards' },
  tasks: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Tasks' },
  service_templates: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Service Templates' },
  estimates: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Estimates' },
  video_estimates: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Video Estimates' },
  live_tracking: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Live Service Tracking' },
  
  // Diagnostics & Inspections
  diagnostics_obd: { category: PERMISSION_CATEGORIES.DIAGNOSTICS, label: 'Diagnostics & OBD' },
  smart_damage_assessment: { category: PERMISSION_CATEGORIES.DIAGNOSTICS, label: 'Smart Damage Assessment' },
  predictive_maintenance: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Predictive Maintenance' },
  predictive_diagnostics: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Predictive Diagnostics' },
  document_ocr: { category: PERMISSION_CATEGORIES.DIAGNOSTICS, label: 'Document OCR' },
  digital_walkaround: { category: PERMISSION_CATEGORIES.INSPECTIONS, label: 'Digital Vehicle Walkaround' },
  
  // Parts & Inventory
  inventory: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Inventory Management' },
  spare_parts: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Spare Parts' },
  tools: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Tools Management' },
  parts_auto_reorder: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Auto Reordering' },
  smart_inventory_forecasting: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Smart Inventory Forecasting' },
  parts_recommendations: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Smart Parts Recommendations' },
  parts_marketplace: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Parts Marketplace' },
  parts_network: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Parts Supply Network' },
  parts_availability: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Parts Availability Tracker' },
  barcode_scanner: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Barcode Scanner' },
  
  // Suppliers & Procurement
  suppliers: { category: PERMISSION_CATEGORIES.SUPPLIERS, label: 'Suppliers' },
  purchase_orders: { category: PERMISSION_CATEGORIES.PURCHASE_ORDERS, label: 'Purchase Orders' },
  vendor_portal: { category: PERMISSION_CATEGORIES.SUPPLIERS, label: 'Vendor/Supplier Portal' },
  
  // Financial Management
  invoices: { category: PERMISSION_CATEGORIES.INVOICING, label: 'Invoices' },
  payments: { category: PERMISSION_CATEGORIES.PAYMENTS, label: 'Payments' },
  stripe_payments: { category: PERMISSION_CATEGORIES.PAYMENTS, label: 'Stripe Payment Processing' },
  refunds: { category: PERMISSION_CATEGORIES.PAYMENTS, label: 'Refund Management' },
  financial_settings: { category: PERMISSION_CATEGORIES.ACCOUNTING, label: 'Financial Settings' },
  accounting_integration: { category: PERMISSION_CATEGORIES.ACCOUNTING, label: 'Accounting Integration' },
  expense_tracking: { category: PERMISSION_CATEGORIES.PAYROLL, label: 'Expense Tracking' },
  payroll: { category: PERMISSION_CATEGORIES.PAYROLL, label: 'Payroll Management' },
  profit_analysis: { category: PERMISSION_CATEGORIES.ACCOUNTING, label: 'Profit Analysis' },
  
  // Reports & Analytics
  reports: { category: PERMISSION_CATEGORIES.REPORTS, label: 'Reports' },
  custom_reports: { category: PERMISSION_CATEGORIES.REPORTS, label: 'Custom Reports' },
  business_intelligence: { category: PERMISSION_CATEGORIES.BUSINESS_INTELLIGENCE, label: 'Business Intelligence' },
  business_heatmaps: { category: PERMISSION_CATEGORIES.BUSINESS_INTELLIGENCE, label: 'Business Heatmaps' },
  fraud_detection: { category: PERMISSION_CATEGORIES.BUSINESS_INTELLIGENCE, label: 'ML Fraud Detection' },
  
  // HR & Team Management
  hr_management: { category: PERMISSION_CATEGORIES.STAFF, label: 'HR Management' },
  staff_performance: { category: PERMISSION_CATEGORIES.PERFORMANCE, label: 'Staff Performance Review' },
  timesheet_management: { category: PERMISSION_CATEGORIES.STAFF, label: 'Timesheet Management' },
  timeclock_payroll: { category: PERMISSION_CATEGORIES.PAYROLL, label: 'Time Clock & Payroll' },
  training_lms: { category: PERMISSION_CATEGORIES.TRAINING, label: 'Training & Certification LMS' },
  knowledge_base: { category: PERMISSION_CATEGORIES.TRAINING, label: 'Knowledge Base' },
  
  // Technician Management
  technicians: { category: PERMISSION_CATEGORIES.TECHNICIANS, label: 'Technician Management' },
  technician_portal: { category: PERMISSION_CATEGORIES.TECHNICIANS, label: 'Technician Portal' },
  technician_performance: { category: PERMISSION_CATEGORIES.PERFORMANCE, label: 'Technician Performance' },
  technician_leaderboards: { category: PERMISSION_CATEGORIES.PERFORMANCE, label: 'Technician Leaderboards' },
  smart_assignment: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Smart Job Assignment' },
  task_management: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Task Management' },
  
  // Marketing & Customer Experience
  marketing_automation: { category: PERMISSION_CATEGORIES.MARKETING, label: 'Marketing Automation' },
  email_marketing: { category: PERMISSION_CATEGORIES.MARKETING, label: 'Email Marketing Campaigns' },
  customer_loyalty: { category: PERMISSION_CATEGORIES.LOYALTY, label: 'Customer Loyalty' },
  referral_program: { category: PERMISSION_CATEGORIES.LOYALTY, label: 'Referral Program' },
  customer_reviews: { category: PERMISSION_CATEGORIES.REVIEWS, label: 'Customer Reviews & Ratings' },
  social_media: { category: PERMISSION_CATEGORIES.MARKETING, label: 'Social Media Integration' },
  social_monitoring: { category: PERMISSION_CATEGORIES.MARKETING, label: 'Social Media Monitoring' },
  google_my_business: { category: PERMISSION_CATEGORIES.MARKETING, label: 'Google My Business' },
  video_consultations: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Video Consultations' },
  
  // Enterprise & Franchise
  franchise_management: { category: PERMISSION_CATEGORIES.FRANCHISE, label: 'Franchise Management' },
  oem_software: { category: PERMISSION_CATEGORIES.ENTERPRISE, label: 'OEM Software Subscriptions' },
  globalization: { category: PERMISSION_CATEGORIES.ENTERPRISE, label: 'Globalization Layer' },
  contract_management: { category: PERMISSION_CATEGORIES.ENTERPRISE, label: 'Contract Management' },
  warranty_management: { category: PERMISSION_CATEGORIES.ENTERPRISE, label: 'Warranty Management' },
  
  // Compliance & Safety
  compliance_management: { category: PERMISSION_CATEGORIES.COMPLIANCE, label: 'Compliance Management' },
  environmental_compliance: { category: PERMISSION_CATEGORIES.COMPLIANCE, label: 'Environmental Compliance' },
  safety_incidents: { category: PERMISSION_CATEGORIES.SAFETY, label: 'Safety Incidents' },
  insurance_claims: { category: PERMISSION_CATEGORIES.COMPLIANCE, label: 'Insurance Claims' },
  iso_quality: { category: PERMISSION_CATEGORIES.QUALITY, label: 'ISO 9001 QMS' },
  equipment_calibration: { category: PERMISSION_CATEGORIES.QUALITY, label: 'Equipment Calibration' },
  
  // AI & Automation
  ai_chatbot: { category: PERMISSION_CATEGORIES.CHATBOT, label: 'AI Chatbot' },
  ai_chatbot_assistant: { category: PERMISSION_CATEGORIES.CHATBOT, label: 'AI Chatbot Assistant' },
  ai_service_advisor: { category: PERMISSION_CATEGORIES.CHATBOT, label: 'AI Service Advisor' },
  voice_commands: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Voice Commands' },
  voice_interface: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Voice Command Interface' },
  call_center: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Call Center' },
  intelligent_price_optimizer: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Intelligent Price Optimizer' },
  
  // Blockchain & Emerging Tech
  blockchain_history: { category: PERMISSION_CATEGORIES.BLOCKCHAIN, label: 'Blockchain Service History' },
  smart_contracts: { category: PERMISSION_CATEGORIES.BLOCKCHAIN, label: 'Smart Contracts' },
  ar_repair_guide: { category: PERMISSION_CATEGORIES.AR_VR, label: 'AR Repair Guide' },
  vr_showroom: { category: PERMISSION_CATEGORIES.AR_VR, label: 'VR Showroom' },
  drone_inspection: { category: PERMISSION_CATEGORIES.AR_VR, label: 'Drone Inspection' },
  wearable_integration: { category: PERMISSION_CATEGORIES.AR_VR, label: 'Wearable Devices' },
  digital_twin: { category: PERMISSION_CATEGORIES.AR_VR, label: 'Digital Twin Viewer' },
  computer_vision_qc: { category: PERMISSION_CATEGORIES.AR_VR, label: 'Computer Vision QC' },
  iot_dashboard: { category: PERMISSION_CATEGORIES.IOT, label: 'IoT Dashboard' },
  telematics: { category: PERMISSION_CATEGORIES.IOT, label: 'Telematics Integration' },
  edge_computing: { category: PERMISSION_CATEGORIES.AR_VR, label: 'Edge Computing' },
  nextgen_tech: { category: PERMISSION_CATEGORIES.AR_VR, label: 'NextGen Technologies' },
  energy_monitoring: { category: PERMISSION_CATEGORIES.IOT, label: 'Sustainable Energy Monitoring' },
  
  // System Administration
  settings: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Settings' },
  security: { category: PERMISSION_CATEGORIES.SECURITY, label: 'Security' },
  users: { category: PERMISSION_CATEGORIES.SECURITY, label: 'User Management' },
  roles: { category: PERMISSION_CATEGORIES.SECURITY, label: 'Role Management' },
  permissions: { category: PERMISSION_CATEGORIES.SECURITY, label: 'Permission Management' },
  branches: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Branch Management' },
  garages: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Garage Management' },
  integrations: { category: PERMISSION_CATEGORIES.INTEGRATIONS, label: 'Integrations' },
  document_management: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Document Management' },
  data_import_export: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Data Import/Export' },
  notifications: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Notifications' },
  digital_signage: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Digital Signage' },
  security_cameras: { category: PERMISSION_CATEGORIES.SECURITY, label: 'Security Cameras' },
  license_plate_recognition: { category: PERMISSION_CATEGORIES.SECURITY, label: 'License Plate Recognition' },
  kiosk_checkin: { category: PERMISSION_CATEGORIES.SETTINGS, label: 'Kiosk Check-In' },
  
  // Additional Operations
  towing_services: { category: PERMISSION_CATEGORIES.JOB_CARDS, label: 'Towing Services' },
  vehicle_storage: { category: PERMISSION_CATEGORIES.VEHICLES, label: 'Vehicle Storage' },
  tire_management: { category: PERMISSION_CATEGORIES.INVENTORY, label: 'Tire Management' },
  routing_optimizer: { category: PERMISSION_CATEGORIES.AI_FEATURES, label: 'Routing Optimizer' },
  chat: { category: PERMISSION_CATEGORIES.CUSTOMERS, label: 'Chat Support' },
} as const;

// ============================================================================
// STANDARD ROLE TEMPLATES
// ============================================================================

export const STANDARD_ROLES = {
  // System Administrator
  SYSTEM_ADMIN: {
    name: 'System Administrator',
    scope: 'system',
    isSystemRole: true,
    description: 'Full system access with all privileges. Can manage users, roles, settings, and system configuration.',
  },
  
  // Business Owner
  OWNER: {
    name: 'Business Owner',
    scope: 'garage',
    isSystemRole: false,
    description: 'Full access to all garage operations, financials, reports, and business intelligence.',
  },
  
  // General Manager
  GENERAL_MANAGER: {
    name: 'General Manager',
    scope: 'garage',
    isSystemRole: false,
    description: 'Comprehensive management access excluding sensitive financial settings and user management.',
  },
  
  // Service Manager
  SERVICE_MANAGER: {
    name: 'Service Manager',
    scope: 'branch',
    isSystemRole: false,
    description: 'Manages service operations, job cards, technicians, and quality assurance.',
  },
  
  // Service Advisor
  SERVICE_ADVISOR: {
    name: 'Service Advisor',
    scope: 'branch',
    isSystemRole: false,
    description: 'Handles customer interactions, appointments, estimates, job cards, and service tracking.',
  },
  
  // Parts Manager
  PARTS_MANAGER: {
    name: 'Parts Manager',
    scope: 'branch',
    isSystemRole: false,
    description: 'Manages inventory, parts ordering, suppliers, and parts availability.',
  },
  
  // Lead Technician
  LEAD_TECHNICIAN: {
    name: 'Lead Technician',
    scope: 'branch',
    isSystemRole: false,
    description: 'Senior technician with job assignment, quality review, and mentoring capabilities.',
  },
  
  // Technician
  TECHNICIAN: {
    name: 'Technician',
    scope: 'branch',
    isSystemRole: false,
    description: 'Performs vehicle service, diagnostics, and repairs. Access to assigned job cards and technician portal.',
  },
  
  // Finance Manager
  FINANCE_MANAGER: {
    name: 'Finance Manager',
    scope: 'garage',
    isSystemRole: false,
    description: 'Manages invoicing, payments, accounting, profit analysis, and financial reporting.',
  },
  
  // Accountant
  ACCOUNTANT: {
    name: 'Accountant',
    scope: 'garage',
    isSystemRole: false,
    description: 'Handles invoicing, payment processing, expense tracking, and financial reports.',
  },
  
  // HR Manager
  HR_MANAGER: {
    name: 'HR Manager',
    scope: 'garage',
    isSystemRole: false,
    description: 'Manages staff, payroll, performance reviews, training, and compliance.',
  },
  
  // Marketing Manager
  MARKETING_MANAGER: {
    name: 'Marketing Manager',
    scope: 'garage',
    isSystemRole: false,
    description: 'Manages marketing campaigns, customer loyalty, reviews, and social media.',
  },
  
  // Customer Service Representative
  CSR: {
    name: 'Customer Service Representative',
    scope: 'branch',
    isSystemRole: false,
    description: 'Handles customer inquiries, appointments, service tracking, and basic customer management.',
  },
  
  // Receptionist
  RECEPTIONIST: {
    name: 'Receptionist',
    scope: 'branch',
    isSystemRole: false,
    description: 'Front desk operations: appointments, customer check-in, basic inquiries.',
  },
  
  // Quality Control Inspector
  QC_INSPECTOR: {
    name: 'Quality Control Inspector',
    scope: 'branch',
    isSystemRole: false,
    description: 'Reviews completed work, performs quality inspections, and ensures compliance.',
  },
  
  // Warehouse Manager
  WAREHOUSE_MANAGER: {
    name: 'Warehouse Manager',
    scope: 'garage',
    isSystemRole: false,
    description: 'Manages warehouse operations, inventory control, and parts logistics.',
  },
  
  // Franchise Manager
  FRANCHISE_MANAGER: {
    name: 'Franchise Manager',
    scope: 'franchise',
    isSystemRole: false,
    description: 'Oversees multiple branches, franchise operations, and enterprise features.',
  },
  
  // Read-Only Analyst
  ANALYST: {
    name: 'Business Analyst',
    scope: 'garage',
    isSystemRole: false,
    description: 'Read-only access to reports, analytics, and business intelligence.',
  },
  
  // Call Center Agent
  CALL_CENTER_AGENT: {
    name: 'Call Center Agent',
    scope: 'branch',
    isSystemRole: false,
    description: 'Handles customer calls, appointment scheduling, and basic service inquiries.',
  },
  
  // Apprentice Technician
  APPRENTICE: {
    name: 'Apprentice Technician',
    scope: 'branch',
    isSystemRole: false,
    description: 'Entry-level technician with limited access, learning and assisting senior technicians.',
  },
} as const;

// ============================================================================
// ROLE PERMISSION MATRIX
// This defines which permissions each role should have by default
// ============================================================================

export type RolePermissionMatrix = {
  [role: string]: {
    resources: {
      [resource: string]: string[]; // resource: [actions]
    };
  };
};

export const ROLE_PERMISSIONS: RolePermissionMatrix = {
  // System Administrator - Full Access
  SYSTEM_ADMIN: {
    resources: {
      // Grant all actions for all resources
      '*': ['*'], // Wildcard for all permissions
    },
  },
  
  // Business Owner - Full Business Access
  OWNER: {
    resources: {
      // Dashboard & Analytics
      dashboard: [ACTIONS.READ],
      kpi_dashboard: [ACTIONS.READ],
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      custom_reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT],
      business_intelligence: [ACTIONS.READ, ACTIONS.EXPORT],
      business_heatmaps: [ACTIONS.READ],
      profit_analysis: [ACTIONS.READ, ACTIONS.EXPORT],
      customer_ltv: [ACTIONS.READ, ACTIONS.EXPORT],
      fraud_detection: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Customers & Appointments
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      customer_notes: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL, ACTIONS.VIEW_ALL],
      calendar: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Vehicles
      vehicles: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT],
      vehicle_history: [ACTIONS.READ, ACTIONS.EXPORT],
      fleet_management: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Service Operations
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_ALL, ACTIONS.APPROVE, ACTIONS.CANCEL, ACTIONS.EXPORT],
      estimates: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.VIEW_ALL],
      live_tracking: [ACTIONS.READ],
      
      // Financial
      invoices: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.VOID, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      payments: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.REFUND, ACTIONS.VIEW_ALL, ACTIONS.EXPORT],
      refunds: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.MANAGE],
      financial_settings: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
      accounting_integration: [ACTIONS.READ, ACTIONS.MANAGE],
      payroll: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.EXPORT],
      expense_tracking: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.EXPORT],
      
      // Inventory
      inventory: [ACTIONS.READ, ACTIONS.MANAGE, ACTIONS.EXPORT],
      parts_availability: [ACTIONS.READ],
      
      // Staff & HR
      hr_management: [ACTIONS.READ, ACTIONS.MANAGE],
      staff_performance: [ACTIONS.READ, ACTIONS.MANAGE],
      technicians: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Franchise & Enterprise
      franchise_management: [ACTIONS.READ, ACTIONS.MANAGE],
      contract_management: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // System
      settings: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
      users: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      roles: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      permissions: [ACTIONS.READ, ACTIONS.MANAGE],
      branches: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      integrations: [ACTIONS.READ, ACTIONS.MANAGE],
    },
  },
  
  // General Manager
  GENERAL_MANAGER: {
    resources: {
      // Dashboard & Analytics
      dashboard: [ACTIONS.READ],
      kpi_dashboard: [ACTIONS.READ],
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      business_intelligence: [ACTIONS.READ, ACTIONS.EXPORT],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL, ACTIONS.VIEW_ALL, ACTIONS.ASSIGN],
      
      // Vehicles
      vehicles: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT],
      vehicle_inspections: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Service Operations
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_ALL, ACTIONS.APPROVE, ACTIONS.ASSIGN],
      estimates: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.VIEW_ALL],
      tasks: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.ASSIGN],
      
      // Financial (Limited)
      invoices: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      payments: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      
      // Inventory
      inventory: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.EXPORT],
      purchase_orders: [ACTIONS.READ, ACTIONS.APPROVE],
      
      // Staff & HR
      technicians: [ACTIONS.READ, ACTIONS.MANAGE, ACTIONS.ASSIGN],
      staff_performance: [ACTIONS.READ, ACTIONS.MANAGE],
      technician_performance: [ACTIONS.READ],
      
      // Settings (Limited)
      settings: [ACTIONS.READ],
      branches: [ACTIONS.READ],
    },
  },
  
  // Service Manager
  SERVICE_MANAGER: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      kpi_dashboard: [ACTIONS.READ],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      customer_notes: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL, ACTIONS.VIEW_ALL, ACTIONS.ASSIGN],
      calendar: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Vehicles
      vehicles: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      vehicle_inspections: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.MANAGE],
      vehicle_history: [ACTIONS.READ],
      digital_walkaround: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Service Operations
      job_cards: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.ASSIGN, ACTIONS.VIEW_ALL],
      tasks: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.ASSIGN, ACTIONS.MANAGE],
      service_templates: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
      estimates: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.VIEW_ALL],
      video_estimates: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE],
      live_tracking: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Diagnostics
      diagnostics_obd: [ACTIONS.READ, ACTIONS.MANAGE],
      smart_damage_assessment: [ACTIONS.READ, ACTIONS.MANAGE],
      predictive_maintenance: [ACTIONS.READ],
      vehicle_health: [ACTIONS.READ],
      
      // Quality
      iso_quality: [ACTIONS.READ, ACTIONS.MANAGE],
      equipment_calibration: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Technicians
      technicians: [ACTIONS.READ, ACTIONS.ASSIGN, ACTIONS.MANAGE],
      technician_performance: [ACTIONS.READ, ACTIONS.UPDATE],
      technician_leaderboards: [ACTIONS.READ],
      smart_assignment: [ACTIONS.READ, ACTIONS.MANAGE],
      task_management: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.ASSIGN],
      
      // Inventory (Limited)
      inventory: [ACTIONS.READ],
      spare_parts: [ACTIONS.READ],
      parts_availability: [ACTIONS.READ],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      
      // Settings (Read Only)
      settings: [ACTIONS.READ],
    },
  },
  
  // Service Advisor
  SERVICE_ADVISOR: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      customer_notes: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL],
      appointment_reminders: [ACTIONS.READ, ACTIONS.MANAGE],
      calendar: [ACTIONS.READ],
      
      // Vehicles
      vehicles: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      vehicle_inspections: [ACTIONS.READ, ACTIONS.CREATE],
      vehicle_history: [ACTIONS.READ],
      vin_decoder: [ACTIONS.READ],
      digital_walkaround: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Service Operations
      job_cards: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.VIEW_OWN],
      tasks: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      service_templates: [ACTIONS.READ],
      estimates: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      video_estimates: [ACTIONS.READ, ACTIONS.CREATE],
      live_tracking: [ACTIONS.READ],
      
      // Diagnostics
      diagnostics_obd: [ACTIONS.READ],
      smart_damage_assessment: [ACTIONS.READ, ACTIONS.CREATE],
      document_ocr: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Inventory (Read Only)
      inventory: [ACTIONS.READ],
      spare_parts: [ACTIONS.READ],
      parts_availability: [ACTIONS.READ],
      parts_recommendations: [ACTIONS.READ],
      
      // Financial (Limited)
      invoices: [ACTIONS.READ, ACTIONS.CREATE],
      payments: [ACTIONS.READ],
      
      // AI Features
      ai_chatbot_assistant: [ACTIONS.READ],
      ai_service_advisor: [ACTIONS.READ],
      intelligent_price_optimizer: [ACTIONS.READ],
      
      // Customer Experience
      customer_reviews: [ACTIONS.READ],
      chat: [ACTIONS.READ, ACTIONS.CREATE],
      video_consultations: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Settings (Own Profile)
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Parts Manager
  PARTS_MANAGER: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Inventory Management
      inventory: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE, ACTIONS.EXPORT],
      spare_parts: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      tools: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      parts_auto_reorder: [ACTIONS.READ, ACTIONS.MANAGE],
      smart_inventory_forecasting: [ACTIONS.READ, ACTIONS.MANAGE],
      parts_recommendations: [ACTIONS.READ],
      parts_marketplace: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      parts_network: [ACTIONS.READ, ACTIONS.MANAGE],
      parts_availability: [ACTIONS.READ, ACTIONS.MANAGE],
      barcode_scanner: [ACTIONS.READ, ACTIONS.MANAGE],
      tire_management: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Suppliers & Procurement
      suppliers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      purchase_orders: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.MANAGE],
      vendor_portal: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Job Cards (Read for parts)
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Lead Technician
  LEAD_TECHNICIAN: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      technician_portal: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Job Cards & Tasks
      job_cards: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.VIEW_ALL],
      tasks: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.ASSIGN],
      task_management: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.ASSIGN],
      
      // Vehicles & Diagnostics
      vehicles: [ACTIONS.READ],
      vehicle_inspections: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE],
      vehicle_history: [ACTIONS.READ, ACTIONS.CREATE],
      vehicle_health: [ACTIONS.READ],
      diagnostics_obd: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.MANAGE],
      smart_damage_assessment: [ACTIONS.READ, ACTIONS.CREATE],
      predictive_maintenance: [ACTIONS.READ],
      predictive_diagnostics: [ACTIONS.READ],
      document_ocr: [ACTIONS.READ, ACTIONS.CREATE],
      digital_walkaround: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      
      // Inventory (Read)
      inventory: [ACTIONS.READ],
      spare_parts: [ACTIONS.READ],
      tools: [ACTIONS.READ],
      parts_availability: [ACTIONS.READ],
      
      // Quality
      iso_quality: [ACTIONS.READ, ACTIONS.MANAGE],
      equipment_calibration: [ACTIONS.READ],
      
      // Technician Management
      technician_performance: [ACTIONS.READ, ACTIONS.UPDATE],
      technician_leaderboards: [ACTIONS.READ],
      
      // Training
      knowledge_base: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      training_lms: [ACTIONS.READ],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Technician
  TECHNICIAN: {
    resources: {
      // Dashboard & Portal
      dashboard: [ACTIONS.READ],
      technician_portal: [ACTIONS.READ],
      
      // Job Cards & Tasks (Own Only)
      job_cards: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.VIEW_OWN],
      tasks: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.VIEW_OWN],
      
      // Vehicles & Diagnostics
      vehicles: [ACTIONS.READ],
      vehicle_inspections: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      vehicle_history: [ACTIONS.READ],
      vehicle_health: [ACTIONS.READ],
      diagnostics_obd: [ACTIONS.READ, ACTIONS.CREATE],
      smart_damage_assessment: [ACTIONS.READ, ACTIONS.CREATE],
      predictive_maintenance: [ACTIONS.READ],
      document_ocr: [ACTIONS.READ, ACTIONS.CREATE],
      digital_walkaround: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Inventory (Read Only)
      inventory: [ACTIONS.READ],
      spare_parts: [ACTIONS.READ],
      tools: [ACTIONS.READ],
      parts_availability: [ACTIONS.READ],
      barcode_scanner: [ACTIONS.READ],
      
      // Service Templates
      service_templates: [ACTIONS.READ],
      
      // Training
      knowledge_base: [ACTIONS.READ],
      training_lms: [ACTIONS.READ],
      
      // Performance
      technician_performance: [ACTIONS.VIEW_OWN],
      technician_leaderboards: [ACTIONS.READ],
      
      // AR/VR Tools
      ar_repair_guide: [ACTIONS.READ],
      
      // Settings (Own Profile)
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
      timeclock_payroll: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Finance Manager
  FINANCE_MANAGER: {
    resources: {
      // Dashboard & Analytics
      dashboard: [ACTIONS.READ],
      kpi_dashboard: [ACTIONS.READ],
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      business_intelligence: [ACTIONS.READ, ACTIONS.EXPORT],
      profit_analysis: [ACTIONS.READ, ACTIONS.EXPORT],
      customer_ltv: [ACTIONS.READ, ACTIONS.EXPORT],
      fraud_detection: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Financial Operations
      invoices: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.VOID, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      payments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE, ACTIONS.REFUND, ACTIONS.VIEW_ALL, ACTIONS.EXPORT],
      stripe_payments: [ACTIONS.READ, ACTIONS.MANAGE],
      refunds: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE, ACTIONS.MANAGE],
      financial_settings: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
      accounting_integration: [ACTIONS.READ, ACTIONS.MANAGE],
      expense_tracking: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE, ACTIONS.EXPORT],
      payroll: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE, ACTIONS.EXPORT, ACTIONS.MANAGE],
      
      // Customers (Limited)
      customers: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      
      // Job Cards (Read Only)
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      estimates: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Accountant
  ACCOUNTANT: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Financial Operations
      invoices: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      payments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.VIEW_ALL, ACTIONS.EXPORT],
      stripe_payments: [ACTIONS.READ],
      refunds: [ACTIONS.READ, ACTIONS.CREATE],
      accounting_integration: [ACTIONS.READ],
      expense_tracking: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      payroll: [ACTIONS.READ, ACTIONS.EXPORT],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      profit_analysis: [ACTIONS.READ],
      
      // Customers (Read Only)
      customers: [ACTIONS.READ],
      
      // Job Cards (Read Only)
      job_cards: [ACTIONS.READ],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // HR Manager
  HR_MANAGER: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // HR Management
      hr_management: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      staff_performance: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      timesheet_management: [ACTIONS.READ, ACTIONS.MANAGE],
      timeclock_payroll: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Training & Development
      training_lms: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      knowledge_base: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      
      // Users (Limited)
      users: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      
      // Payroll (Limited)
      payroll: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      expense_tracking: [ACTIONS.READ],
      
      // Technicians
      technicians: [ACTIONS.READ],
      technician_performance: [ACTIONS.READ],
      
      // Compliance
      compliance_management: [ACTIONS.READ, ACTIONS.MANAGE],
      safety_incidents: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Marketing Manager
  MARKETING_MANAGER: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Marketing & Campaigns
      marketing_automation: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      email_marketing: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      social_media: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      social_monitoring: [ACTIONS.READ, ACTIONS.MANAGE],
      google_my_business: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Customer Loyalty
      customer_loyalty: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      referral_program: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      customer_reviews: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.EXPORT],
      customer_ltv: [ACTIONS.READ],
      
      // Analytics
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      business_heatmaps: [ACTIONS.READ],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Customer Service Representative
  CSR: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      customer_notes: [ACTIONS.READ, ACTIONS.CREATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL],
      appointment_reminders: [ACTIONS.READ],
      calendar: [ACTIONS.READ],
      
      // Vehicles
      vehicles: [ACTIONS.READ, ACTIONS.CREATE],
      vehicle_history: [ACTIONS.READ],
      vin_decoder: [ACTIONS.READ],
      
      // Service
      job_cards: [ACTIONS.READ],
      live_tracking: [ACTIONS.READ],
      
      // Customer Experience
      chat: [ACTIONS.READ, ACTIONS.CREATE],
      video_consultations: [ACTIONS.READ, ACTIONS.CREATE],
      customer_reviews: [ACTIONS.READ],
      ai_chatbot_assistant: [ACTIONS.READ],
      
      // Call Center
      call_center: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Receptionist
  RECEPTIONIST: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Customers (Limited)
      customers: [ACTIONS.READ, ACTIONS.CREATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      calendar: [ACTIONS.READ],
      
      // Vehicles (Basic)
      vehicles: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Check-In
      kiosk_checkin: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Communication
      chat: [ACTIONS.READ, ACTIONS.CREATE],
      call_center: [ACTIONS.READ],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Quality Control Inspector
  QC_INSPECTOR: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Inspections & Quality
      vehicle_inspections: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.MANAGE],
      digital_walkaround: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.APPROVE],
      smart_damage_assessment: [ACTIONS.READ, ACTIONS.CREATE],
      computer_vision_qc: [ACTIONS.READ, ACTIONS.MANAGE],
      iso_quality: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      equipment_calibration: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      
      // Job Cards (Review)
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_ALL, ACTIONS.APPROVE],
      
      // Diagnostics
      diagnostics_obd: [ACTIONS.READ],
      vehicle_health: [ACTIONS.READ],
      
      // Vehicles
      vehicles: [ACTIONS.READ],
      vehicle_history: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Compliance
      compliance_management: [ACTIONS.READ, ACTIONS.MANAGE],
      safety_incidents: [ACTIONS.READ, ACTIONS.CREATE],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Warehouse Manager
  WAREHOUSE_MANAGER: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Inventory
      inventory: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE, ACTIONS.EXPORT],
      spare_parts: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      tools: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      parts_auto_reorder: [ACTIONS.READ, ACTIONS.MANAGE],
      smart_inventory_forecasting: [ACTIONS.READ],
      parts_availability: [ACTIONS.READ, ACTIONS.MANAGE],
      barcode_scanner: [ACTIONS.READ, ACTIONS.MANAGE],
      tire_management: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Vehicle Storage
      vehicle_storage: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      loaner_vehicles: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Suppliers
      suppliers: [ACTIONS.READ],
      purchase_orders: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      
      // Reports
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
      
      // Settings
      settings: [ACTIONS.READ],
    },
  },
  
  // Franchise Manager
  FRANCHISE_MANAGER: {
    resources: {
      // Dashboard & Analytics
      dashboard: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      kpi_dashboard: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      reports: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      business_intelligence: [ACTIONS.READ, ACTIONS.EXPORT, ACTIONS.VIEW_ALL],
      
      // Franchise Management
      franchise_management: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      branches: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      
      // Enterprise Features
      oem_software: [ACTIONS.READ, ACTIONS.MANAGE],
      globalization: [ACTIONS.READ, ACTIONS.MANAGE],
      contract_management: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Users & Roles
      users: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      roles: [ACTIONS.READ, ACTIONS.ASSIGN],
      
      // Financial (Overview)
      invoices: [ACTIONS.READ, ACTIONS.VIEW_ALL, ACTIONS.EXPORT],
      payments: [ACTIONS.READ, ACTIONS.VIEW_ALL, ACTIONS.EXPORT],
      profit_analysis: [ACTIONS.READ, ACTIONS.EXPORT],
      
      // Inventory (Overview)
      inventory: [ACTIONS.READ, ACTIONS.VIEW_ALL],
      parts_network: [ACTIONS.READ, ACTIONS.MANAGE],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.MANAGE],
      integrations: [ACTIONS.READ, ACTIONS.MANAGE],
    },
  },
  
  // Business Analyst (Read-Only)
  ANALYST: {
    resources: {
      // Dashboard & Analytics
      dashboard: [ACTIONS.READ],
      kpi_dashboard: [ACTIONS.READ],
      reports: [ACTIONS.READ, ACTIONS.EXPORT],
      custom_reports: [ACTIONS.READ, ACTIONS.EXPORT],
      business_intelligence: [ACTIONS.READ, ACTIONS.EXPORT],
      business_heatmaps: [ACTIONS.READ],
      profit_analysis: [ACTIONS.READ, ACTIONS.EXPORT],
      customer_ltv: [ACTIONS.READ, ACTIONS.EXPORT],
      fraud_detection: [ACTIONS.READ],
      
      // Data (Read Only)
      customers: [ACTIONS.READ, ACTIONS.EXPORT],
      vehicles: [ACTIONS.READ, ACTIONS.EXPORT],
      job_cards: [ACTIONS.READ, ACTIONS.EXPORT],
      invoices: [ACTIONS.READ, ACTIONS.EXPORT],
      payments: [ACTIONS.READ, ACTIONS.EXPORT],
      inventory: [ACTIONS.READ, ACTIONS.EXPORT],
      technician_performance: [ACTIONS.READ],
      staff_performance: [ACTIONS.READ],
      
      // Settings (Read Only)
      settings: [ACTIONS.READ],
    },
  },
  
  // Call Center Agent
  CALL_CENTER_AGENT: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      
      // Call Center
      call_center: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.MANAGE],
      
      // Customers
      customers: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
      customer_profiles: [ACTIONS.READ, ACTIONS.UPDATE],
      customer_notes: [ACTIONS.READ, ACTIONS.CREATE],
      appointments: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.CANCEL],
      calendar: [ACTIONS.READ],
      
      // Vehicles (Basic)
      vehicles: [ACTIONS.READ, ACTIONS.CREATE],
      vin_decoder: [ACTIONS.READ],
      
      // Service (Basic Info)
      job_cards: [ACTIONS.READ],
      live_tracking: [ACTIONS.READ],
      
      // Communication
      chat: [ACTIONS.READ, ACTIONS.CREATE],
      ai_chatbot_assistant: [ACTIONS.READ],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
  
  // Apprentice Technician
  APPRENTICE: {
    resources: {
      // Dashboard
      dashboard: [ACTIONS.READ],
      technician_portal: [ACTIONS.READ],
      
      // Job Cards (Own, Limited)
      job_cards: [ACTIONS.READ, ACTIONS.VIEW_OWN],
      tasks: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.VIEW_OWN],
      
      // Vehicles (Read Only)
      vehicles: [ACTIONS.READ],
      vehicle_inspections: [ACTIONS.READ],
      vehicle_history: [ACTIONS.READ],
      
      // Diagnostics (Limited)
      diagnostics_obd: [ACTIONS.READ],
      digital_walkaround: [ACTIONS.READ],
      
      // Inventory (Read Only)
      inventory: [ACTIONS.READ],
      spare_parts: [ACTIONS.READ],
      tools: [ACTIONS.READ],
      
      // Training
      knowledge_base: [ACTIONS.READ],
      training_lms: [ACTIONS.READ],
      
      // Performance
      technician_performance: [ACTIONS.VIEW_OWN],
      
      // Settings
      settings: [ACTIONS.READ, ACTIONS.EDIT_OWN],
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllResourceKeys(): string[] {
  return Object.keys(RESOURCES);
}

export function getAllActionKeys(): string[] {
  return Object.values(ACTIONS);
}

export function getCategorizedResources() {
  const categorized: Record<string, Array<{key: string, category: string, label: string}>> = {};
  
  Object.entries(RESOURCES).forEach(([key, resource]) => {
    if (!categorized[resource.category]) {
      categorized[resource.category] = [];
    }
    categorized[resource.category].push({ key, category: resource.category, label: resource.label });
  });
  
  return categorized;
}

export function getRolePermissions(roleName: keyof typeof ROLE_PERMISSIONS) {
  return ROLE_PERMISSIONS[roleName];
}

export function hasPermission(
  userPermissions: { resource: string; action: string }[],
  resource: string,
  action: string
): boolean {
  // Check for wildcard permission
  const hasWildcard = userPermissions.some(
    p => (p.resource === '*' && p.action === '*') ||
         (p.resource === resource && p.action === '*') ||
         (p.resource === '*' && p.action === action)
  );
  
  if (hasWildcard) return true;
  
  // Check for exact permission
  return userPermissions.some(
    p => p.resource === resource && p.action === action
  );
}
