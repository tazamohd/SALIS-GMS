# SALIS AUTO - Authentication System Guide

## Overview

The SALIS AUTO Garage Management System now uses **email/password authentication** instead of Replit Auth. This provides direct control over user management and role-based access.

## Authentication Features

✅ **Email/Password Login** - Secure bcrypt password hashing  
✅ **User Registration** - Self-service account creation  
✅ **Role-Based Access Control** - 7 different user roles  
✅ **Session Management** - PostgreSQL-backed sessions  
✅ **Secure Logout** - Proper session cleanup  

---

## Test User Accounts

All test users have been pre-created with the following credentials:

### Administrator Access
- **Email:** admin@salisauto.com  
  **Password:** motaz@6646  
  **Role:** Super Admin  
  **Description:** Full system access for administration

### General Testing
- **Email:** testuser@salisauto.com  
  **Password:** 1234abcd  
  **Role:** Garage Manager  
  **Description:** Standard testing account

### Role-Specific Users

#### Garage Manager
- **Email:** manager@salisauto.com  
  **Password:** Manager123!  
  **Role:** Garage Manager  

#### Branch Manager
- **Email:** branchmanager@salisauto.com  
  **Password:** Branch123!  
  **Role:** Branch Manager  

#### Lead Technician
- **Email:** leadtech@salisauto.com  
  **Password:** Lead123!  
  **Role:** Lead Technician  

#### Technician
- **Email:** technician@salisauto.com  
  **Password:** Tech123!  
  **Role:** Technician  

#### Assistant
- **Email:** assistant@salisauto.com  
  **Password:** Assist123!  
  **Role:** Assistant  

---

## User Roles & Permissions

### 1. Super Admin
- Full system access
- User management
- System configuration
- All garage operations

### 2. Garage Manager
- Manage garage operations
- View reports and analytics
- Manage inventory and orders
- Oversee technicians

### 3. Branch Manager
- Manage branch-specific operations
- Assign tasks to technicians
- View branch reports
- Handle customer relations

### 4. Lead Technician
- Oversee technical staff
- Assign and review work
- Technical decision making
- Quality control

### 5. Technician
- Perform repairs and maintenance
- Update job cards
- Log parts usage
- Complete assigned tasks

### 6. Assistant
- Administrative support
- Customer communication
- Appointment scheduling
- Basic data entry

---

## Authentication Endpoints

### Login
- **URL:** `POST /api/login`
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** User object (without password)

### Register
- **URL:** `POST /api/register`
- **Body:** `{ "email": "user@example.com", "password": "password123", "fullName": "John Doe", "phone": "+1234567890" }`
- **Response:** User object (without password)

### Logout
- **URL:** `POST /api/logout`
- **Response:** `{ "message": "Logged out successfully" }`

### Get Current User
- **URL:** `GET /api/auth/user`
- **Headers:** Requires authenticated session
- **Response:** User object (without password)

---

## Frontend Routes

### Public Routes (No Authentication Required)
- `/` - Landing page with login/register buttons
- `/login` - Login form
- `/register` - Registration form

### Protected Routes (Authentication Required)
- `/dashboard` - Main dashboard
- `/job-cards` - Job card management
- `/customers` - Customer management
- `/vehicles` - Vehicle management
- All other application routes...

---

## Security Features

1. **Password Hashing** - Bcrypt with 10 salt rounds
2. **Session Storage** - PostgreSQL-backed sessions
3. **HTTP-Only Cookies** - Prevents XSS attacks
4. **Secure Cookies** - HTTPS-only in production
5. **Password Field Protection** - Never returned in API responses
6. **Audit Logging** - All user actions are logged

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  profile_image_url VARCHAR(500),
  national_id VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  access_end_date TIMESTAMP,
  garage_id UUID REFERENCES garages(id),
  user_type VARCHAR(50),
  first_name VARCHAR,
  last_name VARCHAR,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

---

## Migration from Replit Auth

The following changes were made during migration:

1. **Removed:**
   - Replit OIDC authentication
   - `openid-client` dependency
   - Token refresh logic
   - External OAuth providers

2. **Added:**
   - Local email/password authentication
   - Password hashing with bcrypt
   - Direct user management
   - Custom login/register pages

3. **Updated:**
   - All route handlers to use `req.user` directly
   - Session management to use local strategy
   - User creation to include password field

---

## Troubleshooting

### Login Issues
- **Clear Sessions:** Old sessions may cause issues. Clear browser cookies or delete sessions from database:
  ```sql
  DELETE FROM sessions;
  ```

### Password Reset
- Currently, password reset must be done manually via database:
  ```sql
  UPDATE users 
  SET password = '[hashed_password]' 
  WHERE email = 'user@example.com';
  ```

### Role Assignment
- Roles are assigned via the `user_role_branch` table
- Use the seed script to create users with roles:
  ```bash
  cd server && npx tsx seedUsers.ts
  ```

---

## Files Reference

- **Frontend:**
  - `client/src/pages/Login.tsx` - Login page
  - `client/src/pages/Register.tsx` - Registration page
  - `client/src/pages/Landing.tsx` - Landing page
  - `client/src/hooks/useAuth.ts` - Authentication hook

- **Backend:**
  - `server/auth.ts` - Authentication logic
  - `server/routes.ts` - API routes
  - `server/storage.ts` - Database operations
  - `server/seedUsers.ts` - User seeding script

- **Database:**
  - `shared/schema.ts` - Database schema definitions

- **Documentation:**
  - `user_credentials.csv` - All user credentials in CSV format
  - `AUTHENTICATION_GUIDE.md` - This file

---

## Production Deployment

Before deploying to production:

1. **Update Environment Variables:**
   - Ensure `SESSION_SECRET` is set securely
   - Set `NODE_ENV=production`
   - Verify `DATABASE_URL` is correct

2. **Database Migration:**
   - Run `npm run db:push` to apply schema changes
   - Run seed script to create initial users

3. **Security Checklist:**
   - Enable HTTPS
   - Set secure cookie flags
   - Implement rate limiting on login endpoint
   - Add password strength requirements
   - Implement password reset functionality
   - Add email verification (optional)

4. **Build Application:**
   ```bash
   npm run build
   ```

---

## Support

For issues or questions, refer to:
- Database schema: `shared/schema.ts`
- User credentials: `user_credentials.csv`
- Authentication code: `server/auth.ts`

---

**Last Updated:** October 20, 2025  
**Version:** 2.0.0 (Post-Replit Auth Migration)
