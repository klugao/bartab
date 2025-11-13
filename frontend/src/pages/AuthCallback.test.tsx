import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthCallback from './AuthCallback';

// Mock do useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    logout: vi.fn(),
  }),
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('?token=abc123')],
  };
});

describe('AuthCallback', () => {
  it('deve renderizar mensagem de carregamento', () => {
    render(<AuthCallback />);
    expect(screen.getByText(/autenticando/i)).toBeInTheDocument();
  });
});

