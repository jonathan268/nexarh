import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', async () => {
    return safeHandler(async () => {
      const { SettingsService } = await import('../services/SettingsService')
      return SettingsService.get()
    })
  })

  ipcMain.handle('settings:update', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { SettingsService } = await import('../services/SettingsService')
      return SettingsService.update(data as Record<string, unknown>)
    })
  })

  ipcMain.handle('settings:uploadLogo', async (_, filePath: unknown) => {
    return safeHandler(async () => {
      const { SettingsService } = await import('../services/SettingsService')
      return SettingsService.uploadLogo(filePath as string)
    })
  })
}
