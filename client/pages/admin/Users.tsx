import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  joinDate: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Budi Santoso', email: 'budi@example.com', role: 'customer', joinDate: '2024-01-01' },
        { id: 2, name: 'Siti Nurhaliza', email: 'siti@example.com', role: 'customer', joinDate: '2024-01-02' },
        { id: 3, name: 'Ahmad Wijaya', email: 'ahmad@example.com', role: 'customer', joinDate: '2024-01-03' },
        { id: 4, name: 'Dewi Lestari', email: 'dewi@example.com', role: 'customer', joinDate: '2024-01-04' },
        { id: 5, name: 'Rinto Harahap', email: 'rinto@example.com', role: 'admin', joinDate: '2024-01-01' },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Delete user "${user.name}"?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'email' as const, label: 'Email' },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: string) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: 'joinDate' as const, label: 'Join Date' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  return (
    <AdminLayout title="Users" description="Manage store users">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">User List</h2>
        <p className="text-sm text-gray-600">Total: {users.length} users</p>
      </div>

      <AdminTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
}
