import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerAuditIpc(): void {
  ipcMain.handle('audit:getAll', async () => {
    return safeHandler(async () => {
      const { AuditLogService } = await import('../services/AuditLogService')
      return AuditLogService.getAll()
    })
  })
}
