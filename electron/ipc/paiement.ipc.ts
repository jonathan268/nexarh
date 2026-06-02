import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerPaiementIpc(): void {
  ipcMain.handle('paiements:getAll', async (_, inscriptionId?: number) => {
    return safeHandler(async () => {
      const { PaiementService } = await import('../services/PaiementService')
      return PaiementService.getAll(inscriptionId)
    })
  })

  ipcMain.handle('paiements:create', async (_, data: {
    inscriptionId: number; montant: number; datePaiement: string;
    modePaiement?: string; reference?: string; notes?: string
  }) => {
    return safeHandler(async () => {
      const { PaiementService } = await import('../services/PaiementService')
      return PaiementService.create(data)
    })
  })

  ipcMain.handle('paiements:delete', async (_, id: number) => {
    return safeHandler(async () => {
      const { PaiementService } = await import('../services/PaiementService')
      await PaiementService.delete(id)
      return { success: true }
    })
  })
}
