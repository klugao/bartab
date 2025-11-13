import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from './toaster';
import { ToastProvider } from './toast';

describe('Toaster', () => {
  it('deve renderizar sem erros', () => {
    const { container } = render(
      <ToastProvider>
        <Toaster />
      </ToastProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('deve ser um componente válido', () => {
    expect(Toaster).toBeDefined();
    expect(typeof Toaster).toBe('function');
  });
});

