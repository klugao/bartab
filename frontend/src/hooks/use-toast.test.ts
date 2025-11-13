import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToast } from './use-toast';

describe('useToast Hook', () => {
  it('deve retornar funções de toast', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toast).toBeDefined();
    expect(typeof result.current.toast).toBe('function');
  });

  it('deve ter propriedades esperadas', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current).toHaveProperty('toast');
    expect(result.current).toHaveProperty('dismiss');
    expect(result.current).toHaveProperty('toasts');
  });

  it('deve ter array de toasts', () => {
    const { result } = renderHook(() => useToast());
    
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  it('deve ter função dismiss', () => {
    const { result } = renderHook(() => useToast());
    
    expect(typeof result.current.dismiss).toBe('function');
  });
});

