import { getDb } from '../database/connection'
import { employees, payrollPeriods, payslips, companySettings } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { AuditLogService } from './AuditLogService'

interface PayrollCalculation {
  grossSalary: number
  cnpsEmployee: number
  cnpsEmployer: number
  irpp: number
  cfc: number
  fne: number
  netSalary: number
}

const IRPP_BRACKETS = [
  { min: 0, max: 62000, rate: 0 },
  { min: 62001, max: 125000, rate: 0.10 },
  { min: 125001, max: 250000, rate: 0.165 },
  { min: 250001, max: 500000, rate: 0.275 },
  { min: 500001, max: Infinity, rate: 0.385 }
]

function getSettings() {
  const db = getDb()
  return db.select().from(companySettings).where(eq(companySettings.id, 1)).get()
}

function getCnpsCeiling(): number {
  return getSettings()?.cnpsCeiling ?? 750_000
}
function getCnpsEmployeeRate(): number {
  return getSettings()?.cnpsEmployeeRate ?? 0.028
}
function getCnpsEmployerRate(): number {
  return getSettings()?.cnpsEmployerRate ?? 0.162
}
function getCfcRate(): number {
  return getSettings()?.cfcRate ?? 0.01
}
function getFneRate(): number {
  return getSettings()?.fneRate ?? 0.01
}

function calculatePayroll(baseSalary: number, overtimeHours = 0): PayrollCalculation {
  const overtimeRate = 1.5
  const hourlyRate = baseSalary / (26 * 8)
  const overtimeAmount = overtimeHours * hourlyRate * overtimeRate
  const grossSalary = baseSalary + overtimeAmount

  const cappedSalary = Math.min(grossSalary, getCnpsCeiling())
  const cnpsEmployee = Math.round(cappedSalary * getCnpsEmployeeRate() * 100) / 100
  const cnpsEmployer = Math.round(cappedSalary * getCnpsEmployerRate() * 100) / 100

  const taxableBase = grossSalary - cnpsEmployee

  let irpp = 0
  for (const bracket of IRPP_BRACKETS) {
    if (taxableBase > bracket.min) {
      const bracketAmount = Math.min(taxableBase, bracket.max) - bracket.min
      irpp += bracketAmount * bracket.rate
    }
  }
  irpp = Math.round(irpp * 100) / 100

  const cfc = Math.round(grossSalary * getCfcRate() * 100) / 100
  const fne = Math.round(grossSalary * getFneRate() * 100) / 100

  const totalDeductions = cnpsEmployee + irpp + cfc + fne

  const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

  return { grossSalary, cnpsEmployee, cnpsEmployer, irpp, cfc, fne, netSalary }
}

export interface PayslipUpdateInput {
  baseSalary?: number
  workedDays?: number
  overtimeHours?: number
  transportAllowance?: number
  housingAllowance?: number
  mealAllowance?: number
  performanceBonus?: number
  otherBonuses?: number
  advanceDeduction?: number
  otherDeductions?: number
}

function recalculatePayslip(input: {
  baseSalary: number
  workedDays: number
  overtimeHours: number
  transportAllowance: number
  housingAllowance: number
  mealAllowance: number
  performanceBonus: number
  otherBonuses: number
  advanceDeduction: number
  otherDeductions: number
}) {
  const hourlyRate = input.baseSalary / (input.workedDays * 8)
  const overtimeRate = 1.5
  const overtimeAmount = Math.round(input.overtimeHours * hourlyRate * overtimeRate * 100) / 100

  const totalBonuses =
    input.transportAllowance +
    input.housingAllowance +
    input.mealAllowance +
    input.performanceBonus +
    input.otherBonuses

  const grossSalary = Math.round((input.baseSalary + overtimeAmount + totalBonuses) * 100) / 100

  const cappedSalary = Math.min(grossSalary, getCnpsCeiling())
  const cnpsEmployee = Math.round(cappedSalary * getCnpsEmployeeRate() * 100) / 100
  const cnpsEmployer = Math.round(cappedSalary * getCnpsEmployerRate() * 100) / 100

  const taxableBase = grossSalary - cnpsEmployee
  let irpp = 0
  for (const bracket of IRPP_BRACKETS) {
    if (taxableBase > bracket.min) {
      const bracketAmount = Math.min(taxableBase, bracket.max) - bracket.min
      irpp += bracketAmount * bracket.rate
    }
  }
  irpp = Math.round(irpp * 100) / 100

  const cfc = Math.round(grossSalary * getCfcRate() * 100) / 100
  const fne = Math.round(grossSalary * getFneRate() * 100) / 100

  const totalDeductions = Math.round((cnpsEmployee + irpp + cfc + fne + input.advanceDeduction + input.otherDeductions) * 100) / 100
  const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

  return {
    baseSalary: input.baseSalary,
    workedDays: input.workedDays,
    overtimeHours: input.overtimeHours,
    overtimeAmount,
    transportAllowance: input.transportAllowance,
    housingAllowance: input.housingAllowance,
    mealAllowance: input.mealAllowance,
    performanceBonus: input.performanceBonus,
    otherBonuses: input.otherBonuses,
    advanceDeduction: input.advanceDeduction,
    otherDeductions: input.otherDeductions,
    grossSalary,
    cnpsEmployee,
    cnpsEmployer,
    irpp,
    cfc,
    fne,
    totalBonuses,
    totalDeductions,
    netSalary
  }
}

export const PayrollService = {
  getPeriods() {
    const db = getDb()
    const periods = db.select().from(payrollPeriods).all()
    return periods.map((p) => {
      let employeeName: string | null = null
      if (p.employeeId) {
        const emp = db.select().from(employees).where(eq(employees.id, p.employeeId)).get()
        if (emp) employeeName = `${emp.firstName} ${emp.lastName}`
      }
      return { ...p, employeeName }
    })
  },

  createPeriod(data: { periodMonth: number; periodYear: number; employeeId?: number }) {
    const db = getDb()

    // For global periods (no employeeId), check no duplicate month/year
    if (!data.employeeId) {
      const existing = db
        .select()
        .from(payrollPeriods)
        .where(
          and(
            eq(payrollPeriods.periodMonth, data.periodMonth),
            eq(payrollPeriods.periodYear, data.periodYear),
            and(
              eq(payrollPeriods.employeeId, undefined as any)
            )
          )
        )
        .get()

      if (existing) {
        throw new Error('Une période globale existe déjà pour ce mois')
      }
    } else {
      // For employee-specific periods, check no duplicate for this employee+month+year
      const existing = db
        .select()
        .from(payrollPeriods)
        .where(
          and(
            eq(payrollPeriods.periodMonth, data.periodMonth),
            eq(payrollPeriods.periodYear, data.periodYear),
            eq(payrollPeriods.employeeId, data.employeeId)
          )
        )
        .get()

      if (existing) {
        const emp = db.select().from(employees).where(eq(employees.id, data.employeeId)).get()
        throw new Error(`Une période existe déjà pour ${emp?.firstName || ''} ${emp?.lastName || ''} sur ce mois`)
      }
    }

    const now = new Date().toISOString()
    return db.insert(payrollPeriods).values({ ...data, createdAt: now }).returning().get()
  },

  runPayroll(periodId: number) {
    const db = getDb()
    const period = db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).get()
    if (!period) throw new Error('Période de paie non trouvée')

    if (period.status !== 'brouillon') {
      throw new Error('Seules les périodes en brouillon peuvent être calculées')
    }

    // If period is tied to an employee, only process that one
    let activeEmployees: any[]
    if (period.employeeId) {
      const emp = db.select().from(employees).where(eq(employees.id, period.employeeId)).get()
      activeEmployees = emp ? [emp] : []
    } else {
      activeEmployees = db
        .select()
        .from(employees)
        .where(eq(employees.status, 'actif'))
        .all()
    }

    let totalGross = 0
    let totalNet = 0
    let totalDeductions = 0

    for (const employee of activeEmployees) {
      // Skip if payslip already exists for this employee in this period
      const existingPayslip = db
        .select()
        .from(payslips)
        .where(
          and(
            eq(payslips.payrollPeriodId, periodId),
            eq(payslips.employeeId, employee.id)
          )
        )
        .get()

      if (existingPayslip) continue

      const calc = calculatePayroll(employee.baseSalary)

      const payslipData = {
        payrollPeriodId: periodId,
        employeeId: employee.id,
        baseSalary: employee.baseSalary,
        workedDays: 26,
        overtimeHours: 0,
        overtimeAmount: 0,
        grossSalary: calc.grossSalary,
        cnpsEmployee: calc.cnpsEmployee,
        cnpsEmployer: calc.cnpsEmployer,
        irpp: calc.irpp,
        cfc: calc.cfc,
        fne: calc.fne,
        transportAllowance: 0,
        housingAllowance: 0,
        mealAllowance: 0,
        performanceBonus: 0,
        advanceDeduction: 0,
        otherDeductions: 0,
        otherBonuses: 0,
        totalDeductions: calc.cnpsEmployee + calc.irpp + calc.cfc + calc.fne,
        totalBonuses: 0,
        netSalary: calc.netSalary
      }

      db.insert(payslips).values({ ...payslipData, createdAt: new Date().toISOString() }).run()

      totalGross += calc.grossSalary
      totalNet += calc.netSalary
      totalDeductions += calc.cnpsEmployee + calc.irpp + calc.cfc + calc.fne
    }

    db.update(payrollPeriods)
      .set({
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100
      })
      .where(eq(payrollPeriods.id, periodId))
      .run()

    AuditLogService.log('Lancement', 'paie', periodId, `${activeEmployees.length} employés`)
    return { totalEmployees: activeEmployees.length, totalGross, totalNet }
  },

  validatePeriod(periodId: number) {
    const db = getDb()
    const period = db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).get()
    if (!period) throw new Error('Période de paie non trouvée')

    const result = db
      .update(payrollPeriods)
      .set({
        status: 'valide',
        validatedAt: new Date().toISOString()
      })
      .where(eq(payrollPeriods.id, periodId))
      .returning()
      .get()

    AuditLogService.log('Validation', 'paie', periodId)
    return result
  },

  getPayslips(periodId: number) {
    const db = getDb()
    return db.select().from(payslips).where(eq(payslips.payrollPeriodId, periodId)).all()
  },

  runPayrollForEmployee(periodId: number, employeeId: number) {
    const db = getDb()
    const period = db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).get()
    if (!period) throw new Error('Période de paie non trouvée')

    if (period.status !== 'brouillon') {
      throw new Error('Seules les périodes en brouillon peuvent être calculées')
    }

    const employee = db.select().from(employees).where(eq(employees.id, employeeId)).get()
    if (!employee) throw new Error('Employé non trouvé')

    const existing = db
      .select()
      .from(payslips)
      .where(
        and(
          eq(payslips.payrollPeriodId, periodId),
          eq(payslips.employeeId, employeeId)
        )
      )
      .get()

    if (existing) throw new Error('Une fiche de paie existe déjà pour cet employé sur cette période')

    const calc = calculatePayroll(employee.baseSalary)

    const payslipData = {
      payrollPeriodId: periodId,
      employeeId: employee.id,
      baseSalary: employee.baseSalary,
      workedDays: 26,
      overtimeHours: 0,
      overtimeAmount: 0,
      grossSalary: calc.grossSalary,
      cnpsEmployee: calc.cnpsEmployee,
      cnpsEmployer: calc.cnpsEmployer,
      irpp: calc.irpp,
      cfc: calc.cfc,
      fne: calc.fne,
      transportAllowance: 0,
      housingAllowance: 0,
      mealAllowance: 0,
      performanceBonus: 0,
      advanceDeduction: 0,
      otherDeductions: 0,
      otherBonuses: 0,
      totalDeductions: calc.cnpsEmployee + calc.irpp + calc.cfc + calc.fne,
      totalBonuses: 0,
      netSalary: calc.netSalary
    }

    const result = db.insert(payslips).values({ ...payslipData, createdAt: new Date().toISOString() }).returning().get()

    const allPayslips = db
      .select()
      .from(payslips)
      .where(eq(payslips.payrollPeriodId, periodId))
      .all()

    const totalGross = allPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
    const totalNet = allPayslips.reduce((sum, p) => sum + p.netSalary, 0)
    const totalDeductions = allPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)

    db.update(payrollPeriods)
      .set({
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100
      })
      .where(eq(payrollPeriods.id, periodId))
      .run()

    return result
  },

  deletePeriod(periodId: number) {
    const db = getDb()
    const period = db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).get()
    if (!period) throw new Error('Période de paie non trouvée')
    db.delete(payslips).where(eq(payslips.payrollPeriodId, periodId)).run()
    const result = db.delete(payrollPeriods).where(eq(payrollPeriods.id, periodId)).returning().get()
    AuditLogService.log('Suppression', 'paie', periodId)
    return result
  },

  getPayslip(payslipId: number) {
    const db = getDb()
    const payslip = db.select().from(payslips).where(eq(payslips.id, payslipId)).get()
    if (!payslip) throw new Error('Fiche de paie non trouvée')
    return payslip
  },

  markAsPaid(periodId: number) {
    const db = getDb()
    const period = db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).get()
    if (!period) throw new Error('Période de paie non trouvée')
    if (period.status !== 'valide') throw new Error('Seules les périodes validées peuvent être marquées comme payées')

    return db.update(payrollPeriods)
      .set({ status: 'paye', paidAt: new Date().toISOString() })
      .where(eq(payrollPeriods.id, periodId))
      .returning()
      .get()
  },

  calculateThirteenthMonth(employeeId: number, year: number) {
    const db = getDb()
    const employee = db.select().from(employees).where(eq(employees.id, employeeId)).get()
    if (!employee) throw new Error('Employé non trouvé')

    const hireDate = new Date(employee.hireDate)
    const monthsWorked = Math.max(0, Math.min(12, (year - hireDate.getFullYear()) * 12 + (1 - hireDate.getMonth())))
    const proratedAmount = Math.round((employee.baseSalary * monthsWorked / 12) * 100) / 100

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      baseSalary: employee.baseSalary,
      monthsWorked,
      thirteenthMonth: proratedAmount
    }
  },

  calculateAllThirteenthMonth(year: number) {
    const db = getDb()
    const activeEmployees = db.select().from(employees).where(eq(employees.status, 'actif')).all()
    return activeEmployees.map(emp => this.calculateThirteenthMonth(emp.id, year))
  },

  getEmployerCosts(periodId: number) {
    const db = getDb()
    const payslipList = db.select().from(payslips).where(eq(payslips.payrollPeriodId, periodId)).all()

    const totalGross = payslipList.reduce((s, p) => s + p.grossSalary, 0)
    const totalCnpsEmployer = payslipList.reduce((s, p) => s + (p.cnpsEmployer || 0), 0)
    const totalNet = payslipList.reduce((s, p) => s + p.netSalary, 0)
    const totalEmployeeDeductions = payslipList.reduce((s, p) => s + p.totalDeductions, 0)

    return {
      totalGross,
      totalCnpsEmployer,
      totalNet,
      totalEmployeeDeductions,
      totalEmployerCost: totalGross + totalCnpsEmployer
    }
  },

  updatePayslip(payslipId: number, data: PayslipUpdateInput) {
    const db = getDb()
    const existing = db.select().from(payslips).where(eq(payslips.id, payslipId)).get()
    if (!existing) throw new Error('Fiche de paie non trouvée')
    AuditLogService.log('Modification', 'bulletin', payslipId)

    const merged = {
      baseSalary: data.baseSalary ?? existing.baseSalary,
      workedDays: data.workedDays ?? existing.workedDays,
      overtimeHours: data.overtimeHours ?? existing.overtimeHours,
      transportAllowance: data.transportAllowance ?? existing.transportAllowance,
      housingAllowance: data.housingAllowance ?? existing.housingAllowance,
      mealAllowance: data.mealAllowance ?? existing.mealAllowance,
      performanceBonus: data.performanceBonus ?? existing.performanceBonus,
      otherBonuses: data.otherBonuses ?? existing.otherBonuses,
      advanceDeduction: data.advanceDeduction ?? existing.advanceDeduction,
      otherDeductions: data.otherDeductions ?? existing.otherDeductions
    }

    const calc = recalculatePayslip(merged)

    db.update(payslips)
      .set(calc)
      .where(eq(payslips.id, payslipId))
      .run()

    const updated = db.select().from(payslips).where(eq(payslips.id, payslipId)).get()!

    const periodId = updated.payrollPeriodId
    const allPayslips = db.select().from(payslips).where(eq(payslips.payrollPeriodId, periodId)).all()
    const totalGross = allPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
    const totalNet = allPayslips.reduce((sum, p) => sum + p.netSalary, 0)
    const totalDeductions = allPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)

    db.update(payrollPeriods)
      .set({
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100
      })
      .where(eq(payrollPeriods.id, periodId))
      .run()

    return updated
  }
}
