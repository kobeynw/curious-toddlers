import '@testing-library/jest-dom/vitest';
import './__mocks__/next-navigation'; // registers vi.mock('next/navigation', ...)
import './__mocks__/next-link'; // registers vi.mock('next/link', ...)

// Vitest does not load .env.local, so the api utility needs the base URL set here.
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
