import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('deve renderizar corretamente', () => {
    render(<Label>Nome</Label>);
    expect(screen.getByText(/nome/i)).toBeInTheDocument();
  });

  it('deve aceitar htmlFor', () => {
    render(<Label htmlFor="input-id">Email</Label>);
    const label = screen.getByText(/email/i);
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('deve aceitar className customizado', () => {
    render(<Label className="custom-class">Label</Label>);
    const label = screen.getByText(/label/i);
    expect(label).toHaveClass('custom-class');
  });

  it('deve renderizar children corretamente', () => {
    render(
      <Label>
        Campo <strong>obrigatório</strong>
      </Label>
    );
    expect(screen.getByText(/campo/i)).toBeInTheDocument();
    expect(screen.getByText(/obrigatório/i)).toBeInTheDocument();
  });

  it('deve aplicar estilos padrão', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText(/label/i);
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });
});

