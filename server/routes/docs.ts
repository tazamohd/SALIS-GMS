import { Router } from 'express';

const router = Router();

const apiDocs = {
  openapi: '3.0.3',
  info: {
    title: 'SALIS AUTO API',
    version: '1.0.0',
    description: 'Automotive ERP Platform — Garage Management System API',
  },
  servers: [{ url: '/api', description: 'API Server' }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Customers', description: 'Customer management' },
    { name: 'Vehicles', description: 'Vehicle management' },
    { name: 'Job Cards', description: 'Job card & task management' },
    { name: 'Invoices', description: 'Invoice management' },
    { name: 'Appointments', description: 'Appointment scheduling' },
    { name: 'Inventory', description: 'Parts & inventory' },
    { name: 'Fleet', description: 'Fleet management' },
    { name: 'HR', description: 'Human resources' },
    { name: 'Notifications', description: 'Notification system' },
    { name: 'Reports', description: 'Analytics & reporting' },
    { name: 'System', description: 'System health & monitoring' },
  ],
  paths: {
    '/auth/user': { get: { summary: 'Get current user', tags: ['Auth'] } },
    '/login': { post: { summary: 'Login', tags: ['Auth'] } },
    '/register': { post: { summary: 'Register', tags: ['Auth'] } },
    '/logout': { post: { summary: 'Logout', tags: ['Auth'] } },
    '/customers': { get: { summary: 'List customers', tags: ['Customers'] }, post: { summary: 'Create customer', tags: ['Customers'] } },
    '/vehicles': { get: { summary: 'List vehicles', tags: ['Vehicles'] }, post: { summary: 'Create vehicle', tags: ['Vehicles'] } },
    '/job-cards': { get: { summary: 'List job cards', tags: ['Job Cards'] }, post: { summary: 'Create job card', tags: ['Job Cards'] } },
    '/invoices': { get: { summary: 'List invoices', tags: ['Invoices'] }, post: { summary: 'Create invoice', tags: ['Invoices'] } },
    '/appointments': { get: { summary: 'List appointments', tags: ['Appointments'] }, post: { summary: 'Create appointment', tags: ['Appointments'] } },
    '/spare-parts': { get: { summary: 'List spare parts', tags: ['Inventory'] } },
    '/fleet/groups': { get: { summary: 'List fleet groups', tags: ['Fleet'] } },
    '/hr/departments': { get: { summary: 'List HR departments', tags: ['HR'] } },
    '/notifications': { get: { summary: 'List notifications', tags: ['Notifications'] } },
    '/reports/overview': { get: { summary: 'Reports overview', tags: ['Reports'] } },
    '/health': { get: { summary: 'Health check', tags: ['System'] } },
    '/ready': { get: { summary: 'Readiness check', tags: ['System'] } },
  },
  components: {
    securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: 'connect.sid' } },
  },
};

router.get('/docs', (_req, res) => {
  res.json(apiDocs);
});

export default router;
