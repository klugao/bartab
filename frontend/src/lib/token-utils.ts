/**
 * Utilitários para gerenciamento de tokens JWT
 */

/**
 * Decodifica um token JWT sem verificar a assinatura
 * Retorna o payload do token
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

/**
 * Verifica se um token está expirado ou próximo de expirar
 * @param token - Token JWT
 * @param bufferMinutes - Minutos de antecedência para considerar "próximo de expirar" (padrão: 60 minutos)
 * @returns true se o token está expirado ou próximo de expirar
 */
export function isTokenExpiringSoon(token: string, bufferMinutes: number = 60): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Se não conseguir decodificar, considera expirado
  }

  const expirationTime = payload.exp * 1000; // Converte para milissegundos
  const currentTime = Date.now();
  const bufferTime = bufferMinutes * 60 * 1000; // Converte buffer para milissegundos

  // Retorna true se o token expira em menos de bufferMinutes
  return expirationTime - currentTime < bufferTime;
}

/**
 * Verifica se um token está completamente expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Obtém o tempo restante até a expiração do token em milissegundos
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return Math.max(0, expirationTime - currentTime);
}

