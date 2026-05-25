import ProtectedRoute from '@/components/ProtectedRoute';
import CalendarContent from './CalendarContent';

export const metadata = {
  title: 'My Calendar | Curious Toddlers',
  description: 'Plan and schedule activities for your child throughout the week.',
  robots: { index: false },
};

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarContent />
    </ProtectedRoute>
  );
}
