import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCurrencyInput } from './use-currency-input';

describe('useCurrencyInput', () => {
  it('deve inicializar com valor zero', () => {
    const { result } = renderHook(() => useCurrencyInput());
    
    expect(result.current.displayValue).toBe('0,00');
    expect(result.current.numericValue).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  it('deve inicializar com valor fornecido', () => {
    const { result } = renderHook(() => useCurrencyInput(7.50));
    
    expect(result.current.displayValue).toBe('7,50');
    expect(result.current.numericValue).toBe(7.50);
    expect(result.current.isEmpty).toBe(false);
  });

  it('deve formatar entrada tipo PDV: 7, 5, 0 = 7,50', () => {
    const { result } = renderHook(() => useCurrencyInput(0));
    
    // Simular digitação do "7"
    act(() => {
      result.current.handleChange({ 
        target: { value: '7' } 
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.displayValue).toBe('0,07');
    expect(result.current.numericValue).toBe(0.07);

    // Simular digitação do "5"
    act(() => {
      result.current.handleChange({ 
        target: { value: '0,075' } // O input terá o valor anterior + novo dígito
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.displayValue).toBe('0,75');
    expect(result.current.numericValue).toBe(0.75);

    // Simular digitação do "0"
    act(() => {
      result.current.handleChange({ 
        target: { value: '0,750' } 
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.displayValue).toBe('7,50');
    expect(result.current.numericValue).toBe(7.50);
  });

  it('deve aceitar apenas dígitos', () => {
    const { result } = renderHook(() => useCurrencyInput(0));
    
    act(() => {
      result.current.handleChange({ 
        target: { value: 'abc123def456' } 
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.displayValue).toBe('1.234,56');
    expect(result.current.numericValue).toBe(1234.56);
  });

  it('deve limitar a 10 dígitos', () => {
    const { result } = renderHook(() => useCurrencyInput(0));
    
    act(() => {
      result.current.handleChange({ 
        target: { value: '12345678901234567890' } 
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Deve pegar apenas os primeiros 10 dígitos (1234567890 centavos = 12345678.90 reais)
    expect(result.current.numericValue).toBe(12345678.90);
  });

  it('deve resetar o valor', () => {
    const { result } = renderHook(() => useCurrencyInput(100));
    
    expect(result.current.numericValue).toBe(100);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.displayValue).toBe('0,00');
    expect(result.current.numericValue).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  it('deve definir um valor específico', () => {
    const { result } = renderHook(() => useCurrencyInput(0));
    
    act(() => {
      result.current.setValue(42.75);
    });
    
    expect(result.current.displayValue).toBe('42,75');
    expect(result.current.numericValue).toBe(42.75);
  });

  it('deve formatar valores com milhares', () => {
    const { result } = renderHook(() => useCurrencyInput(0));
    
    act(() => {
      result.current.setValue(1234.56);
    });
    
    expect(result.current.displayValue).toBe('1.234,56');
    expect(result.current.numericValue).toBe(1234.56);
  });

  it('deve lidar com backspace', () => {
    const { result } = renderHook(() => useCurrencyInput(7.50));
    
    act(() => {
      result.current.handleKeyDown({ 
        key: 'Backspace',
        preventDefault: vi.fn()
      } as any);
    });
    
    // Remove último dígito (0), ficando "75" centavos = 0,75
    expect(result.current.displayValue).toBe('0,75');
    expect(result.current.numericValue).toBe(0.75);
  });

  it('deve limpar com Delete ou Escape', () => {
    const { result } = renderHook(() => useCurrencyInput(100));
    
    act(() => {
      result.current.handleKeyDown({ 
        key: 'Delete',
        preventDefault: vi.fn()
      } as any);
    });
    
    expect(result.current.isEmpty).toBe(true);
    
    // Resetar e testar com Escape
    act(() => {
      result.current.setValue(200);
    });
    
    act(() => {
      result.current.handleKeyDown({ 
        key: 'Escape',
        preventDefault: vi.fn()
      } as any);
    });
    
    expect(result.current.isEmpty).toBe(true);
  });
});

