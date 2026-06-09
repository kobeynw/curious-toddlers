'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Reads `?from=calendar` on the client so the detail page stays statically
// prerendered (SSG). The crawled/canonical URL has no param → default to Activities.
export default function BackLink() {
  const fromCalendar = useSearchParams().get('from') === 'calendar';
  const href = fromCalendar ? '/calendar' : '/activities';
  const label = fromCalendar ? 'Back to Calendar' : 'Back to Activities';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-honey-dark hover:text-honey-hover"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
