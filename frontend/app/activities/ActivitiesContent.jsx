'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Timer, Baby } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDuration, formatAge } from '@/lib/format';
import AddToCalendarModal from '@/components/AddToCalendarModal';

const AGE_OPTIONS = [
  { value: 0, label: 'Newborn' },
  { value: 6, label: '6 mo' },
  { value: 12, label: '1 yr' },
  { value: 18, label: '1.5 yr' },
  { value: 24, label: '2 yr' },
  { value: 36, label: '3 yr' },
  { value: 48, label: '4 yr' },
  { value: 60, label: '5 yr' },
  { value: 72, label: '6 yr' },
];

const DURATION_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1 hr 30 min' },
  { value: 120, label: '2 hr' },
];

function truncate(text, max = 100) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function ActivitiesContent() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [ageFrom, setAgeFrom] = useState(0);
  const [ageTo, setAgeTo] = useState(72);
  const [durationFrom, setDurationFrom] = useState(5);
  const [durationTo, setDurationTo] = useState(120);
  const [error, setError] = useState('');

  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [calendarActivity, setCalendarActivity] = useState(null);

  const nextCursorRef = useRef(nextCursor);
  const loadingMoreRef = useRef(loadingMore);

  useEffect(() => { nextCursorRef.current = nextCursor; }, [nextCursor]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

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
      params.set('min_age_from', ageFrom);
      params.set('min_age_to', ageTo);
      params.set('duration_from', durationFrom);
      params.set('duration_to', durationTo);
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
  }, [search, ageFrom, ageTo, durationFrom, durationTo, selectedTagIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchActivities]);

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
    'border border-sand-border-dark rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-ink mb-6">Activities</h1>

      <div className="bg-sand-surface rounded-lg shadow p-4 mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${inputClass}`}
        />

        <hr className="border-sand-border" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <span className="text-sm font-medium text-ink mb-2 block">Age Range</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <select
                  value={ageFrom}
                  onChange={(e) => setAgeFrom(parseInt(e.target.value, 10))}
                  className={`w-full ${inputClass}`}
                >
                  {AGE_OPTIONS.filter((o) => o.value <= ageTo).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-ink-muted">to</span>
              <div className="flex-1 flex flex-col gap-1">
                <select
                  value={ageTo}
                  onChange={(e) => setAgeTo(parseInt(e.target.value, 10))}
                  className={`w-full ${inputClass}`}
                >
                  {AGE_OPTIONS.filter((o) => o.value >= ageFrom).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px bg-sand-border" />
          <hr className="md:hidden border-sand-border" />

          <div className="flex-1">
            <span className="text-sm font-medium text-ink mb-2 block">Duration Range</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <select
                  value={durationFrom}
                  onChange={(e) => setDurationFrom(parseInt(e.target.value, 10))}
                  className={`w-full ${inputClass}`}
                >
                  {DURATION_OPTIONS.filter((o) => o.value <= durationTo).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <span className="text-ink-muted">to</span>
              <div className="flex-1 flex flex-col gap-1">
                <select
                  value={durationTo}
                  onChange={(e) => setDurationTo(parseInt(e.target.value, 10))}
                  className={`w-full ${inputClass}`}
                >
                  {DURATION_OPTIONS.filter((o) => o.value >= durationFrom).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {allTags.length > 0 && (
          <>
            <hr className="border-sand-border" />
            <div>
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
          </>
        )}
      </div>

      {error && (
        <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-center text-ink-muted py-12">Loading activities...</p>
      )}

      {!loading && activities.length === 0 && (
        <p className="text-center text-ink-muted py-12">
          No activities found. Try adjusting your search or filters.
        </p>
      )}

      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="relative bg-sand-surface border border-sand-border rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Covering link makes the whole card navigable while keeping the
                  "Add to Calendar" button a sibling (valid HTML, no nested <a>). */}
              <Link
                href={`/activities/${activity.id}`}
                aria-label={activity.title}
                className="absolute inset-0 z-0 rounded-lg"
              />

              <h2 className="relative z-10 text-lg font-semibold text-ink pointer-events-none">{activity.title}</h2>

              <div className="relative z-10 flex gap-4 mt-2 text-sm text-ink pointer-events-none">
                <span className="flex items-center gap-1"><Timer size={14} />{formatDuration(activity.duration)}</span>
                <span className="flex items-center gap-1"><Baby size={14} />{formatAge(activity.min_age)}+</span>
              </div>

              <p className="relative z-10 text-ink-muted text-sm mt-2 flex-1 pointer-events-none">
                {truncate(activity.description, 100)}
              </p>

              {user && (
                <button
                  type="button"
                  onClick={() => setCalendarActivity(activity)}
                  className="relative z-10 mt-4 bg-terra text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-terra-hover self-start"
                >
                  Add to Calendar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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
