import { getDb } from '../database/connection'
import { attendance, employees } from '../database/schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'

export const AttendanceService = {
  getAll(filters?: { employeeId?: number; dateFrom?: string; dateTo?: string; status?: string }) {
    const db = getDb()
    let query = db.select().from(attendance).orderBy(desc(attendance.date))

    if (filters?.employeeId) {
      query = db.select().from(attendance)
        .where(eq(attendance.employeeId, filters.employeeId))
        .orderBy(desc(attendance.date)) as any
    }

    const results = query.all()

    const empMap = Object.fromEntries(
      db.select().from(employees).all().map(e => [e.id, `${e.firstName} ${e.lastName}`])
    )

    return results.map(a => ({
      ...a,
      employeeName: empMap[a.employeeId] || `ID: ${a.employeeId}`
    }))
  },

  getByEmployee(employeeId: number, month: number, year: number) {
    const db = getDb()
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const startDate = `${monthStr}-01`
    const endDate = `${monthStr}-31`

    return db.select().from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          gte(attendance.date, startDate),
          lte(attendance.date, endDate)
        )
      )
      .orderBy(attendance.date)
      .all()
  },

  getToday(employeeId: number) {
    const db = getDb()
    const today = new Date().toISOString().slice(0, 10)
    return db.select().from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, today)))
      .get()
  },

  checkIn(employeeId: number) {
    const db = getDb()
    const today = new Date().toISOString().slice(0, 10)
    const now = new Date().toISOString().slice(11, 16)

    const existing = this.getToday(employeeId)
    if (existing) throw new Error('Pointage déjà effectué aujourd\'hui')

    return db.insert(attendance).values({
      employeeId,
      date: today,
      status: 'present',
      checkIn: now,
      createdAt: new Date().toISOString()
    }).returning().get()
  },

  checkOut(employeeId: number) {
    const db = getDb()
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const time = now.toISOString().slice(11, 16)

    const existing = db.select().from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, today)))
      .get()

    if (!existing) throw new Error('Aucun pointage d\'entrée aujourd\'hui')
    if (existing.checkOut) throw new Error('Pointage de sortie déjà effectué')

    const checkInParts = existing.checkIn!.split(':').map(Number)
    const checkOutParts = time.split(':').map(Number)
    const checkInMinutes = checkInParts[0] * 60 + checkInParts[1]
    const checkOutMinutes = checkOutParts[0] * 60 + checkOutParts[1]
    const hoursWorked = Math.round(((checkOutMinutes - checkInMinutes) / 60) * 100) / 100

    db.update(attendance)
      .set({ checkOut: time, hoursWorked: Math.max(0, hoursWorked) })
      .where(eq(attendance.id, existing.id))
      .run()

    return db.select().from(attendance).where(eq(attendance.id, existing.id)).get()
  },

  updateStatus(id: number, status: string, notes?: string) {
    const db = getDb()
    db.update(attendance)
      .set({ status, notes: notes || null })
      .where(eq(attendance.id, id))
      .run()
    return db.select().from(attendance).where(eq(attendance.id, id)).get()
  },

  getMonthlySummary(month: number, year: number) {
    const db = getDb()
    const allEmployees = db.select().from(employees).where(eq(employees.status, 'actif')).all()
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const startDate = `${monthStr}-01`
    const endDate = `${monthStr}-31`

    return allEmployees.map(emp => {
      const records = db.select().from(attendance)
        .where(
          and(
            eq(attendance.employeeId, emp.id),
            gte(attendance.date, startDate),
            lte(attendance.date, endDate)
          )
        )
        .all()

      const present = records.filter(r => r.status === 'present').length
      const absent = records.filter(r => r.status === 'absent').length
      const late = records.filter(r => r.status === 'retard').length
      const totalHours = records.reduce((s, r) => s + (r.hoursWorked || 0), 0)

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        present,
        absent,
        late,
        totalDays: records.length,
        totalHours: Math.round(totalHours * 100) / 100
      }
    })
  }
}
