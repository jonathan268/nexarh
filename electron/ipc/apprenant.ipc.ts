import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerApprenantIpc(): void {
  ipcMain.handle('apprenants:getAll', async (_, filters?: { search?: string; status?: string }) => {
    return safeHandler(async () => {
      const { ApprenantService } = await import('../services/ApprenantService')
      return ApprenantService.getAll(filters)
    })
  })

  ipcMain.handle('apprenants:getById', async (_, id: number) => {
    return safeHandler(async () => {
      const { ApprenantService } = await import('../services/ApprenantService')
      return ApprenantService.getById(id)
    })
  })

  ipcMain.handle('apprenants:create', async (_, data: {
    nom: string; prenom: string; email?: string; telephone?: string;
    adresse?: string; dateNaissance?: string; niveauEtude?: string
  }) => {
    return safeHandler(async () => {
      const { ApprenantService } = await import('../services/ApprenantService')
      return ApprenantService.create(data)
    })
  })

  ipcMain.handle('apprenants:update', async (_, { id, data }: { id: number; data: Record<string, unknown> }) => {
    return safeHandler(async () => {
      const { ApprenantService } = await import('../services/ApprenantService')
      return ApprenantService.update(id, data)
    })
  })

  ipcMain.handle('apprenants:delete', async (_, id: number) => {
    return safeHandler(async () => {
      const { ApprenantService } = await import('../services/ApprenantService')
      return ApprenantService.delete(id)
    })
  })
}
