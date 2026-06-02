import { ipcMain } from 'electron'
import { safeHandler } from './index'

export function registerAttendanceIpc(): void {
  ipcMain.handle('attendance:getAll', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.getAll(filters as any)
    })
  })

  ipcMain.handle('attendance:getByEmployee', async (_, payload: unknown) => {
    const { employeeId, month, year } = payload as { employeeId: number; month: number; year: number }
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.getByEmployee(employeeId, month, year)
    })
  })

  ipcMain.handle('attendance:checkIn', async (_, employeeId: unknown) => {
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.checkIn(employeeId as number)
    })
  })

  ipcMain.handle('attendance:checkOut', async (_, employeeId: unknown) => {
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.checkOut(employeeId as number)
    })
  })

  ipcMain.handle('attendance:updateStatus', async (_, payload: unknown) => {
    const { id, status, notes } = payload as { id: number; status: string; notes?: string }
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.updateStatus(id, status, notes)
    })
  })

  ipcMain.handle('attendance:monthlySummary', async (_, payload: unknown) => {
    const { month, year } = payload as { month: number; year: number }
    return safeHandler(async () => {
      const { AttendanceService } = await import('../services/AttendanceService')
      return AttendanceService.getMonthlySummary(month, year)
    })
  })
}
