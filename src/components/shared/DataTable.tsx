interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (item: T) => void
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onRowClick
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border-2 border-border bg-white overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => (
              <tr
                key={item.id as number || index}
                className={`bg-white transition-all duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-primaryLight/30' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-sm text-text-primary ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item[col.key] as React.ReactNode) || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-12 text-center text-text-muted text-sm">
          Aucune donnée disponible
        </div>
      )}
    </div>
  )
}
