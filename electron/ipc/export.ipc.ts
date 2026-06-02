import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerExportIpc(): void {
  ipcMain.handle('export:employees', async () => {
    return safeHandler(async () => {
      const { ExportService } = await import('../services/ExportService')
      return ExportService.exportEmployees()
    })
  })

  ipcMain.handle('export:contracts', async () => {
    return safeHandler(async () => {
      const { ExportService } = await import('../services/ExportService')
      return ExportService.exportContracts()
    })
  })

  ipcMain.handle('export:interns', async () => {
    return safeHandler(async () => {
      const { ExportService } = await import('../services/ExportService')
      return ExportService.exportInterns()
    })
  })

  ipcMain.handle('export:payslips', async (_, periodId: unknown) => {
    return safeHandler(async () => {
      const { ExportService } = await import('../services/ExportService')
      return ExportService.exportPayslips(periodId as number | undefined)
    })
  })

  ipcMain.handle('export:leaves', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { ExportService } = await import('../services/ExportService')
      return ExportService.exportLeaves(filters as { status?: string } | undefined)
    })
  })
}
