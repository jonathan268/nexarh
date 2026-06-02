import { getDb } from '../database/connection'
import { leaveBalances, leaveTypes, employees } from '../database/schema'
import { eq, and } from 'drizzle-orm'

export const LeaveBalanceService = {
  getBalancesByEmployee(employeeId: number, year: number) {
    const db = getDb()
    const allTypes = db.select().from(leaveTypes).all()
    const balances = db.select().from(leaveBalances)
      .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)))
      .all()

    return allTypes.map(type => {
      const balance = balances.find(b => b.leaveTypeId === type.id)
      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        maxDays: type.maxDaysPerYear || 0,
        daysAllocated: balance?.daysAllocated ?? type.maxDaysPerYear ?? 0,
        daysUsed: balance?.daysUsed ?? 0,
        daysRemaining: (balance?.daysAllocated ?? type.maxDaysPerYear ?? 0) - (balance?.daysUsed ?? 0)
      }
    })
  },

  getAllBalances(year: number) {
    const db = getDb()
    const emps = db.select().from(employees).all()
    return emps.map(emp => ({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      balances: this.getBalancesByEmployee(emp.id, year)
    }))
  },

  useDays(employeeId: number, leaveTypeId: number, year: number, days: number) {
    const db = getDb()
    const existing = db.select().from(leaveBalances)
      .where(and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.leaveTypeId, leaveTypeId),
        eq(leaveBalances.year, year)
      )).get()

    if (existing) {
      db.update(leaveBalances)
        .set({ daysUsed: existing.daysUsed + days })
        .where(eq(leaveBalances.id, existing.id))
        .run()
    } else {
      const type = db.select().from(leaveTypes).where(eq(leaveTypes.id, leaveTypeId)).get()
      db.insert(leaveBalances).values({
        employeeId,
        leaveTypeId,
        year,
        daysAllocated: type?.maxDaysPerYear ?? 30,
        daysUsed: days
      }).run()
    }
  },

  deductFromBalance(employeeId: number, leaveTypeId: number, totalDays: number) {
    const year = new Date().getFullYear()
    this.useDays(employeeId, leaveTypeId, year, totalDays)
  }
}
