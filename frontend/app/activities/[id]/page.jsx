import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Timer, Baby, ArrowLeft, Package, Tag } from 'lucide-react';
import { formatDuration, formatAge } from '@/lib/format';
import AddToCalendarButton from './AddToCalendarButton';
import BackLink from './BackLink';

export const revalidate = 3600; // ISR: refresh static pages hourly
// dynamicParams defaults to true → IDs added after build render on-demand

const API = process.env.NEXT_PUBLIC_API_URL;

// Shared fetch. Plain fetch (NOT lib/api.js — that sends credentials and would be a
// different request, breaking Next's per-request dedup). The identical URL+options in
// generateMetadata and the component collapse to ONE backend call per request.
async function getActivity(id) {
  const res = await fetch(`${API}/api/activities/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const { activity } = await res.json();
  return activity;
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/api/activities/index`);
    if (!res.ok) return [];
    const { activities } = await res.json();
    return activities.map((a) => ({ id: String(a.id) }));
  } catch {
    return []; // backend unreachable at build → fall back to on-demand ISR
  }
}

function metaDescription(activity) {
  return (activity.description ?? 'A Montessori-inspired activity for your child.')
    .replace(/\s+/g, ' ') // collapse newlines/whitespace from the VARCHAR(1000) body
    .trim()
    .slice(0, 160);
}

// Supplies is freeform text; split into a list when it reads like one.
function parseSupplies(supplies) {
  if (!supplies) return [];
  const parts = supplies.includes('\n') ? supplies.split('\n') : supplies.split(',');
  return parts.map((s) => s.trim()).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { id } = await params; // Next 16: params is a Promise
  const activity = await getActivity(id);
  if (!activity) return { title: 'Activity not found | Curious Toddlers' };

  const description = metaDescription(activity);
  return {
    title: `${activity.title} | Curious Toddlers`,
    description,
    alternates: { canonical: `/activities/${activity.id}` },
    openGraph: {
      title: `${activity.title} | Curious Toddlers`,
      description,
      url: `/activities/${activity.id}`,
    },
  };
}

export default async function ActivityPage({ params }) {
  const { id } = await params; // Next 16: params is a Promise
  const activity = await getActivity(id);
  if (!activity) notFound();

  const supplies = parseSupplies(activity.supplies);

  // Structured data — CreativeWork. Broader than Article (which warns on missing
  // image/author and won't earn a rich result here) while carrying the same fields.
  // No discrete steps to warrant HowTo, and Google removed HowTo rich results in 2023.
  // dateModified mirrors the sitemap's lastModified for a consistent freshness signal.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: activity.title,
    description: activity.description ?? undefined,
    datePublished: activity.created_at ?? undefined,
    dateModified: activity.updated_at ?? activity.created_at ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Curious Toddlers',
    },
  };

  return (
    <article className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense
        fallback={
          <Link
            href="/activities"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-honey-dark hover:text-honey-hover"
          >
            <ArrowLeft size={16} />
            Back to Activities
          </Link>
        }
      >
        <BackLink />
      </Suspense>

      {/* Header */}
      <header className="mt-5 border-b border-sand-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {activity.title}
        </h1>
        {activity.tags && activity.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activity.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-honey-light px-3 py-1 text-xs font-medium text-honey-dark"
              >
                <Tag size={12} />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Body: main content + sticky quick-facts sidebar */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-lg font-semibold text-ink">About this activity</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted whitespace-pre-wrap">
              {activity.description || 'No description available yet.'}
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <Package size={18} className="text-ink-muted" />
              What you&apos;ll need
            </h2>
            {supplies.length > 1 ? (
              <ul className="mt-3 space-y-2">
                {supplies.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-honey" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                {supplies[0] || 'No special supplies needed.'}
              </p>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 rounded-xl border border-sand-border bg-sand-surface p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Quick facts
            </h2>

            <dl className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-light text-sky">
                  <Timer size={18} />
                </span>
                <div>
                  <dt className="text-xs text-ink-muted">Duration</dt>
                  <dd className="text-sm font-medium text-ink">{formatDuration(activity.duration)}</dd>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-honey-light text-honey-dark">
                  <Baby size={18} />
                </span>
                <div>
                  <dt className="text-xs text-ink-muted">Recommended age</dt>
                  <dd className="text-sm font-medium text-ink">{formatAge(activity.min_age)}+</dd>
                </div>
              </div>
            </dl>

            <Suspense fallback={null}>
              <AddToCalendarButton activity={activity} />
            </Suspense>
          </div>
        </aside>
      </div>
    </article>
  );
}
