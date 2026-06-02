import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerContractIpc(): void {
  ipcMain.handle('contracts:getAll', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { ContractService } = await import('../services/ContractService')
      return ContractService.getAll(filters as Record<string, unknown> | undefined)
    })
  })

  ipcMain.handle('contracts:create', async (_, data: unknown) => {
    return safeHandler(async () => {
      const { ContractService } = await import('../services/ContractService')
      return ContractService.create(data as Record<string, unknown>)
    })
  })

  ipcMain.handle('contracts:update', async (_, payload: unknown) => {
    const { id, data } = payload as { id: number; data: unknown }
    return safeHandler(async () => {
      const { ContractService } = await import('../services/ContractService')
      return ContractService.update(id, data as Record<string, unknown>)
    })
  })

  ipcMain.handle('contracts:terminate', async (_, payload: unknown) => {
    const { id, reason } = payload as { id: number; reason: string }
    return safeHandler(async () => {
      const { ContractService } = await import('../services/ContractService')
      return ContractService.terminate(id, reason)
    })
  })

  ipcMain.handle('contracts:delete', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { ContractService } = await import('../services/ContractService')
      return ContractService.deleteContract(id as number)
    })
  })

  ipcMain.handle('contracts:uploadDocument', async () => {
    return safeHandler(async () => {
      const { DocumentService } = await import('../services/DocumentService')
      return DocumentService.uploadDocument()
    })
  })
}
