import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from './Reports';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com', role: 'owner' },
  }),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: { report: {} } })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  },
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { report: {} } })),
  },
}));

const MockedReports = () => (
  <BrowserRouter>
    <Reports />
  </BrowserRouter>
);

describe('Reports Page', () => {
  it('deve renderizar página de relatórios', () => {
    const { container } = render(<MockedReports />);
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar sem erros', () => {
    expect(() => render(<MockedReports />)).not.toThrow();
  });
});

