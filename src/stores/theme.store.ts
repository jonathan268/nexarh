import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  setDark: (dark: boolean) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,
  toggle: () => set((s) => {
    const newDark = !s.isDark
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('nexarh-theme', newDark ? 'dark' : 'light')
    return { isDark: newDark }
  }),
  setDark: (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('nexarh-theme', dark ? 'dark' : 'light')
    set({ isDark: dark })
  }
}))
