import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Register from './Register';

// Mock do useNavigate e useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('?data=test')],
  };
});

// Mock do useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    logout: vi.fn(),
  }),
}));

describe('Register', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
  });

  it('deve renderizar o título de boas-vindas', () => {
    render(<Register />);
    expect(screen.getByText(/bem-vindo ao bartab/i)).toBeInTheDocument();
  });

  it('deve renderizar campo de nome do estabelecimento', () => {
    render(<Register />);
    expect(screen.getByLabelText(/nome do estabelecimento/i)).toBeInTheDocument();
  });

  it('deve ter um botão de criar conta', () => {
    render(<Register />);
    const registerButton = screen.getByRole('button', { name: /criar conta/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('deve renderizar descrição do cadastro', () => {
    render(<Register />);
    expect(screen.getByText(/completar seu cadastro/i)).toBeInTheDocument();
  });
});

