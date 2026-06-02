import { getDb } from '../database/connection'
import { interns } from '../database/schema'
import { eq } from 'drizzle-orm'
import { AuditLogService } from './AuditLogService'
import { generate } from './MatriculeGenerator'

export const InternService = {
  getAll(filters?: Record<string, unknown>) {
    const db = getDb()
    let query = db.select().from(interns)

    if (filters?.status) {
      query = query.where(eq(interns.status, filters.status as string)) as typeof query
    }

    if (filters?.departmentId) {
      query = query.where(
        eq(interns.departmentId, filters.departmentId as number)
      ) as typeof query
    }

    return query.all()
  },

  async create(data: Record<string, unknown>) {
    const db = getDb()
    const now = new Date().toISOString()
    const internNumber = await generate('STG')
    const result = db.insert(interns).values({ ...data, internNumber, createdAt: now, updatedAt: now }).returning().get()
    AuditLogService.log('Création', 'stagiaire', result.id, `${result.firstName} ${result.lastName}`)
    return result
  },

  update(id: number, data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = new Date().toISOString()
    const result = db.update(interns).set(data).where(eq(interns.id, id)).returning().get()
    if (!result) throw new Error('Stagiaire non trouvé')
    AuditLogService.log('Modification', 'stagiaire', id)
    return result
  },

  complete(id: number, evaluationNote: number) {
    const db = getDb()
    const result = db
      .update(interns)
      .set({
        status: 'termine',
        evaluationNote,
        updatedAt: new Date().toISOString()
      })
      .where(eq(interns.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Stagiaire non trouvé')
    AuditLogService.log('Achèvement', 'stagiaire', id, `Note: ${evaluationNote}`)
    return result
  }
}
