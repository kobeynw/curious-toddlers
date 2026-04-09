import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivitiesPage from '../../src/pages/ActivitiesPage';

vi.mock('../../src/utils/api', () => ({
  default: vi.fn(),
}));

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
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

  it('renders activity cards with title, duration, age, and description', async () => {
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const card = screen.getByText('Finger Painting').closest('div.bg-sand-surface');
    expect(within(card).getByText('30 min')).toBeInTheDocument();
    expect(within(card).getByText('1 yr+')).toBeInTheDocument();
    expect(within(card).getByText('A fun sensory activity with paint.')).toBeInTheDocument();
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

  it('formats duration correctly in activity cards', async () => {
    const activities = [
      makeActivity({ id: 1, title: 'Quick', duration: 15 }),
      makeActivity({ id: 2, title: 'Medium', duration: 60 }),
      makeActivity({ id: 3, title: 'Long', duration: 90 }),
    ];
    mockApi(makeResponse(activities));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Quick')).toBeInTheDocument();
    });

    const quickCard = screen.getByText('Quick').closest('div.bg-sand-surface');
    const mediumCard = screen.getByText('Medium').closest('div.bg-sand-surface');
    const longCard = screen.getByText('Long').closest('div.bg-sand-surface');
    expect(within(quickCard).getByText('15 min')).toBeInTheDocument();
    expect(within(mediumCard).getByText('1 hr')).toBeInTheDocument();
    expect(within(longCard).getByText('1 hr 30 min')).toBeInTheDocument();
  });

  it('formats age correctly in activity cards', async () => {
    const activities = [
      makeActivity({ id: 1, title: 'Baby', min_age: 0 }),
      makeActivity({ id: 2, title: 'Infant', min_age: 6 }),
      makeActivity({ id: 3, title: 'Toddler', min_age: 12 }),
      makeActivity({ id: 4, title: 'Older', min_age: 18 }),
    ];
    mockApi(makeResponse(activities));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Baby')).toBeInTheDocument();
    });

    const babyCard = screen.getByText('Baby').closest('div.bg-sand-surface');
    const infantCard = screen.getByText('Infant').closest('div.bg-sand-surface');
    const toddlerCard = screen.getByText('Toddler').closest('div.bg-sand-surface');
    const olderCard = screen.getByText('Older').closest('div.bg-sand-surface');
    expect(within(babyCard).getByText('Newborn+')).toBeInTheDocument();
    expect(within(infantCard).getByText('6 mo+')).toBeInTheDocument();
    expect(within(toddlerCard).getByText('1 yr+')).toBeInTheDocument();
    expect(within(olderCard).getByText('1 yr 6 mo+')).toBeInTheDocument();
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

  it('sends age range params when age filter is changed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const ageSelects = screen.getByText('Age Range').parentElement.querySelectorAll('select');
    await user.selectOptions(ageSelects[0], '24');

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      const calls = api.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('min_age_from=24');
    });
  });

  it('sends duration range params when duration filter is changed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi(makeResponse([makeActivity()]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByText('Finger Painting')).toBeInTheDocument();
    });

    const durationSelects = screen.getByText('Duration Range').parentElement.querySelectorAll('select');
    await user.selectOptions(durationSelects[1], '60');

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      const calls = api.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall).toContain('duration_to=60');
    });
  });

  it('renders search input and range filter dropdowns', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search activities...')).toBeInTheDocument();
    });

    expect(screen.getByText('Age Range')).toBeInTheDocument();
    expect(screen.getByText('Duration Range')).toBeInTheDocument();
  });

  it('calls api with default range params on initial load', async () => {
    mockApi(makeResponse([]));

    render(<ActivitiesPage />);
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => {
      expect(api).toHaveBeenCalled();
    });

    const activitiesCall = api.mock.calls.find((c) => c[0].startsWith('/api/activities'));
    expect(activitiesCall[0]).toContain('min_age_from=0');
    expect(activitiesCall[0]).toContain('min_age_to=72');
    expect(activitiesCall[0]).toContain('duration_from=15');
    expect(activitiesCall[0]).toContain('duration_to=120');
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
