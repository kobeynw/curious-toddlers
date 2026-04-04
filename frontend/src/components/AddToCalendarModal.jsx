import { useState, useEffect } from 'react';
import Modal from './Modal';

const DAYS = [
  { key: 'sunday', label: 'Sun' },
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
];

export default function AddToCalendarModal({ activity, onClose, onAdd }) {
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedDays(new Set());
    setError('');
  }, [activity]);

  function toggleDay(day) {
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

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await onAdd(activity.id, [...selectedDays]);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={!!activity} onClose={onClose} title="Add to Calendar">
      {activity && (
        <>
          <p className="text-ink-muted text-sm mb-4">{activity.title}</p>

          <div className="grid grid-cols-7 gap-2">
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

          {error && (
            <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mt-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-ink-muted hover:text-ink px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedDays.size === 0 || loading}
              className="bg-terra text-white px-4 py-2 rounded-md hover:bg-terra-hover disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add to Calendar'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
