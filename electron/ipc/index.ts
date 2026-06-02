import { ipcMain } from 'electron'
import { registerAuthIpc } from './auth.ipc'
import { registerEmployeeIpc } from './employee.ipc'
import { registerPayrollIpc } from './payroll.ipc'
import { registerContractIpc } from './contract.ipc'
import { registerInternIpc } from './intern.ipc'
import { registerLeaveIpc } from './leave.ipc'
import { registerDepartmentIpc } from './department.ipc'
import { registerPositionIpc } from './position.ipc'
import { registerSettingsIpc } from './settings.ipc'
import { registerBackupIpc } from './backup.ipc'
import { registerNotificationIpc } from './notification.ipc'
import { registerAuditIpc } from './audit.ipc'
import { registerExportIpc } from './export.ipc'
import { registerLeaveBalanceIpc } from './leavebalance.ipc'
import { registerImportIpc } from './import.ipc'
import { registerAttendanceIpc } from './attendance.ipc'
import { registerFormationIpc } from './formation.ipc'
import { registerApprenantIpc } from './apprenant.ipc'
import { registerInscriptionIpc } from './inscription.ipc'
import { registerPaiementIpc } from './paiement.ipc'
import { registerFormationPdfIpc } from './formationPdf.ipc'
import { registerInternPdfIpc } from './internPdf.ipc'

export function registerIpcHandlers(): void {
  registerAuthIpc()
  registerEmployeeIpc()
  registerPayrollIpc()
  registerContractIpc()
  registerInternIpc()
  registerLeaveIpc()
  registerDepartmentIpc()
  registerPositionIpc()
  registerSettingsIpc()
  registerBackupIpc()
  registerNotificationIpc()
  registerAuditIpc()
  registerExportIpc()
  registerLeaveBalanceIpc()
  registerImportIpc()
  registerAttendanceIpc()
  registerFormationIpc()
  registerApprenantIpc()
  registerInscriptionIpc()
  registerPaiementIpc()
  registerFormationPdfIpc()
  registerInternPdfIpc()
}

export type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

export const safeHandler = async <T>(
  fn: () => T | Promise<T>
): Promise<IpcResponse<T>> => {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    console.error('[NexaRH Error]', err)
    return {
      success: false,
      error:
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue'
    }
  }
}
