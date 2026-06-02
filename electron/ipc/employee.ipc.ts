import { ipcMain } from 'electron'
import { safeHandler } from './index'
import { z } from 'zod'

const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationalId: z.string().optional(),
  positionId: z.number().optional(),
  departmentId: z.number().optional(),
  hireDate: z.string().min(1),
  employmentType: z.string().default('CDI'),
  baseSalary: z.number().positive(),
  bankAccount: z.string().optional()
})

export function registerEmployeeIpc(): void {
  ipcMain.handle('employees:getAll', async (_, filters: unknown) => {
    return safeHandler(async () => {
      const { EmployeeService } = await import('../services/EmployeeService')
      return EmployeeService.getAll(filters as Record<string, unknown> | undefined)
    })
  })

  ipcMain.handle('employees:getById', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { EmployeeService } = await import('../services/EmployeeService')
      return EmployeeService.getById(id as number)
    })
  })

  ipcMain.handle('employees:create', async (_, data: unknown) => {
    const validated = CreateEmployeeSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: 'Données invalides', details: validated.error.flatten() }
    }
    return safeHandler(async () => {
      const { EmployeeService } = await import('../services/EmployeeService')
      return EmployeeService.create(validated.data)
    })
  })

  ipcMain.handle('employees:update', async (_, payload: unknown) => {
    const { id, data } = payload as { id: number; data: unknown }
    return safeHandler(async () => {
      const { EmployeeService } = await import('../services/EmployeeService')
      return EmployeeService.update(id, data as Record<string, unknown>)
    })
  })

  ipcMain.handle('employees:delete', async (_, id: unknown) => {
    return safeHandler(async () => {
      const { EmployeeService } = await import('../services/EmployeeService')
      return EmployeeService.delete(id as number)
    })
  })
}
