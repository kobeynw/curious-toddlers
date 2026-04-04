import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatAge } from '../utils/format';
import AddToCalendarModal from '../components/AddToCalendarModal';

function truncate(text, max = 100) {
  if (!text) return '\u2014';
  return text.length > max ? text.slice(0, max) + '\u2026' : text;
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [error, setError] = useState('');

  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [calendarActivity, setCalendarActivity] = useState(null);

  const nextCursorRef = useRef(nextCursor);
  const loadingMoreRef = useRef(loadingMore);

  useEffect(() => { nextCursorRef.current = nextCursor; }, [nextCursor]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  // Fetch all tags once on mount
  useEffect(() => {
    api('/api/tags')
      .then((data) => setAllTags(data.tags))
      .catch(() => {});
  }, []);

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
      if (selectedTagIds.size > 0) params.set('tags', [...selectedTagIds].join(','));
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
  }, [search, minAge, maxDuration, selectedTagIds]);

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

  function toggleTag(tagId) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }

  function selectAllTags() {
    setSelectedTagIds(new Set(allTags.map((t) => t.id)));
  }

  function clearAllTags() {
    setSelectedTagIds(new Set());
  }

  async function handleAddToCalendar(activityId, days) {
    await api('/api/calendar/activities', {
      method: 'POST',
      body: JSON.stringify({ activityId, days }),
    });
  }

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

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="bg-sand-surface rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTagsExpanded((prev) => !prev)}
              className="flex items-center gap-2 text-ink font-medium"
            >
              <svg
                className={`w-4 h-4 transition-transform ${tagsExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Tags
              {selectedTagIds.size > 0 && (
                <span className="bg-honey text-white text-xs rounded-full px-2 py-0.5">
                  {selectedTagIds.size}
                </span>
              )}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllTags}
                className="text-sm text-honey-dark hover:text-honey-hover"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllTags}
                className="text-sm text-honey-dark hover:text-honey-hover"
              >
                Clear All
              </button>
            </div>
          </div>

          {tagsExpanded && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={
                    selectedTagIds.has(tag.id)
                      ? 'bg-honey text-white rounded-full px-3 py-1 text-sm hover:bg-honey-hover'
                      : 'bg-white border border-sand-border text-ink-muted rounded-full px-3 py-1 text-sm hover:bg-honey-light'
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
                <th className="text-left text-sm font-medium text-ink-muted px-3 py-2">Tags</th>
                {user && <th className="text-left text-sm font-medium text-ink-muted px-3 py-2"></th>}
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
                  <td className="px-3 py-3 text-sm">
                    {activity.tags && activity.tags.length > 0
                      ? activity.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block bg-honey-light text-honey-dark rounded-full px-2 py-0.5 text-xs mr-1 mb-1"
                          >
                            {tag.name}
                          </span>
                        ))
                      : '\u2014'}
                  </td>
                  {user && (
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setCalendarActivity(activity)}
                        className="bg-sky text-white rounded-md px-2 py-1 text-xs hover:bg-sky-hover"
                        title="Add to calendar"
                      >
                        +
                      </button>
                    </td>
                  )}
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

      <AddToCalendarModal
        activity={calendarActivity}
        onClose={() => setCalendarActivity(null)}
        onAdd={handleAddToCalendar}
      />
    </div>
  );
}
