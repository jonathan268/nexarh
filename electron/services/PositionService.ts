import { getDb } from '../database/connection'
import { positions, departments } from '../database/schema'
import { eq } from 'drizzle-orm'
import { AuditLogService } from './AuditLogService'

export const PositionService = {
  getAll() {
    const db = getDb()
    return db
      .select({
        id: positions.id,
        title: positions.title,
        departmentId: positions.departmentId,
        baseSalary: positions.baseSalary,
        departmentName: departments.name,
        createdAt: positions.createdAt,
        updatedAt: positions.updatedAt
      })
      .from(positions)
      .leftJoin(departments, eq(positions.departmentId, departments.id))
      .all()
  },

  getById(id: number) {
    const db = getDb()
    const result = db
      .select({
        id: positions.id,
        title: positions.title,
        departmentId: positions.departmentId,
        baseSalary: positions.baseSalary,
        departmentName: departments.name,
        createdAt: positions.createdAt,
        updatedAt: positions.updatedAt
      })
      .from(positions)
      .leftJoin(departments, eq(positions.departmentId, departments.id))
      .where(eq(positions.id, id))
      .get()
    if (!result) throw new Error('Poste non trouvé')
    return result
  },

  create(data: { title: string; departmentId?: number; baseSalary: number }) {
    const db = getDb()
    const now = new Date().toISOString()
    const result = db.insert(positions).values({ ...data, createdAt: now, updatedAt: now }).returning().get()
    AuditLogService.log('Création', 'poste', result.id, result.title)
    return result
  },

  update(id: number, data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = new Date().toISOString()
    const result = db
      .update(positions)
      .set(data)
      .where(eq(positions.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Poste non trouvé')
    AuditLogService.log('Modification', 'poste', id)
    return result
  },

  delete(id: number) {
    const db = getDb()
    const result = db
      .delete(positions)
      .where(eq(positions.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Poste non trouvé')
    AuditLogService.log('Suppression', 'poste', id)
    return result
  }
}
