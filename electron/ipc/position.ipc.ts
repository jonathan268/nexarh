import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerPositionIpc(): void {
  ipcMain.handle('positions:getAll', async () => {
    return safeHandler(async () => {
      const { PositionService } = await import('../services/PositionService')
      return PositionService.getAll()
    })
  })

  ipcMain.handle('positions:getById', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { PositionService } = await import('../services/PositionService')
      return PositionService.getById(id as number)
    })
  })

  ipcMain.handle('positions:create', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { PositionService } = await import('../services/PositionService')
      return PositionService.create(data as { title: string; departmentId?: number; baseSalary: number })
    })
  })

  ipcMain.handle('positions:update', async (_, payload: unknown) => {
    const { id, data } = payload as { id: number; data: unknown }
    return safeHandler(async () => {
      const { PositionService } = await import('../services/PositionService')
      return PositionService.update(id, data as Record<string, unknown>)
    })
  })

  ipcMain.handle('positions:delete', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { PositionService } = await import('../services/PositionService')
      return PositionService.delete(id as number)
    })
  })
}
