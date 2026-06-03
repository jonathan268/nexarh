import type { IpcResponse } from '../../electron/ipc/index'

export interface ElectronAPI {
  auth: {
    getSession: () => Promise<IpcResponse<Session>>
  }
  employees: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Employee[]>>
    getById: (id: number) => Promise<IpcResponse<Employee>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Employee>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Employee>>
    delete: (id: number) => Promise<IpcResponse<Employee>>
  }
  payroll: {
    getPeriods: () => Promise<IpcResponse<PayrollPeriod[]>>
    createPeriod: (data: { periodMonth: number; periodYear: number }) => Promise<IpcResponse<PayrollPeriod>>
    runPayroll: (periodId: number) => Promise<IpcResponse<{ totalEmployees: number; totalGross: number; totalNet: number }>>
    runPayrollForEmployee: (periodId: number, employeeId: number) => Promise<IpcResponse<Payslip>>
    validatePeriod: (periodId: number) => Promise<IpcResponse<PayrollPeriod>>
    generatePayslipPdf: (payslipId: number) => Promise<IpcResponse<string>>
    generateBatchPayslipPdf: (periodId: number) => Promise<IpcResponse<number>>
    getPayslips: (periodId: number) => Promise<IpcResponse<Payslip[]>>
    deletePeriod: (periodId: number) => Promise<IpcResponse<PayrollPeriod>>
    getPayslip: (payslipId: number) => Promise<IpcResponse<Payslip>>
    updatePayslip: (payslipId: number, data: PayslipUpdateData) => Promise<IpcResponse<Payslip>>
    markAsPaid: (periodId: number) => Promise<IpcResponse<PayrollPeriod>>
    calculateThirteenthMonth: (employeeId: number, year: number) => Promise<IpcResponse<{
      employeeId: number
      employeeName: string
      baseSalary: number
      monthsWorked: number
      thirteenthMonth: number
    }>>
    calculateAllThirteenthMonth: (year: number) => Promise<IpcResponse<Array<{
      employeeId: number
      employeeName: string
      baseSalary: number
      monthsWorked: number
      thirteenthMonth: number
    }>>>
    getEmployerCosts: (periodId: number) => Promise<IpcResponse<{
      totalGross: number
      totalCnpsEmployer: number
      totalNet: number
      totalEmployeeDeductions: number
      totalEmployerCost: number
    }>>
  }
  contracts: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Contract[]>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Contract>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Contract>>
    terminate: (id: number, reason: string) => Promise<IpcResponse<Contract>>
    delete: (id: number) => Promise<IpcResponse<Contract>>
    uploadDocument: () => Promise<IpcResponse<string>>
  }
  interns: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Intern[]>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Intern>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Intern>>
    complete: (id: number, note: number) => Promise<IpcResponse<Intern>>
  }
  leaves: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<LeaveRequest[]>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<LeaveRequest>>
    approve: (id: number) => Promise<IpcResponse<LeaveRequest>>
    reject: (id: number, reason: string) => Promise<IpcResponse<LeaveRequest>>
    delete: (id: number) => Promise<IpcResponse<LeaveRequest>>
    getLeaveTypes: () => Promise<IpcResponse<LeaveType[]>>
  }
  leaveBalance: {
    getByEmployee: (employeeId: number, year: number) => Promise<IpcResponse<LeaveBalance[]>>
    getAll: (year: number) => Promise<IpcResponse<EmployeeLeaveBalance[]>>
  }
  departments: {
    getAll: () => Promise<IpcResponse<Department[]>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Department>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Department>>
    delete: (id: number) => Promise<IpcResponse<Department>>
  }
  positions: {
    getAll: () => Promise<IpcResponse<Position[]>>
    getById: (id: number) => Promise<IpcResponse<Position>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Position>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Position>>
    delete: (id: number) => Promise<IpcResponse<Position>>
  }
  settings: {
    get: () => Promise<IpcResponse<CompanySettings>>
    update: (data: Record<string, unknown>) => Promise<IpcResponse<CompanySettings>>
    uploadLogo: (filePath: string) => Promise<IpcResponse<string>>
  }
  backup: {
    export: () => Promise<IpcResponse<string>>
    import: () => Promise<IpcResponse<boolean>>
  },
  notifications: {
    getAll: () => Promise<IpcResponse<AppNotification[]>>
    getUnread: () => Promise<IpcResponse<AppNotification[]>>
    getUnreadCount: () => Promise<IpcResponse<number>>
    markRead: (id: number) => Promise<IpcResponse<void>>
    markAllRead: () => Promise<IpcResponse<void>>
    scan: () => Promise<IpcResponse<void>>
  }
  audit: {
    getAll: () => Promise<IpcResponse<AuditEntry[]>>
  }
  export: {
    employees: () => Promise<IpcResponse<string>>
    contracts: () => Promise<IpcResponse<string>>
    interns: () => Promise<IpcResponse<string>>
    payslips: (periodId?: number) => Promise<IpcResponse<string>>
    leaves: (filters?: Record<string, unknown>) => Promise<IpcResponse<string>>
  }
  import: {
    employees: () => Promise<IpcResponse<{ imported: number; errors: string[] }>>
  }
  attendance: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<AttendanceRecord[]>>
    getByEmployee: (employeeId: number, month: number, year: number) => Promise<IpcResponse<AttendanceRecord[]>>
    checkIn: (employeeId: number) => Promise<IpcResponse<AttendanceRecord>>
    checkOut: (employeeId: number) => Promise<IpcResponse<AttendanceRecord>>
    updateStatus: (id: number, status: string, notes?: string) => Promise<IpcResponse<AttendanceRecord>>
    monthlySummary: (month: number, year: number) => Promise<IpcResponse<MonthlyAttendanceSummary[]>>
  }
  formations: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Formation[]>>
    getById: (id: number) => Promise<IpcResponse<Formation>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Formation>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Formation>>
    delete: (id: number) => Promise<IpcResponse<Formation>>
  }
  apprenants: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Apprenant[]>>
    getById: (id: number) => Promise<IpcResponse<Apprenant>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Apprenant>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Apprenant>>
    delete: (id: number) => Promise<IpcResponse<Apprenant>>
  }
  inscriptions: {
    getAll: (filters?: Record<string, unknown>) => Promise<IpcResponse<Inscription[]>>
    getById: (id: number) => Promise<IpcResponse<InscriptionDetail>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<Inscription>>
    update: (id: number, data: Record<string, unknown>) => Promise<IpcResponse<Inscription>>
    delete: (id: number) => Promise<IpcResponse<Inscription>>
    getStats: () => Promise<IpcResponse<InscriptionStats>>
  }
  paiements: {
    getAll: (inscriptionId?: number) => Promise<IpcResponse<PaiementFormation[]>>
    create: (data: Record<string, unknown>) => Promise<IpcResponse<PaiementFormation>>
    delete: (id: number) => Promise<IpcResponse<void>>
  }
  formationPdf: {
    generateReceipt: (inscriptionId: number, paiementId: number) => Promise<IpcResponse<string>>
    generateCertificate: (inscriptionId: number) => Promise<IpcResponse<string>>
  }
  internPdf: {
    generateCertificate: (internId: number) => Promise<IpcResponse<string>>
  }
  update: {
    check: () => Promise<IpcResponse<UpdateCheckResult>>
    download: () => Promise<IpcResponse<void>>
    install: () => Promise<IpcResponse<void>>
    on: (channel: string, callback: (...args: unknown[]) => void) => () => void
  }
}

export interface UpdateCheckResult {
  updateInfo: UpdateInfo
  cancellationToken: unknown
}

export interface UpdateInfo {
  version: string
  files: Array<{ url: string; size: number; sha512: string }>
  path: string
  sha512: string
  releaseDate: string
  releaseName?: string
  releaseNotes?: string
}

export interface UpdateProgress {
  bytesPerSecond: number
  percent: number
  total: number
  transferred: number
}

export interface AuditEntry {
  id: number
  action: string
  entityType: string
  entityId: number | null
  details: string | null
  userId: number | null
  createdAt: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface Session {
  userId: number
  username: string
  role: 'admin' | 'rh' | 'manager'
  employeeId: number | null
  loginAt: string
}

export interface Employee {
  id: number
  employeeNumber: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string | null
  dateOfBirth: string | null
  gender: string | null
  nationalId: string | null
  positionId: number | null
  departmentId: number | null
  hireDate: string
  employmentType: string
  status: string
  baseSalary: number
  bankAccount: string | null
  photoPath: string | null
  createdAt: string
  updatedAt: string
}

export interface PayrollPeriod {
  id: number
  periodMonth: number
  periodYear: number
  status: string
  totalGross: number
  totalNet: number
  totalDeductions: number
  validatedBy: number | null
  validatedAt: string | null
  paidAt: string | null
  createdAt: string
}

export interface Payslip {
  id: number
  payrollPeriodId: number
  employeeId: number
  baseSalary: number
  workedDays: number
  overtimeHours: number
  overtimeAmount: number
  grossSalary: number
  cnpsEmployee: number
  cnpsEmployer: number
  irpp: number
  cfc: number
  fne: number
  transportAllowance: number
  housingAllowance: number
  mealAllowance: number
  performanceBonus: number
  advanceDeduction: number
  otherDeductions: number
  otherBonuses: number
  totalDeductions: number
  totalBonuses: number
  netSalary: number
  pdfPath: string | null
  createdAt: string
}

export interface Contract {
  id: number
  employeeId: number
  contractType: string
  startDate: string
  endDate: string | null
  durationMonths: number | null
  grossSalary: number
  netSalary: number | null
  status: string
  documentPath: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isExpiringSoon?: boolean
}

export interface Intern {
  id: number
  internNumber: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  schoolName: string
  studyLevel: string | null
  specialty: string | null
  type: string | null
  departmentId: number | null
  supervisorId: number | null
  startDate: string
  endDate: string
  monthlyAllowance: number
  status: string
  mission: string | null
  evaluationNote: number | null
  createdAt: string
  updatedAt: string
}

export interface LeaveRequest {
  id: number
  employeeId: number
  leaveTypeId: number
  startDate: string
  endDate: string
  totalDays: number
  reason: string | null
  status: string
  approvedBy: number | null
  approvedAt: string | null
  rejectionReason: string | null
  createdAt: string
}

export interface Position {
  id: number
  title: string
  departmentId: number | null
  baseSalary: number
  departmentName?: string
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: number
  name: string
  description: string | null
  managerId: number | null
  createdAt: string
  updatedAt: string
}

export interface LeaveBalance {
  leaveTypeId: number
  leaveTypeName: string
  maxDays: number
  daysAllocated: number
  daysUsed: number
  daysRemaining: number
}

export interface EmployeeLeaveBalance {
  employeeId: number
  employeeName: string
  balances: LeaveBalance[]
}

export interface LeaveType {
  id: number
  name: string
  maxDaysPerYear: number | null
  isPaid: number | null
  color: string | null
}

export interface Position {
  id: number
  title: string
  departmentId: number | null
  baseSalary: number
  departmentName?: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  id: number
  companyName: string
  companyAddress: string | null
  companyPhone: string | null
  companyEmail: string | null
  taxId: string | null
  cnpsNumber: string | null
  logoPath: string | null
  currency: string
  workingHoursPerDay: number
  workingDaysPerMonth: number
  overtimeRate: number
  transportRate: number
  payDay: number
  cnpsCeiling?: number
  cnpsEmployeeRate?: number
  cnpsEmployerRate?: number
  cfcRate?: number
  fneRate?: number
  irppBrackets?: string
  updatedAt: string
}

export interface AppNotification {
  id: number
  type: 'pay_day' | 'leave_return' | 'contract_end' | 'intern_end' | 'formation_end' | 'unpaid_fees' | 'backup_done'
  title: string
  message: string
  relatedId: number | null
  relatedType: string | null
  eventDate: string
  isRead: number
  createdAt: string
}

export interface AttendanceRecord {
  id: number
  employeeId: number
  employeeName?: string
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  hoursWorked: number | null
  notes: string | null
  createdAt: string
}

export interface MonthlyAttendanceSummary {
  employeeId: number
  employeeName: string
  present: number
  absent: number
  late: number
  totalDays: number
  totalHours: number
}

export interface Formation {
  id: number
  name: string
  description: string | null
  duree: string | null
  frais: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Apprenant {
  id: number
  matricule: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  dateNaissance: string | null
  niveauEtude: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface Inscription {
  id: number
  apprenantId: number
  formationId: number
  dateInscription: string
  frais: number
  montantPaye: number | null
  creneau: string | null
  status: string
  notes: string | null
  dateFin: string | null
  createdAt: string
  updatedAt: string
  apprenantNom?: string
  apprenantPrenom?: string
  apprenantMatricule?: string
  formationName?: string
  formationDuree?: string
}

export interface InscriptionDetail extends Inscription {
  formationFrais?: number
}

export interface InscriptionStats {
  total: number
  actif: number
  termine: number
}

export interface PaiementFormation {
  id: number
  inscriptionId: number
  montant: number
  datePaiement: string
  modePaiement: string
  reference: string | null
  notes: string | null
  createdAt: string
}

export interface PayslipUpdateData {
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
