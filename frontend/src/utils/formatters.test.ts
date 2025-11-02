import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatShortDate, formatFullDate } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores numéricos para moeda brasileira', () => {
      expect(formatCurrency(10)).toContain('10,00');
      expect(formatCurrency(10.5)).toContain('10,50');
      expect(formatCurrency(1234.56)).toContain('1.234,56');
    });

    it('deve formatar strings numéricas para moeda brasileira', () => {
      expect(formatCurrency('10')).toContain('10,00');
      expect(formatCurrency('10.5')).toContain('10,50');
      expect(formatCurrency('1234.56')).toContain('1.234,56');
    });

    it('deve lidar com valores zero', () => {
      expect(formatCurrency(0)).toContain('0,00');
      expect(formatCurrency('0')).toContain('0,00');
    });

    it('deve lidar com valores negativos', () => {
      const result = formatCurrency(-10.5);
      expect(result).toContain('10,50');
      expect(result).toContain('-');
    });

    it('deve retornar R$ 0,00 para valores inválidos', () => {
      expect(formatCurrency('abc')).toContain('0,00');
      expect(formatCurrency(NaN)).toContain('0,00');
    });

    it('deve formatar valores grandes corretamente', () => {
      expect(formatCurrency(1000000)).toContain('1.000.000,00');
    });

    it('deve arredondar para 2 casas decimais', () => {
      expect(formatCurrency(10.999)).toContain('11,00');
      expect(formatCurrency(10.555)).toContain('10,56');
    });
  });

  describe('formatDate', () => {
    it('deve formatar datas ISO válidas', () => {
      const dateString = '2025-11-02T15:30:00.000Z';
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/); // DD/MM/YYYY format
    });

    it('deve retornar mensagem de erro para strings vazias', () => {
      expect(formatDate('')).toBe('Data não disponível');
    });

    it('deve retornar mensagem de erro para datas inválidas', () => {
      expect(formatDate('invalid-date')).toBe('Data inválida');
    });

    it('deve usar fuso horário de São Paulo', () => {
      const dateString = '2025-11-02T12:00:00.000Z';
      const formatted = formatDate(dateString);
      // Deve incluir tanto data quanto hora
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
    });
  });

  describe('formatShortDate', () => {
    it('deve formatar data em formato curto (DD/MM HH:mm)', () => {
      const dateString = '2025-11-02T15:30:00.000Z';
      const formatted = formatShortDate(dateString);
      expect(formatted).toMatch(/\d{2}\/\d{2}.*\d{2}:\d{2}/);
    });

    it('deve lidar com datas inválidas', () => {
      expect(formatShortDate('')).toBe('Data não disponível');
      expect(formatShortDate('invalid')).toBe('Data inválida');
    });
  });

  describe('formatFullDate', () => {
    it('deve formatar data completa (DD/MM/YYYY HH:mm)', () => {
      const dateString = '2025-11-02T15:30:00.000Z';
      const formatted = formatFullDate(dateString);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
    });

    it('deve lidar com datas inválidas', () => {
      expect(formatFullDate('')).toBe('Data não disponível');
      expect(formatFullDate('invalid')).toBe('Data inválida');
    });
  });
});

