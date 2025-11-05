/**
 * Utilitários para formatação de valores e datas
 */

/**
 * Formata um valor monetário para o formato brasileiro (com vírgula)
 * @param value - Valor como string ou número
 * @returns String formatada (ex: "R$ 12,50")
 */
export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formata uma data considerando o fuso horário local
 * @param dateString - String da data ISO
 * @param options - Opções de formatação
 * @returns String formatada da data
 */
export const formatDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  try {
    if (!dateString) return 'Data não disponível';
    
    // Cria a data considerando o fuso horário local
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleString('pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo' // Força o fuso horário de São Paulo
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error, dateString);
    return 'Data não disponível';
  }
};

/**
 * Formata uma data apenas com dia/mês e horário
 * @param dateString - String da data ISO
 * @returns String formatada (ex: "27/09 19:22")
 */
export const formatShortDate = (dateString: string): string => {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formata uma data completa
 * @param dateString - String da data ISO ou timestamp em milissegundos
 * @returns String formatada (ex: "27/09/2025 19:22")
 */
export const formatFullDate = (dateString: string | number): string => {
  const dateStr = typeof dateString === 'number' ? new Date(dateString).toISOString() : dateString;
  return formatDate(dateStr, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formata apenas a data sem horário
 * @param dateString - String da data ISO
 * @returns String formatada (ex: "27/09/2025")
 */
export const formatDateOnly = (dateString: string): string => {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata apenas o horário
 * @param date - Date object ou string da data ISO
 * @returns String formatada (ex: "19:22:30")
 */
export const formatTimeOnly = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Horário inválido';
    
    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return 'Horário não disponível';
  }
};
