import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: 1, 
      email: 'test@test.com', 
      establishmentName: 'Test Bar', 
      role: 'owner' 
    },
    logout: vi.fn(),
  }),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  },
}));

const MockedSettings = () => (
  <BrowserRouter>
    <Settings />
  </BrowserRouter>
);

describe('Settings Page', () => {
  it('deve renderizar página de configurações', () => {
    const { container } = render(<MockedSettings />);
    expect(container).toBeInTheDocument();
  });

  it('deve renderizar sem erros', () => {
    expect(() => render(<MockedSettings />)).not.toThrow();
  });
});

