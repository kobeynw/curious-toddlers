import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../../src/pages/AdminPage';

vi.mock('../../src/utils/api', () => ({
  default: vi.fn(),
}));

import api from '../../src/utils/api';

function makeActivity(overrides = {}) {
  return {
    id: 1,
    title: 'Finger Painting',
    description: 'A fun sensory activity with paint.',
    duration: 30,
    supplies: 'Paint, paper',
    min_age: 12,
    tags: [{ id: 1, name: 'Sensory' }],
    ...overrides,
  };
}

const defaultTags = [
  { id: 1, name: 'Sensory' },
  { id: 2, name: 'Outdoor' },
  { id: 3, name: 'Indoor' },
];

function mockApi({ activities = [], tags = defaultTags, overrides = {} } = {}) {
  api.mockImplementation((path, options) => {
    if (overrides[path]) return overrides[path](options);

    if (path.startsWith('/api/tags')) {
      return Promise.resolve({ tags });
    }
    if (path.startsWith('/api/activities')) {
      return Promise.resolve({ activities, nextCursor: null });
    }
    return Promise.resolve({});
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminPage', () => {
  it('shows loading then renders activity table', async () => {
    mockApi({ activities: [makeActivity()] });

    render(<AdminPage />);
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading activities...')).not.toBeInTheDocument();
  });

  it('renders table columns with formatted duration and age', async () => {
    mockApi({
      activities: [
        makeActivity({ id: 1, title: 'Short', duration: 15, min_age: 6 }),
        makeActivity({ id: 2, title: 'Long', duration: 90, min_age: 24 }),
      ],
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Short')).toBeInTheDocument();
    });

    const shortRow = screen.getByText('Short').closest('tr');
    expect(within(shortRow).getByText('15 min')).toBeInTheDocument();
    expect(within(shortRow).getByText('6 mo')).toBeInTheDocument();

    const longRow = screen.getByText('Long').closest('tr');
    expect(within(longRow).getByText('1 hr 30 min')).toBeInTheDocument();
    expect(within(longRow).getByText('2 yr')).toBeInTheDocument();
  });

  it('renders tag pills for each activity', async () => {
    mockApi({
      activities: [
        makeActivity({
          tags: [{ id: 1, name: 'Sensory' }, { id: 3, name: 'Indoor' }],
        }),
      ],
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const row = screen.getByText('Finger Painting').closest('tr');
    expect(within(row).getByText('Sensory')).toBeInTheDocument();
    expect(within(row).getByText('Indoor')).toBeInTheDocument();
  });

  it('shows empty state when there are no activities', async () => {
    mockApi({ activities: [] });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('No activities found.')).toBeInTheDocument();
    });
  });

  it('shows error message when activities fetch fails', async () => {
    api.mockImplementation((path) => {
      if (path.startsWith('/api/tags')) return Promise.resolve({ tags: defaultTags });
      return Promise.reject(new Error('Fetch failed'));
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  it('paginates through multiple pages of activities', async () => {
    const page1 = [makeActivity({ id: 20, title: 'Page1-A' })];
    const page2 = [makeActivity({ id: 10, title: 'Page2-A' })];

    api.mockImplementation((path) => {
      if (path.startsWith('/api/tags')) return Promise.resolve({ tags: defaultTags });
      if (path === '/api/activities') {
        return Promise.resolve({ activities: page1, nextCursor: 10 });
      }
      if (path.includes('cursor=10')) {
        return Promise.resolve({ activities: page2, nextCursor: null });
      }
      return Promise.resolve({ activities: [], nextCursor: null });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Page1-A')).toBeInTheDocument();
    });
    expect(screen.getByText('Page2-A')).toBeInTheDocument();
  });

  it('opens create modal with empty fields when "Add Activity" is clicked', async () => {
    const user = userEvent.setup();
    mockApi({ activities: [makeActivity()] });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Finger Painting')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Add Activity' }));

    expect(screen.getByRole('heading', { name: 'Add Activity' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Create Activity' })).toBeInTheDocument();
  });

  it('opens edit modal pre-filled with activity data', async () => {
    const user = userEvent.setup();
    mockApi({
      activities: [
        makeActivity({
          title: 'Edit Me',
          description: 'Existing desc',
          duration: 20,
          supplies: 'Paper',
          min_age: 6,
          tags: [{ id: 2, name: 'Outdoor' }],
        }),
      ],
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Edit Me')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('heading', { name: 'Edit Activity' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Edit Me');
    expect(screen.getByLabelText('Description')).toHaveValue('Existing desc');
    expect(screen.getByLabelText('Duration (minutes)')).toHaveValue(20);
    expect(screen.getByLabelText('Supplies')).toHaveValue('Paper');
    expect(screen.getByLabelText('Min Age (months)')).toHaveValue(6);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('submits POST to create and prepends new activity to the table', async () => {
    const user = userEvent.setup();
    const created = makeActivity({ id: 99, title: 'Brand New' });

    mockApi({
      activities: [makeActivity({ id: 1, title: 'Original' })],
      overrides: {
        '/api/admin/activities': (options) => {
          expect(options.method).toBe('POST');
          const body = JSON.parse(options.body);
          expect(body.title).toBe('Brand New');
          expect(body.tagIds).toEqual([]);
          return Promise.resolve({ activity: created });
        },
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Add Activity' }));
    await user.type(screen.getByLabelText('Title'), 'Brand New');
    await user.type(screen.getByLabelText('Description'), 'Description');
    await user.type(screen.getByLabelText('Duration (minutes)'), '10');
    await user.type(screen.getByLabelText('Min Age (months)'), '12');

    await user.click(screen.getByRole('button', { name: 'Create Activity' }));

    await waitFor(() => {
      expect(screen.getByText('Brand New')).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Add Activity' })).not.toBeInTheDocument();
  });

  it('submits PUT to update and replaces the activity row in the table', async () => {
    const user = userEvent.setup();
    const updated = makeActivity({ id: 1, title: 'Updated Title', duration: 45 });

    mockApi({
      activities: [makeActivity({ id: 1, title: 'Old Title' })],
      overrides: {
        '/api/admin/activities/1': (options) => {
          expect(options.method).toBe('PUT');
          return Promise.resolve({ activity: updated });
        },
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Old Title')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });
    expect(screen.queryByText('Old Title')).not.toBeInTheDocument();
  });

  it('shows server error in modal when submit fails', async () => {
    const user = userEvent.setup();

    mockApi({
      activities: [],
      overrides: {
        '/api/admin/activities': () => Promise.reject(new Error('Duplicate title')),
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('No activities found.')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Add Activity' }));
    await user.type(screen.getByLabelText('Title'), 'X');
    await user.type(screen.getByLabelText('Description'), 'Y');
    await user.type(screen.getByLabelText('Duration (minutes)'), '5');
    await user.type(screen.getByLabelText('Min Age (months)'), '0');

    await user.click(screen.getByRole('button', { name: 'Create Activity' }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate title')).toBeInTheDocument();
    });
    // Modal still open
    expect(screen.getByRole('heading', { name: 'Add Activity' })).toBeInTheDocument();
  });

  it('toggles tag pills to include them in the submitted tagIds', async () => {
    const user = userEvent.setup();
    const captured = { body: null };

    mockApi({
      activities: [],
      overrides: {
        '/api/admin/activities': (options) => {
          captured.body = JSON.parse(options.body);
          return Promise.resolve({ activity: makeActivity({ id: 50, title: 'With Tags' }) });
        },
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('No activities found.')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Add Activity' }));
    await user.type(screen.getByLabelText('Title'), 'With Tags');
    await user.type(screen.getByLabelText('Description'), 'D');
    await user.type(screen.getByLabelText('Duration (minutes)'), '5');
    await user.type(screen.getByLabelText('Min Age (months)'), '0');

    // Toggle tags
    await user.click(screen.getByRole('button', { name: 'Sensory' }));
    await user.click(screen.getByRole('button', { name: 'Outdoor' }));

    await user.click(screen.getByRole('button', { name: 'Create Activity' }));

    await waitFor(() => {
      expect(captured.body).not.toBeNull();
    });
    expect(captured.body.tagIds).toEqual([1, 2]);
  });

  it('pre-selects existing tag pills when editing', async () => {
    const user = userEvent.setup();
    mockApi({
      activities: [
        makeActivity({
          id: 1,
          title: 'Tagged',
          tags: [{ id: 2, name: 'Outdoor' }],
        }),
      ],
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Tagged')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const outdoorBtn = screen.getByRole('button', { name: 'Outdoor' });
    expect(outdoorBtn).toHaveClass('bg-honey');

    const sensoryBtn = screen.getByRole('button', { name: 'Sensory' });
    expect(sensoryBtn).not.toHaveClass('bg-honey');
  });

  it('opens delete confirmation modal and removes row on confirm', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.fn().mockResolvedValue({ message: 'Activity deleted' });

    mockApi({
      activities: [makeActivity({ id: 1, title: 'Doomed' })],
      overrides: {
        '/api/admin/activities/1': (options) => {
          expect(options.method).toBe('DELETE');
          return deleteSpy();
        },
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Doomed')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Confirmation modal appears — scope searches to its dialog
    const modalHeading = screen.getByRole('heading', { name: 'Delete Activity' });
    const modal = modalHeading.parentElement;
    expect(within(modal).getByText(/Doomed/)).toBeInTheDocument();

    await user.click(within(modal).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Doomed')).not.toBeInTheDocument();
    });
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('closes delete confirmation without deleting when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const deleteSpy = vi.fn();

    mockApi({
      activities: [makeActivity({ id: 1, title: 'Safe' })],
      overrides: {
        '/api/admin/activities/1': () => {
          deleteSpy();
          return Promise.resolve({});
        },
      },
    });

    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText('Safe')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'Delete Activity' })).not.toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
