import ActivitiesContent from './ActivitiesContent';

export const metadata = {
  title: 'Activities | Curious Toddlers',
  description:
    'Browse our searchable repository of Montessori-inspired activities for your child, filtered by age and duration.',
  alternates: { canonical: '/activities' },
  openGraph: {
    title: 'Activities | Curious Toddlers',
    description:
      'Browse our searchable repository of Montessori-inspired activities for your child, filtered by age and duration.',
    url: '/activities',
  },
};

export default function ActivitiesPage() {
  return <ActivitiesContent />;
}
