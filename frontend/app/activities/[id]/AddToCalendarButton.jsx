'use client';

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AddToCalendarModal from '@/components/AddToCalendarModal';

export default function AddToCalendarButton({ activity }) {
  const { user } = useAuth();
  const fromCalendar = useSearchParams().get('from') === 'calendar';
  const [open, setOpen] = useState(false);

  // Hide for signed-out visitors and when the user arrived from the calendar
  // (they're already managing this activity there).
  if (!user || fromCalendar) return null;

  async function handleAddToCalendar(activityId, days) {
    await api('/api/calendar/activities', {
      method: 'POST',
      body: JSON.stringify({ activityId, days }),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-terra px-4 py-2.5 text-sm font-medium text-white hover:bg-terra-hover"
      >
        <CalendarPlus size={16} />
        Add to Calendar
      </button>

      <AddToCalendarModal
        activity={open ? activity : null}
        onClose={() => setOpen(false)}
        onAdd={handleAddToCalendar}
      />
    </>
  );
}
