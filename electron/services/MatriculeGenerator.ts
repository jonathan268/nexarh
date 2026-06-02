import { getDb } from '../database/connection'
import { employees, interns, apprenants } from '../database/schema'
import { eq } from 'drizzle-orm'

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generate(prefix: string, length = 6): string {
  const db = getDb()

  while (true) {
    const code = `${prefix}-${randomString(length)}`

    let exists = false
    if (prefix === 'EMP') {
      exists = !!db.select().from(employees).where(eq(employees.employeeNumber, code)).get()
    } else if (prefix === 'STG') {
      exists = !!db.select().from(interns).where(eq(interns.internNumber, code)).get()
    } else if (prefix === 'APP') {
      exists = !!db.select().from(apprenants).where(eq(apprenants.matricule, code)).get()
    }

    if (!exists) return code
  }
}
