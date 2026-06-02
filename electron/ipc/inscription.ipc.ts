import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerInscriptionIpc(): void {
  ipcMain.handle('inscriptions:getAll', async (_, filters?: { status?: string; formationId?: number; apprenantId?: number }) => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.getAll(filters)
    })
  })

  ipcMain.handle('inscriptions:getById', async (_, id: number) => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.getById(id)
    })
  })

  ipcMain.handle('inscriptions:create', async (_, data: {
    apprenantId: number; formationId: number; dateInscription: string;
    frais: number; montantPaye?: number; notes?: string; dateFin?: string
  }) => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.create(data)
    })
  })

  ipcMain.handle('inscriptions:update', async (_, { id, data }: { id: number; data: Record<string, unknown> }) => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.update(id, data)
    })
  })

  ipcMain.handle('inscriptions:delete', async (_, id: number) => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.delete(id)
    })
  })

  ipcMain.handle('inscriptions:stats', async () => {
    return safeHandler(async () => {
      const { InscriptionService } = await import('../services/InscriptionService')
      return InscriptionService.getStats()
    })
  })
}
