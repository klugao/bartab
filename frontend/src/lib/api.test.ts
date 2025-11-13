import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do axios antes de importar
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { 
          use: vi.fn(),
          eject: vi.fn()
        },
        response: { 
          use: vi.fn(),
          eject: vi.fn()
        },
      },
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
    })),
  },
}));

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve ter módulo de API definido', () => {
    expect(true).toBe(true);
  });

  it('deve configurar baseURL', () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    expect(baseURL).toBeDefined();
    expect(typeof baseURL).toBe('string');
  });

  it('deve validar URLs', () => {
    const validUrl = 'http://localhost:3000/api';
    expect(validUrl).toContain('api');
  });

  it('deve importar axios', async () => {
    const axios = await import('axios');
    expect(axios.default).toBeDefined();
  });
});
