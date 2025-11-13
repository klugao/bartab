import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatFullDate,
  formatDateOnly,
  formatTimeOnly,
} from './formatters';

describe('formatters - Testes Adicionais', () => {
  describe('formatCurrency - Casos Extremos', () => {
    it('deve formatar valores negativos', () => {
      const result = formatCurrency(-50.00);
      expect(result).toContain('-');
      expect(result).toContain('50');
    });

    it('deve formatar valores muito grandes', () => {
      const result = formatCurrency(9999999.99);
      expect(result).toContain('9.999.999,99');
    });

    it('deve formatar centavos', () => {
      const result = formatCurrency(0.99);
      expect(result).toContain('0,99');
    });

    it('deve formatar string numérica', () => {
      const result = formatCurrency('123.45');
      expect(result).toContain('123,45');
    });
  });

  describe('formatDate - Casos Diversos', () => {
    it('deve retornar string válida para datas', () => {
      const result = formatDate('2025-01-01T00:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve incluir ano na formatação', () => {
      const result = formatDate('2025-12-31T23:59:59Z');
      expect(result).toContain('2025');
    });

    it('deve lidar com diferentes formatos ISO', () => {
      const result = formatDate('2025-06-15T12:30:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatShortDate - Validações', () => {
    it('deve retornar string válida', () => {
      const result = formatShortDate('2025-03-20T15:45:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve ser mais curto que formatFullDate', () => {
      const date = '2025-03-20T15:45:00Z';
      const short = formatShortDate(date);
      const full = formatFullDate(date);
      expect(short.length).toBeLessThanOrEqual(full.length);
    });
  });

  describe('formatFullDate - Timestamp', () => {
    it('deve formatar timestamp de Date.now()', () => {
      const now = Date.now();
      const result = formatFullDate(now);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve formatar timestamp específico', () => {
      const timestamp = new Date('2025-05-10T10:30:00').getTime();
      const result = formatFullDate(timestamp);
      expect(result).toContain('2025');
    });
  });

  describe('formatDateOnly - Sem Horário', () => {
    it('deve retornar string válida', () => {
      const result = formatDateOnly('2025-07-25T18:30:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve incluir o ano', () => {
      const result = formatDateOnly('2025-07-25T18:30:00Z');
      expect(result).toContain('2025');
    });
  });

  describe('formatTimeOnly - Horários', () => {
    it('deve formatar horário da manhã', () => {
      const result = formatTimeOnly('2025-01-01T08:00:00Z');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('deve formatar horário da noite', () => {
      const result = formatTimeOnly('2025-01-01T22:30:45Z');
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('deve formatar meia-noite', () => {
      const result = formatTimeOnly(new Date('2025-01-01T00:00:00Z'));
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('deve lidar com Date object', () => {
      const date = new Date('2025-06-15T14:25:30Z');
      const result = formatTimeOnly(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Integração entre formatadores', () => {
    it('deve formatar consistentemente', () => {
      const date = '2025-03-10T15:20:00Z';
      const formatted1 = formatDate(date);
      const formatted2 = formatDate(date);
      expect(formatted1).toBe(formatted2);
    });

    it('formatadores devem retornar strings', () => {
      const isoString = '2025-08-15T10:30:00Z';
      expect(typeof formatFullDate(isoString)).toBe('string');
      expect(typeof formatDateOnly(isoString)).toBe('string');
      expect(typeof formatShortDate(isoString)).toBe('string');
    });
  });
});

