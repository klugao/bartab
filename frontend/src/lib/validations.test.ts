import { describe, it, expect } from 'vitest';
import {
  customerSchema,
  itemSchema,
  addItemToTabSchema,
  paymentSchema,
  debtPaymentSchema,
} from './validations';

describe('validations', () => {
  describe('customerSchema', () => {
    it('deve validar um cliente válido', () => {
      const validCustomer = {
        name: 'João Silva',
        phone: '11987654321',
        email: 'joao@example.com',
      };

      const result = customerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar nome vazio', () => {
      const invalidCustomer = {
        name: '',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidCustomer = {
        name: 'A',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('deve aceitar telefone e email opcionais', () => {
      const validCustomer = {
        name: 'João Silva',
      };

      const result = customerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const invalidCustomer = {
        name: 'João Silva',
        email: 'email-invalido',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar telefone muito curto', () => {
      const invalidCustomer = {
        name: 'João Silva',
        phone: '123',
      };

      const result = customerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });
  });

  describe('itemSchema', () => {
    it('deve validar um item válido', () => {
      const validItem = {
        name: 'Cerveja Heineken',
        price: 8.5,
      };

      const result = itemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar nome vazio', () => {
      const invalidItem = {
        name: '',
        price: 10,
      };

      const result = itemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar preço zero', () => {
      const invalidItem = {
        name: 'Item',
        price: 0,
      };

      const result = itemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar preço negativo', () => {
      const invalidItem = {
        name: 'Item',
        price: -5,
      };

      const result = itemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar preço muito alto', () => {
      const invalidItem = {
        name: 'Item',
        price: 10000,
      };

      const result = itemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('deve aceitar descrição e categoria opcionais', () => {
      const validItem = {
        name: 'Cerveja',
        price: 5.5,
        description: 'Cerveja gelada',
        category: 'Bebidas',
      };

      const result = itemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });
  });

  describe('addItemToTabSchema', () => {
    it('deve validar adição de item válida', () => {
      const validData = {
        itemId: 'item-123',
        qty: 2,
      };

      const result = addItemToTabSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar itemId vazio', () => {
      const invalidData = {
        itemId: '',
        qty: 2,
      };

      const result = addItemToTabSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quantidade zero', () => {
      const invalidData = {
        itemId: 'item-123',
        qty: 0,
      };

      const result = addItemToTabSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quantidade negativa', () => {
      const invalidData = {
        itemId: 'item-123',
        qty: -1,
      };

      const result = addItemToTabSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quantidade não inteira', () => {
      const invalidData = {
        itemId: 'item-123',
        qty: 2.5,
      };

      const result = addItemToTabSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quantidade muito alta', () => {
      const invalidData = {
        itemId: 'item-123',
        qty: 100,
      };

      const result = addItemToTabSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentSchema', () => {
    it('deve validar pagamento válido', () => {
      const validPayment = {
        method: 'dinheiro' as const,
        amount: 50.0,
      };

      const result = paymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('deve aceitar todos os métodos de pagamento', () => {
      const methods = ['dinheiro', 'debito', 'credito', 'pix', 'pagar_depois'];

      methods.forEach((method) => {
        const payment = {
          method,
          amount: 50.0,
        };
        const result = paymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('deve rejeitar método inválido', () => {
      const invalidPayment = {
        method: 'boleto',
        amount: 50.0,
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar valor zero', () => {
      const invalidPayment = {
        method: 'dinheiro',
        amount: 0,
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar valor negativo', () => {
      const invalidPayment = {
        method: 'dinheiro',
        amount: -10,
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('deve aceitar notas opcionais', () => {
      const validPayment = {
        method: 'dinheiro' as const,
        amount: 50.0,
        notes: 'Pagamento parcial',
      };

      const result = paymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });
  });

  describe('debtPaymentSchema', () => {
    it('deve validar pagamento de dívida válido', () => {
      const validPayment = {
        amount: 50.0,
        method: 'dinheiro' as const,
      };

      const result = debtPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('não deve aceitar "pagar_depois" como método', () => {
      const invalidPayment = {
        amount: 50.0,
        method: 'pagar_depois',
      };

      const result = debtPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('deve aceitar métodos válidos de pagamento', () => {
      const methods = ['dinheiro', 'debito', 'credito', 'pix'];

      methods.forEach((method) => {
        const payment = {
          amount: 50.0,
          method,
        };
        const result = debtPaymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('deve rejeitar valor zero', () => {
      const invalidPayment = {
        amount: 0,
        method: 'dinheiro',
      };

      const result = debtPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });
  });
});

