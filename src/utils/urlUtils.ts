/**
 * Utilitários para manipulação e validação de URLs
 */

/**
 * Valida se uma string é uma URL válida
 * @param url - String a ser validada
 * @returns boolean indicando se é uma URL válida
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url.trim());
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Normaliza uma URL adicionando protocolo se necessário
 * @param url - URL a ser normalizada
 * @returns URL normalizada
 */
export const normalizeUrl = (url: string): string => {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return '';
  }
  
  // Se não tem protocolo, adiciona https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  
  return trimmedUrl;
};

/**
 * Extrai o domínio de uma URL
 * @param url - URL da qual extrair o domínio
 * @returns Domínio ou string vazia se inválida
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

/**
 * Verifica se uma URL de imagem é válida
 * @param imageUrl - URL da imagem
 * @returns Promise<boolean> indicando se a imagem é válida
 */
export const isValidImageUrl = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isValidUrl(imageUrl)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // Timeout de 3 segundos para verificação de imagem
    setTimeout(() => resolve(false), 3000);
  });
};

/**
 * Função de debounce genérica
 * @param func - Função a ser executada com debounce
 * @param delay - Delay em milissegundos
 * @returns Função com debounce aplicado
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Cria uma versão com timeout de uma Promise
 * @param promise - Promise original
 * @param timeoutMs - Timeout em milissegundos
 * @returns Promise com timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout de ${timeoutMs}ms excedido`));
      }, timeoutMs);
    })
  ]);
};

/**
 * Sanitiza uma URL removendo parâmetros desnecessários
 * @param url - URL a ser sanitizada
 * @returns URL sanitizada
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Remove parâmetros de tracking comuns
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source'
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
};