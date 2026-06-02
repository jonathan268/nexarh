import { useState, useEffect, useCallback } from 'react'
import type { Intern } from '../types/electron.d'

export function useInterns(filters?: Record<string, unknown>) {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInterns = useCallback(async () => {
    setLoading(true)
    const result = await window.electronAPI.interns.getAll(filters)
    if (result.success) {
      setInterns(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchInterns()
  }, [fetchInterns])

  return { interns, loading, error, refetch: fetchInterns }
}
