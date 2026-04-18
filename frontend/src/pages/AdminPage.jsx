import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDuration, formatAge } from '../utils/format';
import Modal from '../components/Modal';

export default function AdminPage() {
  const [activities, setActivities] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch all activities by paginating through cursor-based API
        let all = [];
        let cursor = null;
        let hasMore = true;
        while (hasMore) {
          const params = cursor ? `?cursor=${cursor}` : '';
          const data = await api(`/api/activities${params}`);
          all = [...all, ...data.activities];
          cursor = data.nextCursor;
          hasMore = cursor !== null;
        }
        setActivities(all);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    api('/api/tags')
      .then((data) => setAllTags(data.tags))
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditingActivity(null);
    setModalOpen(true);
  }

  function openEdit(activity) {
    setEditingActivity(activity);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingActivity(null);
  }

  function handleCreated(activity) {
    setActivities((prev) => [activity, ...prev]);
    closeModal();
  }

  function handleUpdated(activity) {
    setActivities((prev) => prev.map((a) => (a.id === activity.id ? activity : a)));
    closeModal();
  }

  async function handleDelete() {
    try {
      await api(`/api/admin/activities/${deleteConfirmId}`, { method: 'DELETE' });
      setActivities((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err.message);
      setDeleteConfirmId(null);
    }
  }

  const deleteActivity = activities.find((a) => a.id === deleteConfirmId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-ink mb-6">Activities Management</h1>

      <button
        type="button"
        onClick={openCreate}
        className="bg-terra text-white rounded-md px-4 py-2 hover:bg-terra-hover mb-6"
      >
        Add Activity
      </button>

      {error && (
        <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-center text-ink-muted py-12">Loading activities...</p>
      )}

      {!loading && activities.length === 0 && (
        <p className="text-center text-ink-muted py-12">No activities found.</p>
      )}

      {!loading && activities.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sand-border">
                <th className="py-2 pr-4 text-sm font-medium text-ink-muted">Title</th>
                <th className="py-2 pr-4 text-sm font-medium text-ink-muted">Duration</th>
                <th className="py-2 pr-4 text-sm font-medium text-ink-muted">Min Age</th>
                <th className="py-2 pr-4 text-sm font-medium text-ink-muted">Tags</th>
                <th className="py-2 text-sm font-medium text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-sand-border">
                  <td className="py-3 pr-4 text-ink">{activity.title}</td>
                  <td className="py-3 pr-4 text-ink">{formatDuration(activity.duration)}</td>
                  <td className="py-3 pr-4 text-ink">{formatAge(activity.min_age)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {(activity.tags || []).map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-honey-light text-ink text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(activity)}
                        className="text-terra hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(activity.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ActivityFormModal
        open={modalOpen}
        onClose={closeModal}
        activity={editingActivity}
        allTags={allTags}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} title="Delete Activity">
        <p className="text-ink mb-6">
          Are you sure you want to delete &lsquo;{deleteActivity?.title}&rsquo;? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setDeleteConfirmId(null)}
            className="border border-sand-border rounded-md px-4 py-2 text-ink hover:bg-sand-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ActivityFormModal({ open, onClose, activity, allTags, onCreated, onUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [supplies, setSupplies] = useState('');
  const [minAge, setMinAge] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = activity !== null;

  useEffect(() => {
    if (open && activity) {
      setTitle(activity.title || '');
      setDescription(activity.description || '');
      setDuration(activity.duration?.toString() || '');
      setSupplies(activity.supplies || '');
      setMinAge(activity.min_age?.toString() || '');
      setSelectedTagIds((activity.tags || []).map((t) => t.id));
    } else if (open) {
      setTitle('');
      setDescription('');
      setDuration('');
      setSupplies('');
      setMinAge('');
      setSelectedTagIds([]);
    }
    setError('');
  }, [open, activity]);

  function toggleTag(tagId) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Title is required');
    if (!description.trim()) return setError('Description is required');
    if (!duration || parseInt(duration, 10) < 1) return setError('Duration must be at least 1 minute');
    if (minAge === '' || parseInt(minAge, 10) < 0) return setError('Min age is required');

    const body = {
      title: title.trim(),
      description: description.trim(),
      duration: parseInt(duration, 10),
      supplies: supplies.trim() || null,
      min_age: parseInt(minAge, 10),
      tagIds: selectedTagIds,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        const data = await api(`/api/admin/activities/${activity.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        onUpdated(data.activity);
      } else {
        const data = await api('/api/admin/activities', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        onCreated(data.activity);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra';

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Activity' : 'Add Activity'} wide>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="admin-title" className="block text-sm font-medium text-ink mb-1">
            Title
          </label>
          <input
            id="admin-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-description" className="block text-sm font-medium text-ink mb-1">
            Description
          </label>
          <textarea
            id="admin-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-duration" className="block text-sm font-medium text-ink mb-1">
            Duration (minutes)
          </label>
          <input
            id="admin-duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={1}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-supplies" className="block text-sm font-medium text-ink mb-1">
            Supplies
          </label>
          <input
            id="admin-supplies"
            type="text"
            value={supplies}
            onChange={(e) => setSupplies(e.target.value)}
            placeholder="e.g., Paper, crayons, glue"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="admin-min-age" className="block text-sm font-medium text-ink mb-1">
            Min Age (months)
          </label>
          <input
            id="admin-min-age"
            type="number"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            min={0}
            className={inputClass}
            required
          />
        </div>

        {allTags.length > 0 && (
          <div>
            <span className="block text-sm font-medium text-ink mb-2">Tags</span>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={
                    selectedTagIds.includes(tag.id)
                      ? 'bg-honey text-white rounded-full px-3 py-1 text-sm hover:bg-honey-hover'
                      : 'bg-white border border-sand-border text-ink-muted rounded-full px-3 py-1 text-sm hover:bg-honey-light'
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-terra-light text-terra-dark text-sm rounded p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-terra text-sand py-2 rounded-md font-medium hover:bg-terra-hover transition-colors disabled:opacity-50"
        >
          {submitting
            ? (isEditing ? 'Saving...' : 'Creating...')
            : (isEditing ? 'Save Changes' : 'Create Activity')}
        </button>
      </form>
    </Modal>
  );
}
