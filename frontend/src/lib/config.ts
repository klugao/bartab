/**
 * Configurações centralizadas da aplicação
 * Todas as URLs e configurações da API devem ser definidas aqui
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Validação da URL da API
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Validação em produção: garantir que a URL termina com /api
if (import.meta.env.PROD && !API_BASE_URL.endsWith('/api')) {
  console.error('⚠️ AVISO: API_BASE_URL deve terminar com /api');
  console.error('   URL atual:', API_BASE_URL);
  console.error('   URL esperada: https://bartab-backend-312426210115.us-central1.run.app/api');
}

