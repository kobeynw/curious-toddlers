import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const DAYS = [
  { key: 'sunday', label: 'Sun' },
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
];

export default function CalendarQuickAdd({ onActivityAdded }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    let stale = false;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api(`/api/activities?search=${encodeURIComponent(search)}`);
        if (!stale) {
          setSuggestions(data.activities || []);
          setShowDropdown(true);
        }
      } catch {
        if (!stale) setSuggestions([]);
      }
    }, 300);

    return () => {
      stale = true;
      clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Click-outside to close dropdown
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showDropdown]);

  function toggleDay(day) {
    setHint('');
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }

  async function handleSelect(activity) {
    if (selectedDays.size === 0) {
      setHint('Select one or more days first');
      return;
    }

    setLoading(true);
    setError('');
    setHint('');
    try {
      await api('/api/calendar/activities', {
        method: 'POST',
        body: JSON.stringify({ activityId: activity.id, days: [...selectedDays] }),
      });
      setSearch('');
      setSuggestions([]);
      setShowDropdown(false);
      onActivityAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-ink mb-3">Add Activity</h2>

      {/* Day selection */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {DAYS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleDay(key)}
            className={
              selectedDays.has(key)
                ? 'bg-sky text-white rounded-lg py-2 text-sm font-medium'
                : 'bg-sand-surface text-ink border border-sand-border rounded-lg py-2 text-sm hover:bg-sky-light'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {hint && <p className="text-sm text-terra-dark mb-2">{hint}</p>}

      {/* Search input + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities by title..."
          className="w-full border border-sand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky"
          disabled={loading}
        />

        {showDropdown && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-sand-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-ink-muted">
                No activities found.{' '}
                <Link to="/activities" className="text-sky underline hover:text-sky-dark">
                  Browse all activities
                </Link>
              </div>
            ) : (
              suggestions.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleSelect(activity)}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-sky-light transition-colors"
                >
                  {activity.title}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mt-3">{error}</div>
      )}
    </div>
  );
}
