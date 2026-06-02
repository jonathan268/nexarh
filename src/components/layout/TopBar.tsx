import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../../stores/ui.store'
import { useNotificationStore } from '../../stores/notification.store'
import { Menu, Bell, CalendarClock, UserCheck, FileX, CheckCheck, Moon, Sun, GraduationCap, BookOpen, DollarSign, HardDrive } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useThemeStore } from '../../stores/theme.store'

const typeConfig: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  pay_day: { icon: CalendarClock, bg: 'bg-accent/10', color: 'text-accent' },
  leave_return: { icon: UserCheck, bg: 'bg-green-50', color: 'text-green-600' },
  contract_end: { icon: FileX, bg: 'bg-danger/10', color: 'text-danger' },
  intern_end: { icon: GraduationCap, bg: 'bg-blue-50', color: 'text-blue-600' },
  formation_end: { icon: BookOpen, bg: 'bg-purple-50', color: 'text-purple-600' },
  unpaid_fees: { icon: DollarSign, bg: 'bg-orange-50', color: 'text-orange-600' },
  backup_done: { icon: HardDrive, bg: 'bg-teal-50', color: 'text-teal-600' }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function TopBar() {
  const { toggleSidebar } = useUiStore()
  const { notifications, unreadCount, fetch, markRead, markAllRead, scan } = useNotificationStore()
  const { isDark, toggle } = useThemeStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch()
    scan()
    const interval = setInterval(() => {
      scan()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetch, scan])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 bg-white border-b-2 border-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-primaryLight text-text-secondary hover:text-primary transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-lg">N</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">NexaRH</h1>
            <p className="text-xs text-text-muted -mt-0.5">Gestion RH</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-primaryLight text-text-secondary hover:text-primary transition-all duration-200"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2.5 rounded-xl hover:bg-primaryLight text-text-secondary hover:text-primary transition-all duration-200 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl border-2 border-border shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-border">
                <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllRead() }}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Tout marquer lu
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.pay_day
                    const Icon = config.icon
                    return (
                      <button
                        key={n.id}
                        onClick={() => { markRead(n.id) }}
                        className={cn(
                          'w-full text-left px-5 py-3.5 border-b border-border/50 hover:bg-gray-50 transition-all duration-150 flex gap-3',
                          !n.isRead && 'bg-primaryLight/20'
                        )}
                      >
                        <div className={cn('p-2 rounded-xl flex-shrink-0 self-start', config.bg)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('text-sm', n.isRead ? 'text-text-secondary' : 'font-semibold text-text-primary')}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-text-muted whitespace-nowrap mt-0.5">{formatDate(n.eventDate)}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 border-l-2 border-border">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
          <div className="text-sm">
            <p className="font-semibold text-text-primary">Admin</p>
            <p className="text-xs text-text-muted">Administrateur</p>
          </div>
        </div>
      </div>
    </header>
  )
}
