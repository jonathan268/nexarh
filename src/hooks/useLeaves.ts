import { useState, useEffect, useCallback } from 'react'
import type { LeaveRequest } from '../types/electron.d'

export function useLeaves(filters?: Record<string, unknown>) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    const result = await window.electronAPI.leaves.getAll(filters)
    if (result.success) {
      setLeaves(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  return { leaves, loading, error, refetch: fetchLeaves }
}
