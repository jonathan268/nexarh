import { create } from 'zustand'
import type { Employee } from '../types/electron.d'

interface EmployeeState {
  employees: Employee[]
  loading: boolean
  error: string | null
  fetchEmployees: (filters?: Record<string, unknown>) => Promise<void>
  deleteEmployee: (id: number) => Promise<boolean>
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async (filters?) => {
    set({ loading: true, error: null })
    const result = await window.electronAPI.employees.getAll(filters)
    if (result.success) {
      set({ employees: result.data, loading: false })
    } else {
      set({ error: result.error, loading: false })
    }
  },

  deleteEmployee: async (id: number) => {
    const result = await window.electronAPI.employees.delete(id)
    if (result.success) {
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id)
      }))
      return true
    }
    return false
  }
}))
