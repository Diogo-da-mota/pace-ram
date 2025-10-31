import { useState, useCallback, useRef, useEffect } from 'react';

interface UrlMetadata {
  title?: string;
  description?: string;
  image?: string;
}

interface UseUrlPreviewReturn {
  loading: boolean;
  error: string | null;
  metadata: UrlMetadata | null;
  fetchMetadata: (url: string) => Promise<void>;
}

// Função para validar URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Função para extrair metadados do HTML
const extractMetadata = (html: string): UrlMetadata => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Função auxiliar para buscar meta tag
  const getMetaContent = (selector: string): string | null => {
    const element = doc.querySelector(selector);
    return element?.getAttribute('content') || null;
  };
  
  // Buscar Open Graph tags primeiro
  const ogTitle = getMetaContent('meta[property="og:title"]');
  const ogDescription = getMetaContent('meta[property="og:description"]');
  const ogImage = getMetaContent('meta[property="og:image"]');
  
  // Fallback para meta tags tradicionais
  const title = ogTitle || 
    getMetaContent('meta[name="title"]') || 
    doc.querySelector('title')?.textContent || 
    undefined;
    
  const description = ogDescription || 
    getMetaContent('meta[name="description"]') || 
    undefined;
    
  const image = ogImage || 
    getMetaContent('meta[name="image"]') || 
    undefined;
  
  return {
    title: title?.trim(),
    description: description?.trim(),
    image: image?.trim()
  };
};

export const useUrlPreview = (url?: string): UseUrlPreviewReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verificar se é URL de exemplo - será usado dentro do useEffect
  const isExampleUrl = !url || url.includes('exemplo.com') || url.includes('example.com');

  const fetchMetadata = useCallback(async (url: string) => {
    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validar URL
    if (!url.trim()) {
      setMetadata(null);
      setError(null);
      return;
    }

    if (!isValidUrl(url)) {
      setError('URL inválida');
      setMetadata(null);
      return;
    }

    // Implementar debounce de 300ms (mais rápido)
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Criar novo AbortController para esta requisição
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Lista de proxies CORS para fallback (ordem otimizada)
        const proxies = [
          {
            name: 'allorigins.win',
            url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            parseResponse: (data: any) => data.contents
          },
          {
            name: 'corsproxy.io',
            url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
            parseResponse: (data: any) => data
          },
          {
            name: 'cors-proxy.htmldriven',
            url: `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
            parseResponse: (data: any) => data
          },
          {
            name: 'codetabs',
            url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
            parseResponse: (data: any) => data
          },
          {
            name: 'cors-anywhere (heroku)',
            url: `https://cors-anywhere.herokuapp.com/${url}`,
            parseResponse: (data: any) => data
          }
        ];

        let lastError: Error | null = null;
        let extractedMetadata: UrlMetadata | null = null;

        // Tentar cada proxy até encontrar um que funcione
        for (const proxy of proxies) {
          try {
            // Timeout mais agressivo de 3 segundos para cada proxy
            const timeoutId = setTimeout(() => {
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
              }
            }, 3000);

            const response = await fetch(proxy.url, {
              signal,
              headers: {
                'Accept': 'application/json, text/html, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
              data = await response.json();
              const htmlContent = proxy.parseResponse(data);
              if (!htmlContent) {
                throw new Error('Conteúdo HTML não encontrado na resposta');
              }
              extractedMetadata = extractMetadata(htmlContent);
            } else {
              // Resposta direta em HTML
              const htmlContent = await response.text();
              extractedMetadata = extractMetadata(htmlContent);
            }

            // Se chegou até aqui, o proxy funcionou
            break;
            
          } catch (proxyError) {
            lastError = proxyError instanceof Error ? proxyError : new Error(String(proxyError));
            
            // Se não é o último proxy, continua tentando
            if (proxy !== proxies[proxies.length - 1]) {
              continue;
            }
          }
        }

        // Se nenhum proxy funcionou
        if (!extractedMetadata) {
          throw lastError || new Error('Todos os proxies falharam');
        }
        
        setMetadata(extractedMetadata);
        
        // Verificar se encontrou pelo menos uma informação útil
        if (!extractedMetadata.title && !extractedMetadata.image && !extractedMetadata.description) {
          setError('Nenhum metadado encontrado na página');
        }
        
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Requisição foi cancelada, não mostrar erro
            return;
          }
          
          if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            setError('Não foi possível acessar a URL. Verifique se o link está correto.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Erro desconhecido ao buscar metadados');
        }
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar timeout de debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // Cancelar requisições pendentes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Executar automaticamente quando a URL mudar
  useEffect(() => {
    if (isExampleUrl) {
      setMetadata(null);
      setError(null);
      setLoading(false);
      return;
    }
    
    if (url) {
      fetchMetadata(url);
    } else {
      setMetadata(null);
      setError(null);
    }
  }, [url, fetchMetadata, isExampleUrl]);

  return {
    loading,
    error,
    metadata,
    fetchMetadata
  };
};