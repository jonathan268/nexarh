import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerPayrollIpc(): void {
  ipcMain.handle('payroll:getPeriods', async () => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.getPeriods()
    })
  })

  ipcMain.handle('payroll:createPeriod', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.createPeriod(data as { periodMonth: number; periodYear: number })
    })
  })

  ipcMain.handle('payroll:run', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.runPayroll(periodId as number)
    })
  })

  ipcMain.handle('payroll:validate', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.validatePeriod(periodId as number)
    })
  })

  ipcMain.handle('payroll:generatePdf', async (_, payslipId: unknown) => {
    return safeHandler(async () => {
      const { PayslipPdfService } = await import('../services/PayslipPdfService')
      return PayslipPdfService.generate(payslipId as number)
    })
  })

  ipcMain.handle('payroll:getPayslips', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.getPayslips(periodId as number)
    })
  })

  ipcMain.handle('payroll:runForEmployee', async (_, payload: unknown) => {
    const { periodId, employeeId } = payload as { periodId: number; employeeId: number }
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.runPayrollForEmployee(periodId, employeeId)
    })
  })

  ipcMain.handle('payroll:deletePeriod', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.deletePeriod(periodId as number)
    })
  })

  ipcMain.handle('payroll:getPayslip', async (_, payslipId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.getPayslip(payslipId as number)
    })
  })

  ipcMain.handle('payroll:generateBatchPdf', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayslipPdfService } = await import('../services/PayslipPdfService')
      return PayslipPdfService.generateBatch(periodId as number)
    })
  })

  ipcMain.handle('payroll:markAsPaid', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.markAsPaid(periodId as number)
    })
  })

  ipcMain.handle('payroll:thirteenthMonth', async (_, payload: unknown) => {
    const { employeeId, year } = payload as { employeeId: number; year: number }
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.calculateThirteenthMonth(employeeId, year)
    })
  })

  ipcMain.handle('payroll:allThirteenthMonth', async (_, year: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.calculateAllThirteenthMonth(year as number)
    })
  })

  ipcMain.handle('payroll:employerCosts', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.getEmployerCosts(periodId as number)
    })
  })

  ipcMain.handle('payroll:updatePayslip', async (_, payload: unknown) => {
    const { payslipId, data } = payload as { payslipId: number; data: Record<string, unknown> }
    return safeHandler(async () => {
      const { PayrollService } = await import('../services/PayrollService')
      return PayrollService.updatePayslip(payslipId, data)
    })
  })
}
