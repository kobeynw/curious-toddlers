import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

function formatDuration(minutes) {
  if (!minutes) return '\u2014';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function formatAge(months) {
  if (months == null) return '\u2014';
  if (months === 0) return 'Newborn';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

function truncate(text, max = 100) {
  if (!text) return '\u2014';
  return text.length > max ? text.slice(0, max) + '\u2026' : text;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [error, setError] = useState('');

  const nextCursorRef = useRef(nextCursor);
  const loadingMoreRef = useRef(loadingMore);

  useEffect(() => { nextCursorRef.current = nextCursor; }, [nextCursor]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  const fetchActivities = useCallback(async (cursor, append) => {
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (minAge) params.set('min_age', minAge);
      if (maxDuration) params.set('max_duration', maxDuration);
      if (cursor) params.set('cursor', cursor);

      const data = await api('/api/activities?' + params.toString());

      if (append) {
        setActivities((prev) => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, minAge, maxDuration]);

  // Debounced fetch on filter changes and initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

  // Infinite scroll
  useEffect(() => {
    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (nearBottom && nextCursorRef.current && !loadingMoreRef.current) {
        fetchActivities(nextCursorRef.current, true);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchActivities]);

  const inputClass =
    'border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-ink mb-6">Activities</h1>

      {/* Search and filter bar */}
      <div className="bg-sand-surface rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 ${inputClass}`}
          />

          <select
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            className={inputClass}
          >
            <option value="">Any Age</option>
            <option value="0">Newborn+</option>
            <option value="6">6 mo+</option>
            <option value="12">1 yr+</option>
            <option value="18">18 mo+</option>
            <option value="24">2 yr+</option>
            <option value="36">3 yr+</option>
            <option value="48">4 yr+</option>
            <option value="60">5 yr+</option>
            <option value="72">6 yr+</option>
          </select>

          <select
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
            className={inputClass}
          >
            <option value="">Any Duration</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hr</option>
            <option value="90">1 hr 30 min</option>
            <option value="120">2 hr</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <p className="text-center text-ink-muted py-12">Loading activities...</p>
      )}

      {/* Empty state */}
      {!loading && activities.length === 0 && (
        <p className="text-center text-ink-muted py-12">
          No activities found. Try adjusting your search or filters.
        </p>
      )}

      {/* Activities table */}
      {!loading && activities.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-border">
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Title</th>
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Description</th>
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Duration</th>
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Supplies</th>
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Min Age</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-sand-border">
                  <td className="px-3 py-3 text-ink font-medium">{activity.title}</td>
                  <td className="px-3 py-3 text-ink-muted text-sm">{truncate(activity.description, 100)}</td>
                  <td className="px-3 py-3 text-ink text-sm">{formatDuration(activity.duration)}</td>
                  <td className="px-3 py-3 text-ink-muted text-sm">{truncate(activity.supplies, 80)}</td>
                  <td className="px-3 py-3 text-ink text-sm">{formatAge(activity.min_age)}+</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading more indicator */}
      {loadingMore && (
        <p className="text-center text-ink-muted py-4">Loading more...</p>
      )}
    </div>
  );
}
