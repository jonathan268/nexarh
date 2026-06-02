import { getDb } from '../database/connection'
import { users } from '../database/schema'
import { eq } from 'drizzle-orm'

interface Session {
  userId: number
  username: string
  role: string
  employeeId: number | null
}

let currentSession: Session | null = null

export const AuthService = {
  getSession(): Session {
    if (currentSession) return currentSession

    const db = getDb()
    const adminUser = db.select().from(users).where(eq(users.username, 'admin')).get()

    if (adminUser) {
      currentSession = {
        userId: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        employeeId: adminUser.employeeId
      }
    }

    return currentSession!
  }
}
