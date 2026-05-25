import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export const metadata = {
  title: 'Verify Email | Curious Toddlers',
  description: 'Verify your Curious Toddlers email address.',
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
