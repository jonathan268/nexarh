import { getDb } from '../database/connection'
import { leaveRequests, leaveTypes } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { format } from 'date-fns'
import { AuditLogService } from './AuditLogService'
import { LeaveBalanceService } from './LeaveBalanceService'

export const LeaveService = {
  getLeaveTypes() {
    const db = getDb()
    return db.select().from(leaveTypes).all()
  },

  getAll(filters?: Record<string, unknown>) {
    const db = getDb()
    let query = db.select().from(leaveRequests)

    if (filters?.status) {
      query = query.where(
        eq(leaveRequests.status, filters.status as string)
      ) as typeof query
    }

    if (filters?.employeeId) {
      query = query.where(
        eq(leaveRequests.employeeId, filters.employeeId as number)
      ) as typeof query
    }

    return query.all()
  },

  create(data: Record<string, unknown>) {
    const db = getDb()
    const now = new Date().toISOString()
    const result = db.insert(leaveRequests).values({ ...data, createdAt: now }).returning().get()
    AuditLogService.log('Création', 'congé', result.id)
    return result
  },

  approve(id: number) {
    const db = getDb()
    const result = db
      .update(leaveRequests)
      .set({
        status: 'approuve',
        approvedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      })
      .where(eq(leaveRequests.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Demande de congé non trouvée')
    AuditLogService.log('Approbation', 'congé', id)
    LeaveBalanceService.deductFromBalance(result.employeeId, result.leaveTypeId, result.totalDays)
    return result
  },

  reject(id: number, rejectionReason: string) {
    const db = getDb()
    const result = db
      .update(leaveRequests)
      .set({
        status: 'refuse',
        rejectionReason
      })
      .where(eq(leaveRequests.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Demande de congé non trouvée')
    AuditLogService.log('Rejet', 'congé', id, rejectionReason)
    return result
  },

  delete(id: number) {
    const db = getDb()
    const result = db
      .delete(leaveRequests)
      .where(eq(leaveRequests.id, id))
      .returning()
      .get()
    if (!result) throw new Error('Demande de congé non trouvée')
    AuditLogService.log('Suppression', 'congé', id)
    return result
  }
}
