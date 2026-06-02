import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('rh'),
  employeeId: integer('employee_id'),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  description: text('description'),
  managerId: integer('manager_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const positions = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  departmentId: integer('department_id'),
  baseSalary: real('base_salary').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeNumber: text('employee_number').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  nationalId: text('national_id').unique(),
  positionId: integer('position_id'),
  departmentId: integer('department_id'),
  hireDate: text('hire_date').notNull(),
  employmentType: text('employment_type').notNull().default('CDI'),
  status: text('status').default('actif'),
  baseSalary: real('base_salary').notNull(),
  bankAccount: text('bank_account'),
  photoPath: text('photo_path'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const contracts = sqliteTable('contracts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull(),
  contractType: text('contract_type').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  durationMonths: integer('duration_months'),
  grossSalary: real('gross_salary').notNull(),
  netSalary: real('net_salary'),
  status: text('status').default('actif'),
  documentPath: text('document_path'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const interns = sqliteTable('interns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  internNumber: text('intern_number').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  schoolName: text('school_name').notNull(),
  studyLevel: text('study_level'),
  specialty: text('specialty'),
  type: text('type').default('academique'),
  departmentId: integer('department_id'),
  supervisorId: integer('supervisor_id'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  monthlyAllowance: real('monthly_allowance').default(0),
  status: text('status').default('actif'),
  mission: text('mission'),
  evaluationNote: real('evaluation_note'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const payrollPeriods = sqliteTable('payroll_periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  periodMonth: integer('period_month').notNull(),
  periodYear: integer('period_year').notNull(),
  employeeId: integer('employee_id'),
  status: text('status').default('brouillon'),
  totalGross: real('total_gross').default(0),
  totalNet: real('total_net').default(0),
  totalDeductions: real('total_deductions').default(0),
  validatedBy: integer('validated_by'),
  validatedAt: text('validated_at'),
  paidAt: text('paid_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const payslips = sqliteTable('payslips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  payrollPeriodId: integer('payroll_period_id').notNull(),
  employeeId: integer('employee_id').notNull(),
  baseSalary: real('base_salary').notNull(),
  workedDays: integer('worked_days').notNull().default(26),
  overtimeHours: real('overtime_hours').default(0),
  overtimeAmount: real('overtime_amount').default(0),
  grossSalary: real('gross_salary').notNull(),
  cnpsEmployee: real('cnps_employee').default(0),
  cnpsEmployer: real('cnps_employer').default(0),
  irpp: real('irpp').default(0),
  cfc: real('cfc').default(0),
  fne: real('fne').default(0),
  transportAllowance: real('transport_allowance').default(0),
  housingAllowance: real('housing_allowance').default(0),
  mealAllowance: real('meal_allowance').default(0),
  performanceBonus: real('performance_bonus').default(0),
  advanceDeduction: real('advance_deduction').default(0),
  otherDeductions: real('other_deductions').default(0),
  otherBonuses: real('other_bonuses').default(0),
  totalDeductions: real('total_deductions').notNull(),
  totalBonuses: real('total_bonuses').notNull(),
  netSalary: real('net_salary').notNull(),
  pdfPath: text('pdf_path'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const leaveTypes = sqliteTable('leave_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  maxDaysPerYear: integer('max_days_per_year'),
  isPaid: integer('is_paid').default(1),
  color: text('color')
})

export const leaveRequests = sqliteTable('leave_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull(),
  leaveTypeId: integer('leave_type_id').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: integer('total_days').notNull(),
  reason: text('reason'),
  status: text('status').default('en_attente'),
  approvedBy: integer('approved_by'),
  approvedAt: text('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const companySettings = sqliteTable('company_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyName: text('company_name').notNull().default('Mon Entreprise'),
  companyAddress: text('company_address'),
  companyPhone: text('company_phone'),
  companyEmail: text('company_email'),
  taxId: text('tax_id'),
  cnpsNumber: text('cnps_number'),
  logoPath: text('logo_path'),
  currency: text('currency').default('XAF'),
  workingHoursPerDay: real('working_hours_per_day').default(8),
  workingDaysPerMonth: integer('working_days_per_month').default(26),
  overtimeRate: real('overtime_rate').default(1.5),
  transportRate: real('transport_rate').default(26000),
  payDay: integer('pay_day').default(5),
  cnpsCeiling: real('cnps_ceiling').default(750000),
  cnpsEmployeeRate: real('cnps_employee_rate').default(0.028),
  cnpsEmployerRate: real('cnps_employer_rate').default(0.162),
  cfcRate: real('cfc_rate').default(0.01),
  fneRate: real('fne_rate').default(0.01),
  irppBrackets: text('irpp_brackets').default('[]'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedId: integer('related_id'),
  relatedType: text('related_type'),
  eventDate: text('event_date').notNull(),
  isRead: integer('is_read').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  userId: integer('user_id').default(1),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const leaveBalances = sqliteTable('leave_balances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull(),
  leaveTypeId: integer('leave_type_id').notNull(),
  year: integer('year').notNull(),
  daysAllocated: integer('days_allocated').notNull(),
  daysUsed: integer('days_used').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const formations = sqliteTable('formations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  duree: text('duree'),
  frais: real('frais').notNull().default(0),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const apprenants = sqliteTable('apprenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  matricule: text('matricule').unique().notNull(),
  nom: text('nom').notNull(),
  prenom: text('prenom').notNull(),
  email: text('email'),
  telephone: text('telephone'),
  adresse: text('adresse'),
  dateNaissance: text('date_naissance'),
  niveauEtude: text('niveau_etude'),
  status: text('status').default('actif'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const inscriptions = sqliteTable('inscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  apprenantId: integer('apprenant_id').notNull(),
  formationId: integer('formation_id').notNull(),
  dateInscription: text('date_inscription').notNull(),
  frais: real('frais').notNull().default(0),
  montantPaye: real('montant_paye').default(0),
  creneau: text('creneau').default('09H-12H'),
  status: text('status').default('inscrit'),
  notes: text('notes'),
  dateFin: text('date_fin'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
})

export const paiementsFormation = sqliteTable('paiements_formation', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inscriptionId: integer('inscription_id').notNull(),
  montant: real('montant').notNull(),
  datePaiement: text('date_paiement').notNull(),
  modePaiement: text('mode_paiement').default('especes'),
  reference: text('reference'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull().default('present'),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  hoursWorked: real('hours_worked'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
})
