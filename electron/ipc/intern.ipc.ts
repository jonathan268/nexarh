import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerInternIpc(): void {
  ipcMain.handle('interns:getAll', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { InternService } = await import('../services/InternService')
      return InternService.getAll(filters as Record<string, unknown> | undefined)
    })
  })

  ipcMain.handle('interns:create', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { InternService } = await import('../services/InternService')
      return InternService.create(data as Record<string, unknown>)
    })
  })

  ipcMain.handle('interns:update', async (_, payload: unknown) => {
    const { id, data } = payload as { id: number; data: unknown }
    return safeHandler(async () => {
      const { InternService } = await import('../services/InternService')
      return InternService.update(id, data as Record<string, unknown>)
    })
  })

  ipcMain.handle('interns:complete', async (_, payload: unknown) => {
    const { id, note } = payload as { id: number; note: number }
    return safeHandler(async () => {
      const { InternService } = await import('../services/InternService')
      return InternService.complete(id, note)
    })
  })
}
