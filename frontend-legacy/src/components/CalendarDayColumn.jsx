import { useDroppable } from '@dnd-kit/core';
import CalendarActivityCard from './CalendarActivityCard';

export default function CalendarDayColumn({ day, activities, onRemove, onActivityClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: day });

  return (
    <div className="flex-1 min-w-[140px] flex flex-col">
      <div className="text-sm font-semibold text-ink text-center py-2 bg-sky-light rounded-t-lg">
        {day.charAt(0).toUpperCase() + day.slice(1)}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[120px] bg-sand-surface rounded-b-lg p-2 space-y-2 flex-1 transition-all ${isOver ? 'ring-2 ring-sky bg-sky-light/30' : ''}`}
      >
        {activities.map((a) => (
          <CalendarActivityCard
            key={a.calendarEntryActivityId}
            calendarEntryActivityId={a.calendarEntryActivityId}
            activityId={a.activityId}
            title={a.title}
            activity={a}
            onRemove={onRemove}
            onActivityClick={onActivityClick}
          />
        ))}
      </div>
    </div>
  );
}
