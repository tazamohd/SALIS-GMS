# SALIS AUTO API Reference (OpenAPI 3.0)

**Version:** 1.0.0  
**Base URL:** `https://your-domain.replit.app/api`  
**Authentication:** Session-based + JWT Bearer tokens

---

## OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: SALIS AUTO API
  description: Comprehensive automotive ERP platform API
  version: 1.0.0
  contact:
    email: api@salis-auto.com

servers:
  - url: https://your-domain.replit.app/api
    description: Production server
  - url: http://localhost:5000/api
    description: Development server

security:
  - sessionAuth: []
  - bearerAuth: []

components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: connect.sid
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, manager, technician, customer]
        phone:
          type: string
        createdAt:
          type: string
          format: date-time

    Customer:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        state:
          type: string
        zipCode:
          type: string
        notes:
          type: string

    Vehicle:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customerId:
          type: string
          format: uuid
        make:
          type: string
        model:
          type: string
        year:
          type: integer
        vin:
          type: string
        licensePlate:
          type: string
        currentMileage:
          type: integer
        color:
          type: string

    JobCard:
      type: object
      properties:
        id:
          type: string
          format: uuid
        jobNumber:
          type: string
        customerId:
          type: string
          format: uuid
        vehicleId:
          type: string
          format: uuid
        serviceType:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed, cancelled]
        assignedTo:
          type: string
          format: uuid
        estimatedCompletionTime:
          type: string
        actualCompletionTime:
          type: string
        totalCost:
          type: number
          format: decimal

    Invoice:
      type: object
      properties:
        id:
          type: string
          format: uuid
        invoiceNumber:
          type: string
        customerId:
          type: string
          format: uuid
        jobCardId:
          type: string
          format: uuid
        invoiceDate:
          type: string
          format: date
        dueDate:
          type: string
          format: date
        subtotal:
          type: number
          format: decimal
        taxAmount:
          type: number
          format: decimal
        totalAmount:
          type: number
          format: decimal
        status:
          type: string
          enum: [pending, paid, overdue, cancelled]

    Error:
      type: object
      properties:
        message:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/register:
    post:
      summary: User registration
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
                - name
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
                name:
                  type: string
                phone:
                  type: string
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /customers:
    get:
      summary: List all customers
      tags: [Customers]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Customer'
        '401':
          description: Unauthorized

    post:
      summary: Create new customer
      tags: [Customers]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Customer'
      responses:
        '201':
          description: Customer created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'
        '400':
          description: Validation error

  /customers/{id}:
    get:
      summary: Get customer by ID
      tags: [Customers]
      security:
        - sessionAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'
        '404':
          description: Customer not found

    patch:
      summary: Update customer
      tags: [Customers]
      security:
        - sessionAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Customer'
      responses:
        '200':
          description: Customer updated
        '404':
          description: Customer not found

    delete:
      summary: Delete customer
      tags: [Customers]
      security:
        - sessionAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Customer deleted
        '404':
          description: Customer not found

  /vehicles:
    get:
      summary: List all vehicles
      tags: [Vehicles]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Vehicle'

    post:
      summary: Create new vehicle
      tags: [Vehicles]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Vehicle'
      responses:
        '201':
          description: Vehicle created

  /job-cards:
    get:
      summary: List all job cards
      tags: [Job Cards]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/JobCard'

    post:
      summary: Create new job card
      tags: [Job Cards]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JobCard'
      responses:
        '201':
          description: Job card created

  /invoices:
    get:
      summary: List all invoices
      tags: [Invoices]
      security:
        - sessionAuth: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Invoice'

    post:
      summary: Create new invoice
      tags: [Invoices]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Invoice'
      responses:
        '201':
          description: Invoice created

  /ai/chat:
    post:
      summary: AI chatbot streaming responses
      tags: [AI Services]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                context:
                  type: object
      responses:
        '200':
          description: Success
          content:
            text/event-stream:
              schema:
                type: string

  /ai/predictive-maintenance:
    post:
      summary: Get predictive maintenance recommendations
      tags: [AI Services]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                vehicleId:
                  type: string
                  format: uuid
                mileage:
                  type: integer
                serviceHistory:
                  type: array
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  predictions:
                    type: array
                    items:
                      type: object
                      properties:
                        service:
                          type: string
                        probability:
                          type: number
                        recommendedDate:
                          type: string

  /analytics/business-intelligence:
    get:
      summary: Get business intelligence metrics
      tags: [Analytics]
      security:
        - sessionAuth: []
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalRevenue:
                    type: number
                  totalJobs:
                    type: integer
                  averageJobValue:
                    type: number
                  topServices:
                    type: array

tags:
  - name: Authentication
    description: User authentication operations
  - name: Customers
    description: Customer management
  - name: Vehicles
    description: Vehicle management
  - name: Job Cards
    description: Job card operations
  - name: Invoices
    description: Invoice management
  - name: AI Services
    description: AI-powered features
  - name: Analytics
    description: Business analytics
```

---

## Rate Limiting

- **Authenticated requests:** 1000 requests/hour
- **Unauthenticated requests:** 100 requests/hour
- **Upload endpoints:** 100 requests/hour

## Pagination

All list endpoints support pagination:
```
?page=1&limit=20
```

## Error Codes

- `400` Bad Request - Validation error
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

## Testing

**Swagger UI (Future):** `/api-docs`  
**Postman Collection:** Available in `docs/postman/`

---

**Last Updated:** November 3, 2025
