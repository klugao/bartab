import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Debts from './Debts';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@test.com', role: 'owner' },
  }),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: [] })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  },
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

const MockedDebts = () => (
  <BrowserRouter>
    <Debts />
  </BrowserRouter>
);

describe('Debts Page', () => {
  it('deve renderizar página de dívidas', () => {
    const { container } = render(<MockedDebts />);
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar sem erros', () => {
    expect(() => render(<MockedDebts />)).not.toThrow();
  });
});

