import { useState, useEffect, useCallback } from 'react'
import type { Employee } from '../types/electron.d'

export function useEmployees(filters?: Record<string, unknown>) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await window.electronAPI.employees.getAll(filters)
    if (result.success) {
      setEmployees(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return { employees, loading, error, refetch: fetchEmployees }
}
