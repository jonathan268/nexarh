import { getDb } from '../database/connection'
import { departments } from '../database/schema'
import { eq } from 'drizzle-orm'
import { AuditLogService } from './AuditLogService'

export const DepartmentService = {
  getAll() {
    const db = getDb()
    return db.select().from(departments).all()
  },

  create(data: Record<string, unknown>) {
    const db = getDb()
    const now = new Date().toISOString()
    const result = db.insert(departments).values({ ...data, createdAt: now, updatedAt: now }).returning().get()
    AuditLogService.log('Création', 'département', result.id, result.name)
    return result
  },

  update(id: number, data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = new Date().toISOString()
    const result = db
      .update(departments)
      .set(data)
      .where(eq(departments.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Département non trouvé')
    AuditLogService.log('Modification', 'département', id)
    return result
  },

  delete(id: number) {
    const db = getDb()
    const result = db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Département non trouvé')
    AuditLogService.log('Suppression', 'département', id)
    return result
  }
}
