import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import EmployeesPage from './pages/employees/EmployeesPage'
import EmployeeFormPage from './pages/employees/EmployeeFormPage'
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage'
import PayrollPage from './pages/payroll/PayrollPage'
import ContractsPage from './pages/contracts/ContractsPage'
import ContractFormPage from './pages/contracts/ContractFormPage'
import InternsPage from './pages/interns/InternsPage'
import InternFormPage from './pages/interns/InternFormPage'
import LeavesPage from './pages/leaves/LeavesPage'
import DepartmentsPage from './pages/departments/DepartmentsPage'
import PositionsPage from './pages/positions/PositionsPage'
import SettingsPage from './pages/settings/SettingsPage'
import AttendancePage from './pages/attendance/AttendancePage'
import FormationsPage from './pages/formations/FormationsPage'
import ApprenantsPage from './pages/apprenants/ApprenantsPage'
import ApprenantFormPage from './pages/apprenants/ApprenantFormPage'
import InscriptionsPage from './pages/inscriptions/InscriptionsPage'

import { useThemeStore } from './stores/theme.store'

export default function App() {
  useEffect(() => {
    const stored = localStorage.getItem('nexarh-theme')
    if (stored === 'dark') {
      useThemeStore.getState().setDark(true)
    }
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/new" element={<ContractFormPage />} />
          <Route path="contracts/:id/edit" element={<ContractFormPage />} />
          <Route path="interns" element={<InternsPage />} />
          <Route path="interns/new" element={<InternFormPage />} />
          <Route path="interns/:id/edit" element={<InternFormPage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="formations" element={<FormationsPage />} />
          <Route path="apprenants" element={<ApprenantsPage />} />
          <Route path="apprenants/new" element={<ApprenantFormPage />} />
          <Route path="apprenants/:id/edit" element={<ApprenantFormPage />} />
          <Route path="inscriptions" element={<InscriptionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
