/**
 * Formata uma data ISO para formato brasileiro (evitando problemas de fuso horário)
 * @param dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns Data formatada (DD/MM/YYYY)
 */
export function formatDateToBrazilian(dateString: string): string {
  try {
    // Extrair ano, mês e dia diretamente da string ISO para evitar problemas de fuso horário
    const [ano, mes, dia] = dateString.split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Verifica se uma data é válida
 * @param dateString - Data no formato ISO
 * @returns true se a data for válida
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    // Verificar se a string está no formato correto YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    
    const [ano, mes, dia] = dateString.split('-').map(Number);
    
    // Verificar se os valores são válidos
    if (ano < 1900 || ano > 2100) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    
    // Verificar se a data é válida considerando o mês
    const date = new Date(ano, mes - 1, dia);
    return date.getFullYear() === ano && 
           date.getMonth() === mes - 1 && 
           date.getDate() === dia;
  } catch {
    return false;
  }
};

/**
 * Verifica se uma data é no passado (anterior ou igual a hoje)
 * @param dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns true se a data for passada ou hoje
 */
export const isDatePast = (dateString: string): boolean => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    return dateString <= hoje;
  } catch {
    return false;
  }
};

/**
 * Verifica se uma data é no futuro (posterior a hoje)
 * @param dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns true se a data for futura
 */
export const isDateFuture = (dateString: string): boolean => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    return dateString > hoje;
  } catch {
    return false;
  }
};