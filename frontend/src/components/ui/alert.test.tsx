import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('deve renderizar Alert corretamente', () => {
    render(<Alert>Mensagem de alerta</Alert>);
    expect(screen.getByText(/mensagem de alerta/i)).toBeInTheDocument();
  });

  it('deve aplicar variant default corretamente', () => {
    render(<Alert variant="default">Default Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-blue-200');
    expect(alert).toHaveClass('bg-blue-50');
  });

  it('deve aplicar variant destructive corretamente', () => {
    render(<Alert variant="destructive">Error Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-red-200');
    expect(alert).toHaveClass('bg-red-50');
  });

  it('deve ter role alert', () => {
    render(<Alert>Alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('deve aceitar className customizado', () => {
    render(<Alert className="custom-alert">Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-alert');
  });

  it('deve renderizar AlertTitle corretamente', () => {
    render(
      <Alert>
        <AlertTitle>Título do Alerta</AlertTitle>
      </Alert>
    );
    expect(screen.getByText(/título do alerta/i)).toBeInTheDocument();
  });

  it('deve renderizar AlertDescription corretamente', () => {
    render(
      <Alert>
        <AlertDescription>Descrição do alerta</AlertDescription>
      </Alert>
    );
    expect(screen.getByText(/descrição do alerta/i)).toBeInTheDocument();
  });

  it('deve renderizar Alert completo', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Erro de sistema</AlertTitle>
        <AlertDescription>Ocorreu um erro ao processar sua solicitação.</AlertDescription>
      </Alert>
    );
    
    expect(screen.getByText(/erro de sistema/i)).toBeInTheDocument();
    expect(screen.getByText(/ocorreu um erro/i)).toBeInTheDocument();
  });

  it('AlertTitle deve aplicar estilos padrão', () => {
    render(<AlertTitle>Título</AlertTitle>);
    const title = screen.getByText(/título/i);
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('tracking-tight');
  });

  it('AlertDescription deve aplicar estilos padrão', () => {
    render(<AlertDescription>Descrição</AlertDescription>);
    const description = screen.getByText(/descrição/i);
    expect(description).toHaveClass('text-sm');
  });

  it('AlertTitle deve aceitar className customizado', () => {
    render(<AlertTitle className="custom-title">Título</AlertTitle>);
    const title = screen.getByText(/título/i);
    expect(title).toHaveClass('custom-title');
  });

  it('AlertDescription deve aceitar className customizado', () => {
    render(<AlertDescription className="custom-desc">Descrição</AlertDescription>);
    const description = screen.getByText(/descrição/i);
    expect(description).toHaveClass('custom-desc');
  });
});

