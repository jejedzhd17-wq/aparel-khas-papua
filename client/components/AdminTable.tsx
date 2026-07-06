import { Edit2, Trash2, Loader2, PackageOpen } from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  hideOnMobile?: boolean;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  keyField?: string;
}

export default function AdminTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'Belum ada data',
  onEdit,
  onDelete,
  keyField = 'id',
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Filter columns for mobile (hide columns with hideOnMobile = true)
  const visibleColumns = columns;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Scrollable container — horizontal scroll on narrow screens */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.hideOnMobile ? 'hidden sm:table-cell' : ''
                  } ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr
                key={(item[keyField as keyof T] as any) || idx}
                className="hover:bg-gray-50 transition-colors"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-sm text-gray-800 ${
                      col.hideOnMobile ? 'hidden sm:table-cell' : ''
                    }`}
                  >
                    {col.key === 'actions' ? (
                      <div className="flex gap-1.5">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : col.render ? (
                      col.render(item[col.key], item)
                    ) : (
                      <span className="line-clamp-2">{String(item[col.key] ?? '-')}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-right">
        {data.length} data
      </div>
    </div>
  );
}
