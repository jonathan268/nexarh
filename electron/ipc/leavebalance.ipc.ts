import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerLeaveBalanceIpc(): void {
  ipcMain.handle('leaveBalance:getByEmployee', async (_, payload: unknown) => {
    const { employeeId, year } = payload as { employeeId: number; year: number }
    return safeHandler(async () => {
      const { LeaveBalanceService } = await import('../services/LeaveBalanceService')
      return LeaveBalanceService.getBalancesByEmployee(employeeId, year)
    })
  })

  ipcMain.handle('leaveBalance:getAll', async (_, year: unknown) => {
    return safeHandler(async () => {
      const { LeaveBalanceService } = await import('../services/LeaveBalanceService')
      return LeaveBalanceService.getAllBalances(year as number)
    })
  })
}
