import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar variant default corretamente', () => {
    render(<Button variant="default">Botão</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('deve aplicar variant destructive corretamente', () => {
    render(<Button variant="destructive">Deletar</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('deve aplicar variant outline corretamente', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('deve aplicar variant secondary corretamente', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('deve aplicar variant ghost corretamente', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('deve aplicar variant link corretamente', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('deve aplicar size default corretamente', () => {
    render(<Button size="default">Botão</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
  });

  it('deve aplicar size sm corretamente', () => {
    render(<Button size="sm">Pequeno</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
  });

  it('deve aplicar size lg corretamente', () => {
    render(<Button size="lg">Grande</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-14');
  });

  it('deve aplicar size icon corretamente', () => {
    render(<Button size="icon">Icon</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('w-12');
  });

  it('deve estar desabilitado quando disabled é true', () => {
    render(<Button disabled>Desabilitado</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deve aceitar className customizado', () => {
    render(<Button className="custom-class">Botão</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('deve renderizar como child quando asChild é true', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('deve não chamar onClick quando desabilitado', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Desabilitado</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

