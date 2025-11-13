import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import Login from './Login';

describe('Login', () => {
  it('deve renderizar o título da página', () => {
    render(<Login />);
    expect(screen.getByText(/BarTab/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de login com Google', () => {
    render(<Login />);
    const googleButton = screen.getByRole('button', { name: /entrar com google/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('deve renderizar a descrição do sistema', () => {
    render(<Login />);
    expect(screen.getByText(/sistema de gerenciamento/i)).toBeInTheDocument();
  });

  it('deve ter texto sobre login com Google', () => {
    render(<Login />);
    expect(screen.getByText(/faça login com sua conta google/i)).toBeInTheDocument();
  });
});

