import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('deve renderizar Card corretamente', () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText(/conteúdo do card/i)).toBeInTheDocument();
  });

  it('deve renderizar CardHeader corretamente', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    );
    expect(screen.getByText(/header/i)).toBeInTheDocument();
  });

  it('deve renderizar CardTitle corretamente', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText(/título do card/i)).toBeInTheDocument();
  });

  it('deve renderizar CardDescription corretamente', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Descrição do card</CardDescription>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText(/descrição do card/i)).toBeInTheDocument();
  });

  it('deve renderizar CardContent corretamente', () => {
    render(
      <Card>
        <CardContent>Conteúdo principal</CardContent>
      </Card>
    );
    expect(screen.getByText(/conteúdo principal/i)).toBeInTheDocument();
  });

  it('deve renderizar CardFooter corretamente', () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
  });

  it('deve renderizar Card completo', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText(/título/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/conteúdo/i)).toBeInTheDocument();
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
  });

  it('Card deve aceitar className customizado', () => {
    const { container } = render(<Card className="custom-card">Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });

  it('CardTitle deve aplicar estilos padrão', () => {
    render(<CardTitle>Título</CardTitle>);
    const title = screen.getByText(/título/i);
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');
  });

  it('CardDescription deve aplicar estilos padrão', () => {
    render(<CardDescription>Descrição</CardDescription>);
    const description = screen.getByText(/descrição/i);
    expect(description).toHaveClass('text-base');
    expect(description).toHaveClass('text-muted-foreground');
  });
});

