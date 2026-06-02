import { getDb } from '../database/connection'
import { auditLog } from '../database/schema'
import { eq, desc } from 'drizzle-orm'

export const AuditLogService = {
  log(action: string, entityType: string, entityId?: number, details?: string) {
    const db = getDb()
    db.insert(auditLog).values({ action, entityType, entityId, details }).run()
  },

  getAll(limit = 50) {
    const db = getDb()
    return db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(limit).all()
  }
}
