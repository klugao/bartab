import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Items from './Items';

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

const MockedItems = () => (
  <BrowserRouter>
    <Items />
  </BrowserRouter>
);

describe('Items Page', () => {
  it('deve renderizar página de itens', () => {
    const { container } = render(<MockedItems />);
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar sem erros', () => {
    expect(() => render(<MockedItems />)).not.toThrow();
  });
});

