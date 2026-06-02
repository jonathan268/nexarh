import { ipcMain, dialog } from 'electron'
import { safeHandler } from './index'

export function registerBackupIpc(): void {
  ipcMain.handle('backup:export', async () => {
    return safeHandler(async () => {
      const { BackupService } = await import('../services/BackupService')
      return BackupService.export()
    })
  })

  ipcMain.handle('backup:import', async () => {
    return safeHandler(async () => {
      const { BrowserWindow } = await import('electron')
      const win = BrowserWindow.getFocusedWindow()
      const result = await dialog.showOpenDialog(win || undefined, {
        title: 'Restaurer une sauvegarde',
        filters: [{ name: 'Base de données', extensions: ['db'] }],
        properties: ['openFile']
      })
      if (result.canceled || result.filePaths.length === 0) {
        throw new Error('Opération annulée')
      }
      const { BackupService } = await import('../services/BackupService')
      return BackupService.import(result.filePaths[0])
    })
  })
}
