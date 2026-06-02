import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  GraduationCap,
  CalendarCheck,
  Building2,
  Briefcase,
  Settings,
  ClipboardList,
  BookOpen,
  UserPlus,
  NotebookText,
  ChevronLeft
} from 'lucide-react'
import { useUiStore } from '../../stores/ui.store'
import { cn } from '../../lib/utils'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employés', icon: Users },
  { path: '/payroll', label: 'Paie', icon: DollarSign },
  { path: '/contracts', label: 'Contrats', icon: FileText },
  { path: '/interns', label: 'Stagiaires', icon: GraduationCap },
  { path: '/leaves', label: 'Congés', icon: CalendarCheck },
  { path: '/attendance', label: 'Pointage', icon: ClipboardList },
  { path: '/formations', label: 'Formations', icon: BookOpen },
  { path: '/apprenants', label: 'Apprenants', icon: UserPlus },
  { path: '/inscriptions', label: 'Inscriptions', icon: NotebookText },
  { path: '/departments', label: 'Départements', icon: Building2 },
  { path: '/positions', label: 'Postes', icon: Briefcase },
  { path: '/settings', label: 'Paramètres', icon: Settings }
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r-2 border-border transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-primaryLight text-text-secondary hover:text-primary transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primaryLight text-primary shadow-sm'
                    : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-text-primary'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-border">
          <div className="bg-primaryLight/50 rounded-xl p-3">
            <p className="text-xs font-semibold text-primary">NexaRH v1.0.0</p>
            <p className="text-xs text-text-muted mt-0.5">100% hors ligne</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
