import { getDb } from '../database/connection'
import { employees, contracts, interns, payslips, payrollPeriods, leaveRequests } from '../database/schema'
import { eq } from 'drizzle-orm'
import { dialog } from 'electron'
import { writeFile } from 'fs/promises'

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
}

export const ExportService = {
  async exportEmployees() {
    const db = getDb()
    const data = db.select().from(employees).all()
    const rows = data.map(e => [
      e.employeeNumber, e.firstName, e.lastName, e.email || '', e.phone || '',
      e.employmentType, e.status || '', String(e.baseSalary), e.hireDate
    ])
    const csv = toCsv(
      ['Matricule', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Type contrat', 'Statut', 'Salaire', 'Date embauche'],
      rows
    )
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `employes_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (filePath) await writeFile(filePath, csv, 'utf-8')
    return filePath || ''
  },

  async exportContracts() {
    const db = getDb()
    const data = db.select().from(contracts).all()
    const empMap = Object.fromEntries(
      db.select().from(employees).all().map(e => [e.id, `${e.firstName} ${e.lastName}`])
    )
    const rows = data.map(c => [
      empMap[c.employeeId] || String(c.employeeId), c.contractType,
      c.startDate, c.endDate || '', String(c.grossSalary), c.status || ''
    ])
    const csv = toCsv(
      ['Employé', 'Type', 'Début', 'Fin', 'Salaire brut', 'Statut'], rows
    )
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `contrats_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (filePath) await writeFile(filePath, csv, 'utf-8')
    return filePath || ''
  },

  async exportInterns() {
    const db = getDb()
    const data = db.select().from(interns).all()
    const rows = data.map(i => [
      i.internNumber, i.firstName, i.lastName, i.schoolName,
      i.startDate, i.endDate, String(i.monthlyAllowance), i.status || ''
    ])
    const csv = toCsv(
      ['Matricule', 'Prénom', 'Nom', 'École', 'Début', 'Fin', 'Indemnité', 'Statut'], rows
    )
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `stagiaires_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (filePath) await writeFile(filePath, csv, 'utf-8')
    return filePath || ''
  },

  async exportPayslips(periodId?: number) {
    const db = getDb()
    let data: any[]
    if (periodId) {
      data = db.select().from(payslips).where(eq(payslips.payrollPeriodId, periodId)).all()
    } else {
      data = db.select().from(payslips).all()
    }
    const empMap = Object.fromEntries(
      db.select().from(employees).all().map(e => [e.id, `${e.firstName} ${e.lastName}`])
    )
    const periodMap = Object.fromEntries(
      db.select().from(payrollPeriods).all().map(p => [p.id, `${String(p.periodMonth).padStart(2, '0')}/${p.periodYear}`])
    )
    const rows = data.map(p => [
      empMap[p.employeeId] || String(p.employeeId),
      periodMap[p.payrollPeriodId] || String(p.payrollPeriodId),
      String(p.grossSalary), String(p.totalDeductions), String(p.netSalary)
    ])
    const csv = toCsv(
      ['Employé', 'Période', 'Brut', 'Déductions', 'Net'], rows
    )
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `bulletins_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (filePath) await writeFile(filePath, csv, 'utf-8')
    return filePath || ''
  },

  async exportLeaves(filters?: { status?: string }) {
    const db = getDb()
    const data = filters?.status
      ? db.select().from(leaveRequests).where(eq(leaveRequests.status, filters.status)).all()
      : db.select().from(leaveRequests).all()
    const empMap = Object.fromEntries(
      db.select().from(employees).all().map(e => [e.id, `${e.firstName} ${e.lastName}`])
    )
    const rows = data.map(l => [
      empMap[l.employeeId] || String(l.employeeId),
      l.startDate, l.endDate, String(l.totalDays), l.reason || '', l.status
    ])
    const csv = toCsv(
      ['Employé', 'Début', 'Fin', 'Jours', 'Motif', 'Statut'], rows
    )
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `conges_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (filePath) await writeFile(filePath, csv, 'utf-8')
    return filePath || ''
  }
}
