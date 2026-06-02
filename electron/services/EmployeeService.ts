import { getDb } from '../database/connection'
import { employees } from '../database/schema'
import { eq, like, or } from 'drizzle-orm'
import { AuditLogService } from './AuditLogService'
import { generate } from './MatriculeGenerator'

export const EmployeeService = {
  getAll(filters?: Record<string, unknown>) {
    const db = getDb()
    let query = db.select().from(employees)

    if (filters?.search) {
      const search = `%${filters.search}%`
      query = query.where(
        or(
          like(employees.firstName, search),
          like(employees.lastName, search),
          like(employees.employeeNumber, search),
          like(employees.email, search)
        )
      ) as typeof query
    }

    if (filters?.status) {
      query = query.where(eq(employees.status, filters.status as string)) as typeof query
    }

    if (filters?.departmentId) {
      query = query.where(
        eq(employees.departmentId, filters.departmentId as number)
      ) as typeof query
    }

    return query.all()
  },

  getById(id: number) {
    const db = getDb()
    const employee = db.select().from(employees).where(eq(employees.id, id)).get()
    if (!employee) throw new Error('Employé non trouvé')
    return employee
  },

  async create(data: Record<string, unknown>) {
    const db = getDb()
    const now = new Date().toISOString()
    const employeeNumber = await generate('EMP')
    const result = db.insert(employees).values({ ...data, employeeNumber, createdAt: now, updatedAt: now }).returning().get()
    AuditLogService.log('Création', 'employé', result.id, `${result.firstName} ${result.lastName}`)
    return result
  },

  update(id: number, data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = new Date().toISOString()
    const result = db.update(employees).set(data).where(eq(employees.id, id)).returning().get()
    if (!result) throw new Error('Employé non trouvé')
    AuditLogService.log('Modification', 'employé', id)
    return result
  },

  delete(id: number) {
    const db = getDb()
    const result = db.delete(employees).where(eq(employees.id, id)).returning().get()
    if (!result) throw new Error('Employé non trouvé')
    AuditLogService.log('Suppression', 'employé', id)
    return result
  }
}
