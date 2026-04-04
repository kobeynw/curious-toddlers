import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

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
      className={`bg-white rounded-md shadow-sm px-2 py-1.5 flex items-center justify-between gap-1 cursor-grab active:cursor-grabbing border border-sand-border ${isDragging ? 'opacity-50' : ''}`}
    >
      <span
        className="text-xs text-ink truncate flex-1 cursor-pointer"
        onClick={() => onActivityClick(activity)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {title}
      </span>
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
