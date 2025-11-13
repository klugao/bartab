import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  ToastProvider,
} from './toast';

describe('Toast Components', () => {
  it('deve renderizar ToastProvider com children', () => {
    render(
      <ToastProvider>
        <div>Conteúdo do toast</div>
      </ToastProvider>
    );
    const element = screen.getByText(/conteúdo do toast/i);
    expect(element).toBeDefined();
  });

  it('deve renderizar ToastProvider sem children', () => {
    const { container } = render(<ToastProvider />);
    expect(container).toBeDefined();
  });
});

