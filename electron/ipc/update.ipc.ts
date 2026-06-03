import { autoUpdater, type UpdateInfo } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'
import { safeHandler } from './index'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

export function setUpdateWindow(win: BrowserWindow): void {
  mainWindow = win
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args)
  }
}

export function registerUpdateIpc(): void {
  ipcMain.handle('update:check', async () => {
    if (is.dev) {
      return { success: false, error: 'Les mises à jour ne sont pas disponibles en mode développement' }
    }

    try {
      const result = await autoUpdater.checkForUpdates()
      return { success: true, data: result }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Impossible de vérifier les mises à jour'
      }
    }
  })

  ipcMain.handle('update:download', async () => {
    try {
      autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erreur lors du téléchargement'
      }
    }
  })

  ipcMain.handle('update:install', () => {
    setImmediate(() => autoUpdater.quitAndInstall())
    return { success: true }
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendToRenderer('update:available', info)
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('update:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update:progress', progress)
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    sendToRenderer('update:downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    sendToRenderer('update:error', err.message || err)
  })
}
