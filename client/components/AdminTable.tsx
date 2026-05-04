import { Edit2, Trash2, Loader2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
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
  emptyMessage = 'No data available',
  onEdit,
  onDelete,
  keyField = 'id',
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-900 ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={item[keyField as keyof T] || idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-900">
                    {col.key === 'actions' ? (
                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : col.render ? (
                      col.render(item[col.key], item)
                    ) : (
                      String(item[col.key] || '-')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
