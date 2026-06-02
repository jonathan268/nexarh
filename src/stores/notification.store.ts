import { create } from 'zustand'
import type { AppNotification } from '../types/electron.d'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  fetch: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  scan: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const result = await window.electronAPI.notifications.getAll()
    if (result.success) {
      set({
        notifications: result.data,
        unreadCount: result.data.filter((n) => !n.isRead).length,
        loading: false
      })
    } else {
      set({ loading: false })
    }
  },

  markRead: async (id: number) => {
    await window.electronAPI.notifications.markRead(id)
    const { notifications } = get()
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: 1 } : n
    )
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length
    })
  },

  markAllRead: async () => {
    await window.electronAPI.notifications.markAllRead()
    const { notifications } = get()
    set({
      notifications: notifications.map((n) => ({ ...n, isRead: 1 })),
      unreadCount: 0
    })
  },

  scan: async () => {
    await window.electronAPI.notifications.scan()
    await get().fetch()
  }
}))
