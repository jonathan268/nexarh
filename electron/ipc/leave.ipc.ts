import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerLeaveIpc(): void {
  ipcMain.handle('leaves:getLeaveTypes', async () => {
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.getLeaveTypes()
    })
  })

  ipcMain.handle('leaves:getAll', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.getAll(filters as Record<string, unknown> | undefined)
    })
  })

  ipcMain.handle('leaves:create', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.create(data as Record<string, unknown>)
    })
  })

  ipcMain.handle('leaves:approve', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.approve(id as number)
    })
  })

  ipcMain.handle('leaves:reject', async (_, payload: unknown) => {
    const { id, reason } = payload as { id: number; reason: string }
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.reject(id, reason)
    })
  })

  ipcMain.handle('leaves:delete', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { LeaveService } = await import('../services/LeaveService')
      return LeaveService.delete(id as number)
    })
  })
}
