/**
 * HR repository (Phase E4). The only data-layer access for the HR/payroll
 * domain — employee directory raw SQL, the employee INSERT, attendance/payroll
 * source rows, and the leave-request storage delegations. Query text is lifted
 * verbatim from `server/routes/hr-payroll.ts`.
 */

import { db } from '../../../db';
import { sql } from 'drizzle-orm';
import { storage } from '../../../storage';

type Row = Record<string, unknown>;

export interface EmployeeFilters {
  department?: string;
  status?: string;
  search?: string;
  limit: number;
  offset: number;
}

export interface IHrRepository {
  employeesWithCount(garageId: string, f: EmployeeFilters): Promise<{ employees: Row[]; total: number }>;
  employeeById(id: string, garageId: string): Promise<Row | undefined>;
  insertEmployee(data: {
    fullName: string; email: string; phone: string | null; role: string;
    nationalId: string | null; passwordHash: string; garageId: string;
  }): Promise<Row | undefined>;
  attendanceEmployees(garageId: string, limit: number, offset: number): Promise<Row[]>;
  payrollActiveEmployees(garageId: string): Promise<Row[]>;
  payslipEmployee(employeeId: string, garageId: string): Promise<Row | undefined>;
  listLeave(filter: { status?: string; employeeId?: string }): ReturnType<typeof storage.listLeaveRequestEntries>;
  countLeaveByStatus(): ReturnType<typeof storage.countLeaveRequestEntriesByStatus>;
  createLeave(data: Parameters<typeof storage.createLeaveRequestEntry>[0]): ReturnType<typeof storage.createLeaveRequestEntry>;
  updateLeave(id: string, data: Parameters<typeof storage.updateLeaveRequestEntry>[1]): ReturnType<typeof storage.updateLeaveRequestEntry>;
}

export class HrRepository implements IHrRepository {
  private employeeWhere(garageId: string, f: EmployeeFilters) {
    const searchPattern = f.search ? `%${String(f.search)}%` : null;
    const departmentStr = f.department ? String(f.department) : null;
    return sql`WHERE u.garage_id = ${garageId}
      ${departmentStr ? sql`AND u.role = ${departmentStr}` : sql``}
      ${f.status === 'active' ? sql`AND u.is_active = true` : sql``}
      ${f.status === 'inactive' ? sql`AND u.is_active = false` : sql``}
      ${searchPattern ? sql`AND (u.full_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})` : sql``}`;
  }

  async employeesWithCount(garageId: string, f: EmployeeFilters) {
    const whereClause = this.employeeWhere(garageId, f);
    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.phone,
        u.role as department, u.user_type as position,
        u.is_active as "isActive", u.created_at as "hireDate",
        u.national_id as "nationalId",
        u.profile_image_url as "profileImage",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp.years_of_experience as "yearsOfExperience"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      ${whereClause}
      ORDER BY u.full_name ASC
      LIMIT ${f.limit} OFFSET ${f.offset}
    `);
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM users u ${whereClause}
    `);
    return {
      employees: employees.rows || [],
      total: parseInt((countResult.rows as Row[] | undefined)?.[0]?.total as string || '0'),
    };
  }

  async employeeById(id: string, garageId: string) {
    const result = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.phone,
        u.role as department, u.user_type as position,
        u.is_active as "isActive", u.created_at as "hireDate",
        u.national_id as "nationalId", u.profile_image_url as "profileImage",
        u.first_name as "firstName", u.last_name as "lastName",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp.years_of_experience as "yearsOfExperience",
        tp.certifications, tp.qualifications, tp.skills,
        tp.max_concurrent_jobs as "maxConcurrentJobs"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.id = ${id} AND u.garage_id = ${garageId}
    `);
    return result.rows?.[0] as Row | undefined;
  }

  async insertEmployee(data: {
    fullName: string; email: string; phone: string | null; role: string;
    nationalId: string | null; passwordHash: string; garageId: string;
  }) {
    const result = await db.execute(sql`
      INSERT INTO users (id, full_name, email, phone, role, national_id, password, garage_id, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${data.fullName}, ${data.email}, ${data.phone}, ${data.role},
              ${data.nationalId}, ${data.passwordHash}, ${data.garageId}, true, NOW(), NOW())
      RETURNING id, full_name as name, email, phone, role as department, is_active as "isActive", created_at as "hireDate"
    `);
    return result.rows?.[0] as Row | undefined;
  }

  async attendanceEmployees(garageId: string, limit: number, offset: number) {
    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.role as department,
        u.is_active as "isActive", u.created_at
      FROM users u
      WHERE u.garage_id = ${garageId} AND u.is_active = true
      ORDER BY u.full_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return employees.rows || [];
  }

  async payrollActiveEmployees(garageId: string) {
    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.national_id as "nationalId",
        u.created_at as "hireDate", u.is_active as "isActive",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.garage_id = ${garageId} AND u.is_active = true
    `);
    return employees.rows || [];
  }

  async payslipEmployee(employeeId: string, garageId: string) {
    const result = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.national_id as "nationalId",
        u.role as department, u.created_at as "hireDate",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.id = ${employeeId} AND u.garage_id = ${garageId}
    `);
    return result.rows?.[0] as Row | undefined;
  }

  listLeave(filter: { status?: string; employeeId?: string }) {
    return storage.listLeaveRequestEntries(filter);
  }
  countLeaveByStatus() {
    return storage.countLeaveRequestEntriesByStatus();
  }
  createLeave(data: Parameters<typeof storage.createLeaveRequestEntry>[0]) {
    return storage.createLeaveRequestEntry(data);
  }
  updateLeave(id: string, data: Parameters<typeof storage.updateLeaveRequestEntry>[1]) {
    return storage.updateLeaveRequestEntry(id, data);
  }
}
