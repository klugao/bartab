import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Customers from './Customers';

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

const MockedCustomers = () => (
  <BrowserRouter>
    <Customers />
  </BrowserRouter>
);

describe('Customers Page', () => {
  it('deve renderizar página de clientes', () => {
    const { container } = render(<MockedCustomers />);
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar sem erros', () => {
    expect(() => render(<MockedCustomers />)).not.toThrow();
  });
});

