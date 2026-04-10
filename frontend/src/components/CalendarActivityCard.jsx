import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatDuration } from '../utils/format';

export default function CalendarActivityCard({
  calendarEntryActivityId,
  activityId,
  title,
  activity,
  onRemove,
  onActivityClick,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(calendarEntryActivityId),
    data: { calendarEntryActivityId, activityId },
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-md shadow-sm px-2 py-1.5 flex items-start justify-between gap-1 cursor-grab active:cursor-grabbing border border-sand-border ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        className="flex-1 cursor-pointer"
        onClick={() => onActivityClick(activity)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-ink break-words">
          {title}
        </span>
        {activity.duration && (
          <p className="text-[10px] text-ink-muted mt-0.5">{formatDuration(activity.duration)}</p>
        )}
      </div>
      <button
        type="button"
        className="text-ink-muted hover:text-terra text-xs flex-shrink-0 p-0.5"
        onClick={(e) => { e.stopPropagation(); onRemove(calendarEntryActivityId); }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        &times;
      </button>
    </div>
  );
}
