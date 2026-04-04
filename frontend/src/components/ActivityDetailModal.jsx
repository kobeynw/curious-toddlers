import Modal from './Modal';
import { formatDuration, formatAge } from '../utils/format';

export default function ActivityDetailModal({ activity, onClose }) {
  return (
    <Modal open={!!activity} onClose={onClose} title={activity?.title} wide>
      {activity && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-ink">Description</p>
            <p className="text-ink-muted text-sm whitespace-pre-wrap">
              {activity.description || '\u2014'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Duration</p>
            <p className="text-ink-muted text-sm">{formatDuration(activity.duration)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Supplies</p>
            <p className="text-ink-muted text-sm">{activity.supplies || '\u2014'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Min Age</p>
            <p className="text-ink-muted text-sm">{formatAge(activity.minAge)}+</p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Tags</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {activity.tags && activity.tags.length > 0
                ? activity.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block bg-honey-light text-honey-dark rounded-full px-2 py-0.5 text-xs"
                    >
                      {tag.name}
                    </span>
                  ))
                : <span className="text-ink-muted text-sm">{'\u2014'}</span>}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
