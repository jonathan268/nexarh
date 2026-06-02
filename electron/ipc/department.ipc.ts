import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerDepartmentIpc(): void {
  ipcMain.handle('departments:getAll', async () => {
    return safeHandler(async () => {
      const { DepartmentService } = await import('../services/DepartmentService')
      return DepartmentService.getAll()
    })
  })

  ipcMain.handle('departments:create', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { DepartmentService } = await import('../services/DepartmentService')
      return DepartmentService.create(data as Record<string, unknown>)
    })
  })

  ipcMain.handle('departments:update', async (_, payload: unknown) => {
    const { id, data } = payload as { id: number; data: unknown }
    return safeHandler(async () => {
      const { DepartmentService } = await import('../services/DepartmentService')
      return DepartmentService.update(id, data as Record<string, unknown>)
    })
  })

  ipcMain.handle('departments:delete', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { DepartmentService } = await import('../services/DepartmentService')
      return DepartmentService.delete(id as number)
    })
  })
}
