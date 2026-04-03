import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivitiesPage from '../../src/pages/ActivitiesPage';

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
    supplies: 'Paint, paper, smock',
    min_age: 12,
    ...overrides,
  };
}

function makeResponse(activities = [], nextCursor = null) {
  return { activities, nextCursor };
}

// Helper: sets up the api mock to return tags for /api/tags and the given
// response for /api/activities. Accepts a single response or a function.
function mockApi(activitiesResponse) {
  const responseFn =
    typeof activitiesResponse === 'function'
      ? activitiesResponse
      : () => Promise.resolve(activitiesResponse);

  api.mockImplementation((path) => {
    if (path.startsWith('/api/tags')) {
      return Promise.resolve({ tags: [] });
    }
    return responseFn(path);
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('ActivitiesPage', () => {
  it('shows loading state then renders activities table', async () => {
    const activity = makeActivity();
    mockApi(makeResponse([activity]));

    render(<ActivitiesPage />);

    expect(screen.getByText('Loading activities...')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading activities...')).not.toBeInTheDocument();
  });

  it('renders table columns', async () => {
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Supplies')).toBeInTheDocument();
    expect(screen.getByText('Min Age')).toBeInTheDocument();
  });

  it('shows empty state when no activities returned', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(
        screen.getByText('No activities found. Try adjusting your search or filters.')
      ).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    mockApi(() => Promise.reject(new Error('Network error')));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('formats duration correctly in table cells', async () => {
    const activities = [
      makeActivity({ id: 1, duration: 15 }),
      makeActivity({ id: 2, duration: 60 }),
      makeActivity({ id: 3, duration: 90 }),
      makeActivity({ id: 4, duration: null }),
    ];
    mockApi(makeResponse(activities));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('15 min')).toBeInTheDocument();
    expect(within(table).getByText('1 hr')).toBeInTheDocument();
    expect(within(table).getByText('1 hr 30 min')).toBeInTheDocument();
  });

  it('formats age correctly in table cells', async () => {
    const activities = [
      makeActivity({ id: 1, min_age: 0 }),
      makeActivity({ id: 2, min_age: 6 }),
      makeActivity({ id: 3, min_age: 12 }),
      makeActivity({ id: 4, min_age: 18 }),
      makeActivity({ id: 5, min_age: null }),
    ];
    mockApi(makeResponse(activities));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Newborn+')).toBeInTheDocument();
    expect(within(table).getByText('6 mo+')).toBeInTheDocument();
    expect(within(table).getByText('1 yr+')).toBeInTheDocument();
    expect(within(table).getByText('1 yr 6 mo+')).toBeInTheDocument();
  });

  it('truncates long description text', async () => {
    const longDesc = 'A'.repeat(120);
    mockApi(makeResponse([makeActivity({ description: longDesc })]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('A'.repeat(100) + '\u2026')).toBeInTheDocument();
    });
  });

  it('debounces search input before fetching', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const initialCallCount = api.mock.calls.length;

    const searchInput = screen.getByPlaceholderText('Search activities...');
    await user.type(searchInput, 'paint');

    // Should not have made additional calls yet (debounce pending)
    expect(api.mock.calls.length).toBe(initialCallCount);

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(api.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    const lastCall = api.mock.calls[api.mock.calls.length - 1][0];
    expect(lastCall).toContain('search=paint');
  });

  it('sends min_age param when age filter is selected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const ageSelect = screen.getByDisplayValue('Any Age');
    await user.selectOptions(ageSelect, '36');

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      const calls = api.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('min_age=36');
    });
  });

  it('sends max_duration param when duration filter is selected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const durationSelect = screen.getByDisplayValue('Any Duration');
    await user.selectOptions(durationSelect, '30');

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      const calls = api.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('max_duration=30');
    });
  });

  it('renders search input and filter dropdowns', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search activities...')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Any Age')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Any Duration')).toBeInTheDocument();
  });

  it('calls api with no filter params on initial load', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(api).toHaveBeenCalled();
    });

    expect(api).toHaveBeenCalledWith('/api/activities?');
  });

  it('renders page heading', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);

    expect(screen.getByRole('heading', { name: 'Activities' })).toBeInTheDocument();
  });

  it('renders multiple activity rows', async () => {
    const activities = [
      makeActivity({ id: 1, title: 'Finger Painting' }),
      makeActivity({ id: 2, title: 'Block Stacking' }),
      makeActivity({ id: 3, title: 'Story Time' }),
    ];
    mockApi(makeResponse(activities));

    render(<ActivitiesPage />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    expect(screen.getByText('Block Stacking')).toBeInTheDocument();
    expect(screen.getByText('Story Time')).toBeInTheDocument();
  });
});
