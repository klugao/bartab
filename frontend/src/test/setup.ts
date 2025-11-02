import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Estende matchers do Vitest com matchers do jest-dom
expect.extend(matchers);

// Limpa após cada teste
afterEach(() => {
  cleanup();
});

