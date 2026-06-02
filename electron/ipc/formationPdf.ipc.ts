import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerFormationPdfIpc(): void {
  ipcMain.handle('formationPdf:generateReceipt', async (_, { inscriptionId, paiementId }: { inscriptionId: number; paiementId: number }) => {
    return safeHandler(async () => {
      const { FormationPdfService } = await import('../services/FormationPdfService')
      return FormationPdfService.generateReceipt(inscriptionId, paiementId)
    })
  })

  ipcMain.handle('formationPdf:generateCertificate', async (_, inscriptionId: number) => {
    return safeHandler(async () => {
      const { FormationPdfService } = await import('../services/FormationPdfService')
      return FormationPdfService.generateCertificate(inscriptionId)
    })
  })
}
