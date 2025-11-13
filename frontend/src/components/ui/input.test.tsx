import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('deve renderizar corretamente', () => {
    render(<Input placeholder="Digite algo" />);
    expect(screen.getByPlaceholderText(/digite algo/i)).toBeInTheDocument();
  });

  it('deve aceitar valor padrão', () => {
    render(<Input defaultValue="Valor inicial" />);
    const input = screen.getByDisplayValue(/valor inicial/i);
    expect(input).toBeInTheDocument();
  });

  it('deve chamar onChange quando o valor mudar', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('deve aceitar type password', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('deve aceitar type email', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('deve aceitar type number', () => {
    render(<Input type="number" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('deve estar desabilitado quando disabled é true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('deve aceitar className customizado', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('deve aceitar placeholder', () => {
    render(<Input placeholder="Texto de exemplo" />);
    expect(screen.getByPlaceholderText(/texto de exemplo/i)).toBeInTheDocument();
  });

  it('deve aceitar maxLength', () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('deve aceitar required', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('deve aceitar aria-label', () => {
    render(<Input aria-label="Campo de entrada" />);
    const input = screen.getByLabelText(/campo de entrada/i);
    expect(input).toBeInTheDocument();
  });
});

