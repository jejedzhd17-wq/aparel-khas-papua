import { X } from 'lucide-react';

interface AdminModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function AdminModal({
  title,
  isOpen,
  onClose,
  children,
  size = 'md',
}: AdminModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-lg ${sizeClasses[size]} w-full`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
