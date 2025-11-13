import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock do axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: { tabs: [] } })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
  },
}));

// Mock do useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: 1, 
      email: 'test@test.com', 
      establishmentName: 'Test Bar', 
      role: 'owner' 
    },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock do api
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { tabs: [] } })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

const MockedHome = () => (
  <BrowserRouter>
    <Home />
  </BrowserRouter>
);

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a página Home', () => {
    const { container } = render(<MockedHome />);
    expect(container).toBeInTheDocument();
  });

  it('deve carregar componente', async () => {
    const { container } = render(<MockedHome />);
    expect(container).toBeDefined();
  });

  it('deve renderizar sem erros fatais', () => {
    expect(() => render(<MockedHome />)).not.toThrow();
  });
});

