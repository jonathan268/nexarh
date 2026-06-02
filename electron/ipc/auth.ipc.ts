import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerAuthIpc(): void {
  ipcMain.handle('auth:getSession', async () => {
    return safeHandler(async () => {
      const { AuthService } = await import('../services/AuthService')
      return AuthService.getSession()
    })
  })
}
