import { getDb } from '../database/connection'
import { contracts } from '../database/schema'
import { eq } from 'drizzle-orm'
import { addDays, format } from 'date-fns'
import { AuditLogService } from './AuditLogService'

export const ContractService = {
  getAll(filters?: Record<string, unknown>) {
    const db = getDb()
    let query = db.select().from(contracts)

    if (filters?.status) {
      query = query.where(eq(contracts.status, filters.status as string)) as typeof query
    }

    if (filters?.employeeId) {
      query = query.where(
        eq(contracts.employeeId, filters.employeeId as number)
      ) as typeof query
    }

    const result = query.all()

    return result.map((c) => ({
      ...c,
      isExpiringSoon: c.endDate
        ? addDays(new Date(), 30) >= new Date(c.endDate)
        : false
    }))
  },

  create(data: Record<string, unknown>) {
    const db = getDb()
    const now = new Date().toISOString()
    const result = db.insert(contracts).values({ ...data, createdAt: now, updatedAt: now }).returning().get()
    AuditLogService.log('Création', 'contrat', result.id)
    return result
  },

  update(id: number, data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    const result = db
      .update(contracts)
      .set(data)
      .where(eq(contracts.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Contrat non trouvé')
    AuditLogService.log('Modification', 'contrat', id)
    return result
  },

  terminate(id: number, reason: string) {
    const db = getDb()
    const result = db
      .update(contracts)
      .set({
        status: 'resilie',
        endDate: format(new Date(), 'yyyy-MM-dd'),
        notes: `Résilié : ${reason}`,
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      })
      .where(eq(contracts.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Contrat non trouvé')
    AuditLogService.log('Résiliation', 'contrat', id, reason)
    return result
  },

  deleteContract(id: number) {
    const db = getDb()
    const contract = db.select().from(contracts).where(eq(contracts.id, id)).get()
    if (!contract) throw new Error('Contrat non trouvé')
    const result = db.delete(contracts).where(eq(contracts.id, id)).returning().get()
    return result
  }
}
