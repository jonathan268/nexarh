import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerInternPdfIpc(): void {
  ipcMain.handle('internPdf:generateCertificate', async (_, internId: number) => {
    return safeHandler(async () => {
      const { InternPdfService } = await import('../services/InternPdfService')
      return InternPdfService.generateCertificate(internId)
    })
  })
}
