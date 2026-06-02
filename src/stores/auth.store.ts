import { create } from 'zustand'
import type { Session } from '../types/electron.d'

interface AuthState {
  session: Session | null
  loading: boolean
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,

  checkSession: async () => {
    try {
      const result = await window.electronAPI.auth.getSession()
      if (result.success) {
        set({ session: result.data, loading: false })
      } else {
        set({ session: null, loading: false })
      }
    } catch {
      set({ session: null, loading: false })
    }
  }
}))
