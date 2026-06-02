import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerImportIpc(): void {
  ipcMain.handle('import:employees', async () => {
    return safeHandler(async () => {
      const { ImportService } = await import('../services/ImportService')
      return ImportService.importEmployees()
    })
  })
}
