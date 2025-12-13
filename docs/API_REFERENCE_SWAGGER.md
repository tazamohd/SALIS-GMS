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

    LedgerAccount:
      type: object
      properties:
        id:
          type: string
          format: uuid
        accountCode:
          type: string
        accountName:
          type: string
        accountNameAr:
          type: string
        accountType:
          type: string
          enum: [asset, liability, equity, revenue, expense]
        balance:
          type: number
          format: decimal
        isActive:
          type: boolean

    JournalEntry:
      type: object
      properties:
        id:
          type: string
          format: uuid
        entryNumber:
          type: string
        entryDate:
          type: string
          format: date
        description:
          type: string
        debitAccountId:
          type: string
          format: uuid
        creditAccountId:
          type: string
          format: uuid
        amount:
          type: number
          format: decimal
        status:
          type: string
          enum: [draft, posted, reversed]

    CostCenter:
      type: object
      properties:
        id:
          type: string
          format: uuid
        code:
          type: string
        name:
          type: string
        nameAr:
          type: string
        budgetAmount:
          type: number
          format: decimal
        actualAmount:
          type: number
          format: decimal
        variance:
          type: number
          format: decimal

    Budget:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        fiscalYear:
          type: integer
        totalAmount:
          type: number
          format: decimal
        allocatedAmount:
          type: number
          format: decimal
        spentAmount:
          type: number
          format: decimal
        status:
          type: string
          enum: [draft, approved, active, closed]

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

  /accounting/general-ledger:
    get:
      summary: List all ledger accounts
      tags: [Accounting]
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
                      $ref: '#/components/schemas/LedgerAccount'

  /accounting/journal-entries:
    get:
      summary: List all journal entries
      tags: [Accounting]
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
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/JournalEntry'

    post:
      summary: Create new journal entry
      tags: [Accounting]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/JournalEntry'
      responses:
        '201':
          description: Journal entry created

  /accounting/trial-balance:
    get:
      summary: Get trial balance report
      tags: [Accounting]
      security:
        - sessionAuth: []
      parameters:
        - name: asOfDate
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
                  totalDebits:
                    type: number
                  totalCredits:
                    type: number
                  accounts:
                    type: array

  /accounting/income-statement:
    get:
      summary: Get income statement (P&L)
      tags: [Accounting]
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
                  totalExpenses:
                    type: number
                  netIncome:
                    type: number

  /accounting/balance-sheet:
    get:
      summary: Get balance sheet
      tags: [Accounting]
      security:
        - sessionAuth: []
      parameters:
        - name: asOfDate
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
                  totalAssets:
                    type: number
                  totalLiabilities:
                    type: number
                  totalEquity:
                    type: number

  /accounting/cash-flow:
    get:
      summary: Get cash flow statement
      tags: [Accounting]
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
                  operatingActivities:
                    type: number
                  investingActivities:
                    type: number
                  financingActivities:
                    type: number
                  netCashFlow:
                    type: number

  /accounting/accounts-receivable:
    get:
      summary: Get accounts receivable aging
      tags: [Accounting]
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
                  current:
                    type: number
                  days30:
                    type: number
                  days60:
                    type: number
                  days90Plus:
                    type: number
                  totalReceivable:
                    type: number

  /accounting/accounts-payable:
    get:
      summary: Get accounts payable aging
      tags: [Accounting]
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
                  current:
                    type: number
                  days30:
                    type: number
                  days60:
                    type: number
                  days90Plus:
                    type: number
                  totalPayable:
                    type: number

  /accounting/cost-centers:
    get:
      summary: List all cost centers
      tags: [Accounting]
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
                      $ref: '#/components/schemas/CostCenter'

  /accounting/budgets:
    get:
      summary: List all budgets
      tags: [Accounting]
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
                      $ref: '#/components/schemas/Budget'

    post:
      summary: Create new budget
      tags: [Accounting]
      security:
        - sessionAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Budget'
      responses:
        '201':
          description: Budget created

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
  - name: Accounting
    description: Financial accounting and reporting
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

**Last Updated:** December 13, 2025
