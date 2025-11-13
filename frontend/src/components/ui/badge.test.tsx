import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('deve renderizar corretamente', () => {
    render(<Badge>Novo</Badge>);
    expect(screen.getByText(/novo/i)).toBeInTheDocument();
  });

  it('deve aplicar variant default corretamente', () => {
    render(<Badge variant="default">Default</Badge>);
    const badge = screen.getByText(/default/i);
    expect(badge).toHaveClass('bg-primary');
  });

  it('deve aplicar variant secondary corretamente', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText(/secondary/i);
    expect(badge).toHaveClass('bg-secondary');
  });

  it('deve aplicar variant destructive corretamente', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText(/destructive/i);
    expect(badge).toHaveClass('bg-destructive');
  });

  it('deve aplicar variant outline corretamente', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText(/outline/i);
    expect(badge).toHaveClass('text-foreground');
  });

  it('deve aplicar variant success corretamente', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText(/success/i);
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('deve aceitar className customizado', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badge = screen.getByText(/badge/i);
    expect(badge).toHaveClass('custom-class');
  });

  it('deve renderizar children corretamente', () => {
    render(<Badge>Status: <strong>Ativo</strong></Badge>);
    expect(screen.getByText(/status:/i)).toBeInTheDocument();
    expect(screen.getByText(/ativo/i)).toBeInTheDocument();
  });

  it('deve aplicar estilos padrão', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText(/badge/i);
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('border');
  });
});

