import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerNotificationIpc(): void {
  ipcMain.handle('notifications:getAll', async () => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      return NotificationService.getAll()
    })
  })

  ipcMain.handle('notifications:getUnread', async () => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      return NotificationService.getUnread()
    })
  })

  ipcMain.handle('notifications:markRead', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      NotificationService.markRead(id as number)
    })
  })

  ipcMain.handle('notifications:markAllRead', async () => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      NotificationService.markAllRead()
    })
  })

  ipcMain.handle('notifications:scan', async () => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      NotificationService.scanAndGenerate()
    })
  })

  ipcMain.handle('notifications:getUnreadCount', async () => {
    return safeHandler(async () => {
      const { NotificationService } = await import('../services/NotificationService')
      return NotificationService.getUnreadCount()
    })
  })
}
