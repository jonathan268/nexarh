import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  auth: {
    getSession: () => ipcRenderer.invoke('auth:getSession')
  },
  employees: {
    getAll: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke('employees:getAll', filters),
    getById: (id: number) => ipcRenderer.invoke('employees:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('employees:create', data),
    update: (id: number, data: unknown) =>
      ipcRenderer.invoke('employees:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('employees:delete', id)
  },
  payroll: {
    getPeriods: () => ipcRenderer.invoke('payroll:getPeriods'),
    createPeriod: (data: unknown) =>
      ipcRenderer.invoke('payroll:createPeriod', data),
    runPayroll: (periodId: number) =>
      ipcRenderer.invoke('payroll:run', periodId),
    runPayrollForEmployee: (periodId: number, employeeId: number) =>
      ipcRenderer.invoke('payroll:runForEmployee', { periodId, employeeId }),
    validatePeriod: (periodId: number) =>
      ipcRenderer.invoke('payroll:validate', periodId),
    generatePayslipPdf: (payslipId: number) =>
      ipcRenderer.invoke('payroll:generatePdf', payslipId),
    getPayslips: (periodId: number) =>
      ipcRenderer.invoke('payroll:getPayslips', periodId),
    deletePeriod: (periodId: number) =>
      ipcRenderer.invoke('payroll:deletePeriod', periodId),
    getPayslip: (payslipId: number) =>
      ipcRenderer.invoke('payroll:getPayslip', payslipId),
    updatePayslip: (payslipId: number, data: unknown) =>
      ipcRenderer.invoke('payroll:updatePayslip', { payslipId, data }),
    generateBatchPayslipPdf: (periodId: number) => ipcRenderer.invoke('payroll:generateBatchPdf', periodId),
    markAsPaid: (periodId: number) => ipcRenderer.invoke('payroll:markAsPaid', periodId),
    calculateThirteenthMonth: (employeeId: number, year: number) =>
      ipcRenderer.invoke('payroll:thirteenthMonth', { employeeId, year }),
    calculateAllThirteenthMonth: (year: number) => ipcRenderer.invoke('payroll:allThirteenthMonth', year),
    getEmployerCosts: (periodId: number) => ipcRenderer.invoke('payroll:employerCosts', periodId)
  },
  contracts: {
    getAll: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke('contracts:getAll', filters),
    create: (data: unknown) => ipcRenderer.invoke('contracts:create', data),
    update: (id: number, data: unknown) =>
      ipcRenderer.invoke('contracts:update', { id, data }),
    terminate: (id: number, reason: string) =>
      ipcRenderer.invoke('contracts:terminate', { id, reason }),
    delete: (id: number) => ipcRenderer.invoke('contracts:delete', id),
    uploadDocument: () => ipcRenderer.invoke('contracts:uploadDocument')
  },
  interns: {
    getAll: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke('interns:getAll', filters),
    create: (data: unknown) => ipcRenderer.invoke('interns:create', data),
    update: (id: number, data: unknown) =>
      ipcRenderer.invoke('interns:update', { id, data }),
    complete: (id: number, note: number) =>
      ipcRenderer.invoke('interns:complete', { id, note })
  },
  leaves: {
    getAll: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke('leaves:getAll', filters),
    create: (data: unknown) => ipcRenderer.invoke('leaves:create', data),
    approve: (id: number) => ipcRenderer.invoke('leaves:approve', id),
    reject: (id: number, reason: string) =>
      ipcRenderer.invoke('leaves:reject', { id, reason }),
    delete: (id: number) => ipcRenderer.invoke('leaves:delete', id),
    getLeaveTypes: () => ipcRenderer.invoke('leaves:getLeaveTypes')
  },
  leaveBalance: {
    getByEmployee: (employeeId: number, year: number) => ipcRenderer.invoke('leaveBalance:getByEmployee', { employeeId, year }),
    getAll: (year: number) => ipcRenderer.invoke('leaveBalance:getAll', year)
  },
  departments: {
    getAll: () => ipcRenderer.invoke('departments:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('departments:create', data),
    update: (id: number, data: unknown) =>
      ipcRenderer.invoke('departments:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('departments:delete', id)
  },
  positions: {
    getAll: () => ipcRenderer.invoke('positions:getAll'),
    getById: (id: number) => ipcRenderer.invoke('positions:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('positions:create', data),
    update: (id: number, data: unknown) =>
      ipcRenderer.invoke('positions:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('positions:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data: unknown) => ipcRenderer.invoke('settings:update', data),
    uploadLogo: (filePath: string) =>
      ipcRenderer.invoke('settings:uploadLogo', filePath)
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import')
  },
  notifications: {
    getAll: () => ipcRenderer.invoke('notifications:getAll'),
    getUnread: () => ipcRenderer.invoke('notifications:getUnread'),
    getUnreadCount: () => ipcRenderer.invoke('notifications:getUnreadCount'),
    markRead: (id: number) => ipcRenderer.invoke('notifications:markRead', id),
    markAllRead: () => ipcRenderer.invoke('notifications:markAllRead'),
    scan: () => ipcRenderer.invoke('notifications:scan')
  },
  audit: {
    getAll: () => ipcRenderer.invoke('audit:getAll')
  },
  export: {
    employees: () => ipcRenderer.invoke('export:employees'),
    contracts: () => ipcRenderer.invoke('export:contracts'),
    interns: () => ipcRenderer.invoke('export:interns'),
    payslips: (periodId?: number) => ipcRenderer.invoke('export:payslips', periodId),
    leaves: (filters?: Record<string, unknown>) => ipcRenderer.invoke('export:leaves', filters)
  },
  import: {
    employees: () => ipcRenderer.invoke('import:employees')
  },
  attendance: {
    getAll: (filters?: Record<string, unknown>) => ipcRenderer.invoke('attendance:getAll', filters),
    getByEmployee: (employeeId: number, month: number, year: number) =>
      ipcRenderer.invoke('attendance:getByEmployee', { employeeId, month, year }),
    checkIn: (employeeId: number) => ipcRenderer.invoke('attendance:checkIn', employeeId),
    checkOut: (employeeId: number) => ipcRenderer.invoke('attendance:checkOut', employeeId),
    updateStatus: (id: number, status: string, notes?: string) =>
      ipcRenderer.invoke('attendance:updateStatus', { id, status, notes }),
    monthlySummary: (month: number, year: number) =>
      ipcRenderer.invoke('attendance:monthlySummary', { month, year })
  },
  formations: {
    getAll: (filters?: Record<string, unknown>) => ipcRenderer.invoke('formations:getAll', filters),
    getById: (id: number) => ipcRenderer.invoke('formations:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('formations:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('formations:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('formations:delete', id)
  },
  apprenants: {
    getAll: (filters?: Record<string, unknown>) => ipcRenderer.invoke('apprenants:getAll', filters),
    getById: (id: number) => ipcRenderer.invoke('apprenants:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('apprenants:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('apprenants:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('apprenants:delete', id)
  },
  inscriptions: {
    getAll: (filters?: Record<string, unknown>) => ipcRenderer.invoke('inscriptions:getAll', filters),
    getById: (id: number) => ipcRenderer.invoke('inscriptions:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('inscriptions:create', data),
    update: (id: number, data: unknown) => ipcRenderer.invoke('inscriptions:update', { id, data }),
    delete: (id: number) => ipcRenderer.invoke('inscriptions:delete', id),
    getStats: () => ipcRenderer.invoke('inscriptions:stats')
  },
  paiements: {
    getAll: (inscriptionId?: number) => ipcRenderer.invoke('paiements:getAll', inscriptionId),
    create: (data: unknown) => ipcRenderer.invoke('paiements:create', data),
    delete: (id: number) => ipcRenderer.invoke('paiements:delete', id)
  },
  formationPdf: {
    generateReceipt: (inscriptionId: number, paiementId: number) =>
      ipcRenderer.invoke('formationPdf:generateReceipt', { inscriptionId, paiementId }),
    generateCertificate: (inscriptionId: number) =>
      ipcRenderer.invoke('formationPdf:generateCertificate', inscriptionId)
  },
  internPdf: {
    generateCertificate: (internId: number) =>
      ipcRenderer.invoke('internPdf:generateCertificate', internId)
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args)
      ipcRenderer.on(channel, listener)
      return () => { ipcRenderer.removeListener(channel, listener) }
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
