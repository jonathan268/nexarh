import { create } from 'zustand'
import type { CompanySettings } from '../types/electron.d'

interface SettingsState {
  settings: CompanySettings | null
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (data: Record<string, unknown>) => Promise<boolean>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    const result = await window.electronAPI.settings.get()
    if (result.success) {
      set({ settings: result.data, loading: false })
    } else {
      set({ loading: false })
    }
  },

  updateSettings: async (data) => {
    const result = await window.electronAPI.settings.update(data)
    if (result.success) {
      set({ settings: result.data })
      return true
    }
    return false
  }
}))
