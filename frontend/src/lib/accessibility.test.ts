import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { announceToScreenReader, generateId, hasGoodContrast, srOnlyStyles } from './accessibility';

describe('accessibility utils', () => {
  describe('announceToScreenReader', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      document.body.innerHTML = '';
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      document.body.innerHTML = '';
    });

    it('deve criar um elemento de anúncio', () => {
      announceToScreenReader('Teste de mensagem');
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Teste de mensagem');
    });

    it('deve ter aria-atomic true', () => {
      announceToScreenReader('Mensagem completa');
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    });

    it('deve ter classe sr-only', () => {
      announceToScreenReader('Mensagem para leitores de tela');
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement?.classList.contains('sr-only')).toBe(true);
    });

    it('deve remover o elemento após 1 segundo', () => {
      announceToScreenReader('Mensagem temporária');
      
      expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
      
      vi.advanceTimersByTime(1000);
      
      expect(document.querySelector('[aria-live="polite"]')).toBeFalsy();
    });

    it('deve aceitar mensagens vazias', () => {
      announceToScreenReader('');
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('');
    });

    it('deve aceitar mensagens longas', () => {
      const longMessage = 'Esta é uma mensagem muito longa que precisa ser anunciada ao usuário através de um leitor de tela.';
      announceToScreenReader(longMessage);
      
      const announcement = document.querySelector('[aria-live="polite"]');
      expect(announcement?.textContent).toBe(longMessage);
    });
  });

  describe('generateId', () => {
    it('deve gerar um ID com prefixo', () => {
      const id = generateId('input');
      expect(id).toMatch(/^input-[a-f0-9]+$/);
    });

    it('deve gerar IDs únicos', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).not.toBe(id2);
    });

    it('deve aceitar diferentes prefixos', () => {
      const id1 = generateId('input');
      const id2 = generateId('button');
      
      expect(id1.startsWith('input-')).toBe(true);
      expect(id2.startsWith('button-')).toBe(true);
    });

    it('deve gerar IDs com comprimento adequado', () => {
      const id = generateId('label');
      expect(id.length).toBeGreaterThan(6); // 'label-' + uuid part
      expect(id.length).toBeLessThan(20); // Não deve ser muito longo
    });

    it('deve aceitar prefixos vazios', () => {
      const id = generateId('');
      expect(id).toMatch(/^-[a-f0-9]+$/);
    });

    it('deve aceitar prefixos com caracteres especiais', () => {
      const id = generateId('input_field_123');
      expect(id.startsWith('input_field_123-')).toBe(true);
    });
  });

  describe('hasGoodContrast', () => {
    it('deve retornar true para qualquer combinação de cores', () => {
      expect(hasGoodContrast('#ffffff', '#000000')).toBe(true);
    });

    it('deve aceitar cores em diferentes formatos', () => {
      expect(hasGoodContrast('white', 'black')).toBe(true);
      expect(hasGoodContrast('#fff', '#000')).toBe(true);
      expect(hasGoodContrast('rgb(255,255,255)', 'rgb(0,0,0)')).toBe(true);
    });

    it('deve retornar true para cores iguais', () => {
      expect(hasGoodContrast('#ffffff', '#ffffff')).toBe(true);
    });

    it('deve aceitar strings vazias', () => {
      expect(hasGoodContrast('', '')).toBe(true);
    });
  });

  describe('srOnlyStyles', () => {
    it('deve ter position absolute', () => {
      expect(srOnlyStyles.position).toBe('absolute');
    });

    it('deve ter width 1px', () => {
      expect(srOnlyStyles.width).toBe('1px');
    });

    it('deve ter height 1px', () => {
      expect(srOnlyStyles.height).toBe('1px');
    });

    it('deve ter padding 0', () => {
      expect(srOnlyStyles.padding).toBe('0');
    });

    it('deve ter margin -1px', () => {
      expect(srOnlyStyles.margin).toBe('-1px');
    });

    it('deve ter overflow hidden', () => {
      expect(srOnlyStyles.overflow).toBe('hidden');
    });

    it('deve ter clip rect', () => {
      expect(srOnlyStyles.clip).toBe('rect(0, 0, 0, 0)');
    });

    it('deve ter whiteSpace nowrap', () => {
      expect(srOnlyStyles.whiteSpace).toBe('nowrap');
    });

    it('deve ter border 0', () => {
      expect(srOnlyStyles.border).toBe('0');
    });

    it('deve ter todas as propriedades necessárias', () => {
      expect(srOnlyStyles).toHaveProperty('position');
      expect(srOnlyStyles).toHaveProperty('width');
      expect(srOnlyStyles).toHaveProperty('height');
      expect(srOnlyStyles).toHaveProperty('padding');
      expect(srOnlyStyles).toHaveProperty('margin');
      expect(srOnlyStyles).toHaveProperty('overflow');
      expect(srOnlyStyles).toHaveProperty('clip');
      expect(srOnlyStyles).toHaveProperty('whiteSpace');
      expect(srOnlyStyles).toHaveProperty('border');
    });
  });
});

