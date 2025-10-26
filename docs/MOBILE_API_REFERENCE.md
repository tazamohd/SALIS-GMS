# SALIS AUTO Mobile API Reference

**Version:** 1.0.0  
**Base URL:** `/api/mobile`  
**Authentication:** JWT Bearer Token Required

---

## Authentication

All mobile API endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "technician"
  }
}
```

---

## Technician Mobile App API

### Get Assigned Job Cards

Retrieve all job cards assigned to the authenticated technician.

```http
GET /api/mobile/technician/jobs
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "job-123",
    "jobNumber": "JOB-001",
    "customer": "John Doe",
    "vehicle": "2020 Honda Civic",
    "status": "in_progress",
    "assignedTo": "tech-456",
    "services": ["Oil Change", "Brake Inspection"]
  }
]
```

---

### Update Job Card Status

Update the status and details of a job card.

```http
PATCH /api/mobile/technician/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Completed oil change and brake inspection"
}
```

**Response:**
```json
{
  "id": "job-123",
  "status": "completed",
  "notes": "Completed oil change and brake inspection",
  "updatedAt": "2024-10-26T15:30:00Z"
}
```

---

### Clock In/Out

Record time entry for technician shifts.

```http
POST /api/mobile/technician/time-entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "clock_in",
  "jobCardId": "job-123",
  "timestamp": "2024-10-26T08:00:00Z"
}
```

**Parameters:**
- `action` (string): Either "clock_in" or "clock_out"
- `jobCardId` (string, optional): Associated job card
- `timestamp` (string, optional): ISO 8601 timestamp (defaults to now)

**Response:**
```json
{
  "id": "time-entry-new",
  "technicianId": "tech-456",
  "action": "clock_in",
  "jobCardId": "job-123",
  "timestamp": "2024-10-26T08:00:00Z",
  "message": "Successfully clocked in"
}
```

---

### Upload Media (Photos/Videos)

Upload photos or videos from mobile device.

```http
POST /api/mobile/uploads
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobCardId": "job-123",
  "mediaType": "photo",
  "filename": "damage-front-bumper.jpg",
  "base64Data": "data:image/jpeg;base64,..."
}
```

**Parameters:**
- `jobCardId` (string): Associated job card
- `mediaType` (string): "photo" or "video"
- `filename` (string): Original filename
- `base64Data` (string): Base64-encoded media data

**Response:**
```json
{
  "uploadUrl": "https://storage.salis-auto.com/uploads/job-123/damage-front-bumper.jpg",
  "mediaType": "photo",
  "filename": "damage-front-bumper.jpg",
  "message": "Media uploaded successfully"
}
```

---

### Scan Barcode for Part Lookup

Scan barcode/QR code to lookup part information.

```http
GET /api/mobile/parts/scan/:barcode
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/mobile/parts/scan/123456789012
```

**Response:**
```json
{
  "barcode": "123456789012",
  "partNumber": "PN-123456789012",
  "partName": "Oil Filter",
  "inStock": true,
  "quantity": 45,
  "price": 12.99,
  "location": "Aisle 3, Shelf B"
}
```

---

## Customer Mobile App API

### Get Customer Vehicles

Retrieve all vehicles owned by the authenticated customer.

```http
GET /api/mobile/customer/vehicles
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "vehicle-123",
    "make": "Honda",
    "model": "Civic",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC 1234",
    "mileage": 45000
  }
]
```

---

### Get Customer Appointments

Retrieve all appointments for the authenticated customer.

```http
GET /api/mobile/customer/appointments
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "apt-123",
    "vehicleId": "vehicle-123",
    "scheduledDate": "2024-10-28T10:00:00Z",
    "services": ["Oil Change", "Tire Rotation"],
    "status": "confirmed"
  }
]
```

---

### Book New Appointment

Create a new service appointment.

```http
POST /api/mobile/customer/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle-123",
  "scheduledDate": "2024-10-28T10:00:00Z",
  "services": ["Oil Change", "Tire Rotation"],
  "notes": "Please check brake noise"
}
```

**Response:**
```json
{
  "id": "apt-new",
  "customerId": "customer-789",
  "vehicleId": "vehicle-123",
  "scheduledDate": "2024-10-28T10:00:00Z",
  "services": ["Oil Change", "Tire Rotation"],
  "status": "confirmed",
  "message": "Appointment booked successfully"
}
```

---

### Get Customer Invoices

Retrieve all invoices for the authenticated customer.

```http
GET /api/mobile/customer/invoices
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "inv-123",
    "invoiceNumber": "INV-001",
    "amount": 125.50,
    "status": "paid",
    "dueDate": "2024-10-30",
    "services": ["Oil Change", "Tire Rotation"]
  }
]
```

---

### Process Mobile Payment

Process payment for an invoice using saved payment method.

```http
POST /api/mobile/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "invoiceId": "inv-123",
  "amount": 125.50,
  "paymentMethodId": "pm_123456"
}
```

**Response:**
```json
{
  "id": "payment-new",
  "invoiceId": "inv-123",
  "amount": 125.50,
  "customerId": "customer-789",
  "status": "succeeded",
  "message": "Payment processed successfully"
}
```

---

### Live Job Tracking

Get real-time updates on service progress.

```http
GET /api/mobile/customer/tracking/:jobId
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/mobile/customer/tracking/job-123
```

**Response:**
```json
{
  "jobId": "job-123",
  "status": "in_progress",
  "progress": 65,
  "currentStep": "Engine diagnostics in progress",
  "estimatedCompletion": "2024-10-26T16:00:00Z",
  "updates": [
    {
      "time": "2024-10-26T09:00:00Z",
      "message": "Vehicle checked in"
    },
    {
      "time": "2024-10-26T09:30:00Z",
      "message": "Initial inspection completed"
    },
    {
      "time": "2024-10-26T10:15:00Z",
      "message": "Engine diagnostics started"
    }
  ]
}
```

---

### Submit Review

Submit a review for a completed service.

```http
POST /api/mobile/customer/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobCardId": "job-123",
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
```

**Response:**
```json
{
  "id": "review-new",
  "jobCardId": "job-123",
  "customerId": "customer-789",
  "rating": 5,
  "comment": "Excellent service! Very professional.",
  "createdAt": "2024-10-26T15:30:00Z",
  "message": "Review submitted successfully"
}
```

---

## Manager Mobile App API

### Get Manager Dashboard KPIs

Retrieve real-time key performance indicators.

```http
GET /api/mobile/manager/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "todayRevenue": 12450,
  "activeJobs": 23,
  "technicianUtilization": 87,
  "customerSatisfaction": 4.7,
  "pendingApprovals": 5,
  "trends": {
    "revenueChange": 12.5,
    "jobsChange": -3.2,
    "utilizationChange": 5.1,
    "satisfactionChange": 0.3
  }
}
```

---

### Get Pending Approvals

Retrieve all items awaiting manager approval.

```http
GET /api/mobile/manager/approvals
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "1",
    "type": "estimate",
    "customer": "John Smith",
    "amount": 450,
    "vehicle": "2020 Honda Civic",
    "status": "pending"
  },
  {
    "id": "2",
    "type": "time_off",
    "employee": "Mike Davis",
    "startDate": "2024-11-01",
    "endDate": "2024-11-05",
    "status": "pending"
  }
]
```

**Approval Types:**
- `estimate` - Customer estimate approval
- `time_off` - Employee time off request
- `refund` - Customer refund request

---

### Approve/Reject Item

Process an approval request.

```http
PATCH /api/mobile/manager/approvals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "notes": "Approved - customer is a valued client"
}
```

**Parameters:**
- `action` (string): Either "approve" or "reject"
- `notes` (string, optional): Manager notes

**Response:**
```json
{
  "id": "1",
  "status": "approved",
  "notes": "Approved - customer is a valued client",
  "message": "Successfully approved"
}
```

---

### Get Team Overview

Retrieve current team status and performance.

```http
GET /api/mobile/manager/team
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "Mike Davis",
    "role": "Lead Technician",
    "status": "active",
    "currentJob": "JOB-1234",
    "utilization": 92
  },
  {
    "id": "2",
    "name": "Emily Brown",
    "role": "Technician",
    "status": "active",
    "currentJob": "JOB-1235",
    "utilization": 88
  }
]
```

**Status Values:**
- `active` - Currently working
- `on_break` - On break
- `off_duty` - Not working today

---

### Get Financial Reports

Retrieve financial analytics and reports.

```http
GET /api/mobile/manager/reports?period=today
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string): "today", "week", or "month"

**Response:**
```json
{
  "period": "today",
  "totalRevenue": 45890,
  "totalExpenses": 23450,
  "netProfit": 22440,
  "profitMargin": 48.9,
  "breakdown": {
    "labor": 18500,
    "parts": 15670,
    "other": 11720
  },
  "topServices": [
    {
      "service": "Oil Change",
      "revenue": 8900,
      "count": 45
    },
    {
      "service": "Brake Repair",
      "revenue": 12300,
      "count": 18
    }
  ]
}
```

---

### Get Critical Alerts

Retrieve high-priority notifications requiring attention.

```http
GET /api/mobile/manager/alerts
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "1",
    "type": "safety",
    "severity": "high",
    "message": "Safety incident reported in Bay 2",
    "timestamp": "2024-10-26T14:30:00Z"
  },
  {
    "id": "2",
    "type": "inventory",
    "severity": "medium",
    "message": "Low stock alert: Oil filters (5 remaining)",
    "timestamp": "2024-10-26T13:15:00Z"
  }
]
```

**Alert Types:**
- `safety` - Safety incidents
- `inventory` - Stock alerts
- `customer` - Customer complaints
- `system` - System issues

**Severity Levels:**
- `high` - Immediate action required
- `medium` - Action needed soon
- `low` - Informational

---

## Error Responses

All endpoints follow a consistent error response format:

### 400 Bad Request
```json
{
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "vehicleId",
      "message": "Vehicle ID is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An internal error occurred. Please try again later."
}
```

---

## Rate Limiting

Mobile API endpoints are rate-limited to:
- **Authenticated requests:** 1000 requests per hour
- **Upload endpoints:** 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635264000
```

---

## Pagination

Endpoints that return lists support pagination:

```http
GET /api/mobile/customer/invoices?page=1&limit=20
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)

**Response includes pagination metadata:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 157,
    "pages": 8
  }
}
```

---

## Webhooks (Future)

Mobile apps can register for push notifications via webhooks:

- Job status updates
- Appointment reminders
- Payment confirmations
- Critical alerts

Documentation will be updated when webhook support is available.

---

## Support

For API support or to report issues:
- **Email:** api-support@salis-auto.com
- **Developer Portal:** https://developers.salis-auto.com
- **Status Page:** https://status.salis-auto.com

**Last Updated:** October 26, 2024
