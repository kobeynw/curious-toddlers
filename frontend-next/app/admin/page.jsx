import AdminRoute from '@/components/AdminRoute';
import AdminContent from './AdminContent';

export const metadata = {
  title: 'Admin | Curious Toddlers',
  description: 'Manage the Curious Toddlers activity repository.',
  robots: { index: false },
};

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}
