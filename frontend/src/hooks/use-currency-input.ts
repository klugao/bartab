import { useState } from 'react';

/**
 * Hook para entrada de valores monetários tipo PDV
 * Os valores são digitados em centavos e formatados automaticamente
 * 
 * Exemplo: digitar "7", "5", "0" resulta em "7,50"
 */
export const useCurrencyInput = (initialValue: number = 0) => {
  // Armazena o valor em centavos como string (sem formatação)
  const [cents, setCents] = useState(() => {
    const initialCents = Math.round(initialValue * 100);
    return initialCents === 0 ? '' : initialCents.toString();
  });

  /**
   * Formata centavos para exibição (ex: "750" -> "7,50")
   */
  const formatDisplay = (value: string): string => {
    if (!value || value === '0') return '0,00';
    
    // Remove zeros à esquerda
    const num = value.replace(/^0+/, '') || '0';
    
    // Preenche com zeros à esquerda para ter pelo menos 3 dígitos
    const paddedNum = num.padStart(3, '0');
    
    // Separa reais e centavos
    const reais = paddedNum.slice(0, -2);
    const centavos = paddedNum.slice(-2);
    
    // Formata os reais com separador de milhares
    const formattedReais = parseInt(reais).toLocaleString('pt-BR');
    
    return `${formattedReais},${centavos}`;
  };

  /**
   * Retorna o valor formatado para exibição
   */
  const displayValue = formatDisplay(cents);

  /**
   * Retorna o valor numérico (em reais)
   */
  const numericValue = cents ? parseInt(cents) / 100 : 0;

  /**
   * Handler para mudanças no input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove tudo exceto dígitos
    const onlyDigits = input.replace(/\D/g, '');
    
    // Limita a 10 dígitos (até 99.999.999,99)
    const limited = onlyDigits.slice(0, 10);
    
    setCents(limited);
  };

  /**
   * Handler para teclas especiais (backspace, delete, etc)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setCents(prev => prev.slice(0, -1));
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      e.preventDefault();
      setCents('');
    }
  };

  /**
   * Define um valor específico (em reais)
   */
  const setValue = (value: number) => {
    const newCents = Math.round(value * 100);
    setCents(newCents === 0 ? '' : newCents.toString());
  };

  /**
   * Reseta o valor para zero
   */
  const reset = () => {
    setCents('');
  };

  /**
   * Verifica se o campo está vazio
   */
  const isEmpty = !cents || cents === '0';

  return {
    displayValue,
    numericValue,
    handleChange,
    handleKeyDown,
    setValue,
    reset,
    isEmpty,
  };
};

