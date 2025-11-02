import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes do Tailwind corretamente', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('deve lidar com classes condicionais', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('deve ignorar valores falsy', () => {
      const result = cn('base-class', false, null, undefined, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('deve mesclar classes conflitantes corretamente', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('deve lidar com arrays de classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('deve retornar string vazia quando não há classes', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });
});

