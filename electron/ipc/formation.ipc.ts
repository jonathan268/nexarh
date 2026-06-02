import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerFormationIpc(): void {
  ipcMain.handle('formations:getAll', async (_, filters?: { search?: string; status?: string }) => {
    return safeHandler(async () => {
      const { FormationService } = await import('../services/FormationService')
      return FormationService.getAll(filters)
    })
  })

  ipcMain.handle('formations:getById', async (_, id: number) => {
    return safeHandler(async () => {
      const { FormationService } = await import('../services/FormationService')
      return FormationService.getById(id)
    })
  })

  ipcMain.handle('formations:create', async (_, data: { name: string; description?: string; duree?: string; frais: number }) => {
    return safeHandler(async () => {
      const { FormationService } = await import('../services/FormationService')
      return FormationService.create(data)
    })
  })

  ipcMain.handle('formations:update', async (_, { id, data }: { id: number; data: Record<string, unknown> }) => {
    return safeHandler(async () => {
      const { FormationService } = await import('../services/FormationService')
      return FormationService.update(id, data)
    })
  })

  ipcMain.handle('formations:delete', async (_, id: number) => {
    return safeHandler(async () => {
      const { FormationService } = await import('../services/FormationService')
      return FormationService.delete(id)
    })
  })
}
