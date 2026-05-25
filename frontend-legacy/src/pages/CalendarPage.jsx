import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CircleQuestionMark } from 'lucide-react';
import api from '../utils/api';
import { formatDuration } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import CalendarDayColumn from '../components/CalendarDayColumn';
import CalendarQuickAdd from '../components/CalendarQuickAdd';
import ActivityDetailModal from '../components/ActivityDetailModal';

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function emptyDays() {
  return Object.fromEntries(DAY_ORDER.map((d) => [d, []]));
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [days, setDays] = useState(emptyDays);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [detailActivity, setDetailActivity] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchCalendar = useCallback(async () => {
    setCalendarLoading(true);
    setError('');
    try {
      const data = await api('/api/calendar');
      const result = emptyDays();
      if (data.days) {
        for (const day of DAY_ORDER) {
          if (data.days[day]) result[day] = data.days[day];
        }
      }
      setDays(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCalendar();
  }, [user, fetchCalendar]);

  useEffect(() => {
    function handleClick(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    }
    if (showTooltip) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showTooltip]);

  async function handleRemove(calendarEntryActivityId) {
    // Optimistic update
    setDays((prev) => {
      const next = {};
      for (const day of DAY_ORDER) {
        next[day] = prev[day].filter((a) => a.calendarEntryActivityId !== calendarEntryActivityId);
      }
      return next;
    });

    try {
      await api('/api/calendar/activities/' + calendarEntryActivityId, { method: 'DELETE' });
    } catch (err) {
      setError(err.message);
      fetchCalendar();
    }
  }

  function handleDragStart(event) {
    for (const day of DAY_ORDER) {
      const found = days[day].find((a) => String(a.calendarEntryActivityId) === String(event.active.id));
      if (found) {
        setActiveCard(found);
        return;
      }
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    // Find source day
    let sourceDay = null;
    for (const day of DAY_ORDER) {
      if (days[day].some((a) => String(a.calendarEntryActivityId) === String(active.id))) {
        sourceDay = day;
        break;
      }
    }

    if (!sourceDay || sourceDay === over.id) return;

    const targetDay = over.id;
    const movedActivity = days[sourceDay].find(
      (a) => String(a.calendarEntryActivityId) === String(active.id)
    );

    // Optimistic update
    setDays((prev) => {
      const next = { ...prev };
      next[sourceDay] = prev[sourceDay].filter(
        (a) => String(a.calendarEntryActivityId) !== String(active.id)
      );
      next[targetDay] = [...prev[targetDay], movedActivity];
      return next;
    });

    try {
      await api('/api/calendar/activities/' + active.id + '/move', {
        method: 'PATCH',
        body: JSON.stringify({ toDay: targetDay }),
      });
    } catch (err) {
      setError(err.message);
      fetchCalendar();
    }
  }

  if (authLoading) return <p className="text-center text-ink-muted py-12">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-ink">My Weekly Calendar</h1>
        <div className="relative" ref={tooltipRef}>
          <button
            type="button"
            onClick={() => setShowTooltip((prev) => !prev)}
            className="text-ink-muted hover:text-ink text-lg font-bold leading-none items-center flex"
            aria-label="Calendar usage tips"
          >
            <CircleQuestionMark />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-sand-border rounded-md shadow-lg p-3 z-20">
              <ul className="text-sm text-ink space-y-1.5">
                <li>Drag activities between days to reschedule</li>
                <li>Tap an activity to see full details</li>
                <li>Use the search bar below to quickly add activities</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">{error}</div>
      )}

      {calendarLoading ? (
        <p className="text-center text-ink-muted py-12">Loading your calendar...</p>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {DAY_ORDER.map((day) => (
              <CalendarDayColumn
                key={day}
                day={day}
                activities={days[day]}
                onRemove={handleRemove}
                onActivityClick={setDetailActivity}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="bg-white rounded-md shadow-lg px-2 py-1.5 border-2 border-sky text-xs text-ink rotate-2 cursor-grabbing">
                {activeCard.title}
                {activeCard.duration && (
                  <p className="text-[10px] text-ink-muted mt-0.5">{formatDuration(activeCard.duration)}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="md:w-1/2">
        <CalendarQuickAdd onActivityAdded={fetchCalendar} />
      </div>

      <ActivityDetailModal activity={detailActivity} onClose={() => setDetailActivity(null)} />
    </div>
  );
}
