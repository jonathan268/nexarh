import { app, BrowserWindow } from 'electron'
import { createWindow } from './window'
import { initDatabase } from './database/connection'
import { registerIpcHandlers } from './ipc'
import { NotificationService } from './services/NotificationService'
import { seedFormations } from './services/SeedService'
import { BackupScheduler } from './services/BackupScheduler'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  initDatabase()
  registerIpcHandlers()
  seedFormations()
  NotificationService.scanAndGenerate()
  BackupScheduler.start()
  mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
