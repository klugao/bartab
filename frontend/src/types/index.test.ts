import { describe, it, expect } from 'vitest';
import type { User, Tab, Item, Customer } from './index';

describe('Type Definitions', () => {
  it('deve aceitar um objeto User válido', () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      establishmentName: 'Test Bar',
      role: 'owner',
    };
    
    expect(user.id).toBe(1);
    expect(user.email).toBe('test@example.com');
  });

  it('deve aceitar um objeto Tab válido', () => {
    const tab: Partial<Tab> = {
      id: 1,
      customerId: 1,
      status: 'open',
    };
    
    expect(tab.id).toBe(1);
    expect(tab.status).toBe('open');
  });

  it('deve aceitar um objeto Item válido', () => {
    const item: Partial<Item> = {
      id: 1,
      name: 'Cerveja',
      price: 5.00,
    };
    
    expect(item.name).toBe('Cerveja');
    expect(item.price).toBe(5.00);
  });

  it('deve aceitar um objeto Customer válido', () => {
    const customer: Partial<Customer> = {
      id: 1,
      name: 'João Silva',
    };
    
    expect(customer.name).toBe('João Silva');
  });
});

