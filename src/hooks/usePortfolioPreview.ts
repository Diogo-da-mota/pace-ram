import { useState, useCallback, useRef, useEffect } from 'react';

export interface OgData {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

interface UsePortfolioPreviewReturn {
  ogData: OgData | null;
  loading: boolean;
  error: string | null;
  iframeBlocked: boolean;
  setIframeBlocked: (blocked: boolean) => void;
  fetchOgData: (url: string) => Promise<void>;
}

const CACHE_PREFIX = 'portfolio_og_';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const extractOgData = (html: string, url: string): OgData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const getMeta = (selector: string): string | null =>
    doc.querySelector(selector)?.getAttribute('content') || null;

  const title =
    getMeta('meta[property="og:title"]') ||
    getMeta('meta[name="title"]') ||
    doc.querySelector('title')?.textContent?.trim() ||
    undefined;

  const description =
    getMeta('meta[property="og:description"]') ||
    getMeta('meta[name="description"]') ||
    undefined;

  const image =
    getMeta('meta[property="og:image"]') ||
    getMeta('meta[name="image"]') ||
    undefined;

  const siteName =
    getMeta('meta[property="og:site_name"]') ||
    undefined;

  let favicon: string | undefined;
  try {
    const domain = new URL(url).hostname;
    favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    favicon = undefined;
  }

  return {
    title: title?.trim(),
    description: description?.trim(),
    image: image?.trim(),
    favicon,
    siteName: siteName?.trim(),
  };
};

const getCachedOg = (url: string): OgData | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + url);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_PREFIX + url);
      return null;
    }
    return cached.data as OgData;
  } catch {
    return null;
  }
};

const setCachedOg = (url: string, data: OgData): void => {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + url,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // sessionStorage cheio — ignora
  }
};

export const usePortfolioPreview = (url?: string): UsePortfolioPreviewReturn => {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOgData = useCallback(async (targetUrl: string) => {
    if (!targetUrl || !isValidUrl(targetUrl)) {
      setOgData(null);
      setError(targetUrl ? 'URL inválida' : null);
      return;
    }

    // Verifica cache
    const cached = getCachedOg(targetUrl);
    if (cached) {
      setOgData(cached);
      setLoading(false);
      return;
    }

    // Cancela requisição anterior
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setError(null);

    const proxies = [
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        parse: (d: any) => d.contents,
        isJson: true,
      },
      {
        url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        parse: (d: any) => d,
        isJson: false,
      },
      {
        url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        parse: (d: any) => d,
        isJson: false,
      },
    ];

    let result: OgData | null = null;
    let lastErr: Error | null = null;

    for (const proxy of proxies) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);

        const res = await fetch(proxy.url, {
          signal: signal.aborted ? signal : ctrl.signal,
          headers: { Accept: 'application/json, text/html, */*' },
        });
        clearTimeout(timer);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let html: string;
        if (proxy.isJson) {
          const json = await res.json();
          html = proxy.parse(json);
          if (!html) throw new Error('Conteúdo vazio');
        } else {
          html = await res.text();
        }

        result = extractOgData(html, targetUrl);
        break;
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
        if (proxy !== proxies[proxies.length - 1]) continue;
      }
    }

    if (signal.aborted) return;

    if (result) {
      setOgData(result);
      setCachedOg(targetUrl, result);

      if (!result.title && !result.image && !result.description) {
        setError('Nenhum metadado encontrado na página');
      }
    } else {
      setError(lastErr?.message || 'Não foi possível buscar metadados');
      // Mesmo sem metadados do proxy, gerar dados mínimos
      try {
        const domain = new URL(targetUrl).hostname;
        const fallback: OgData = {
          title: domain,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        };
        setOgData(fallback);
      } catch {
        setOgData(null);
      }
    }

    setLoading(false);
  }, []);

  // Buscar automaticamente quando URL muda
  useEffect(() => {
    if (url) {
      fetchOgData(url);
    } else {
      setOgData(null);
      setError(null);
      setIframeBlocked(false);
    }

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [url, fetchOgData]);

  return { ogData, loading, error, iframeBlocked, setIframeBlocked, fetchOgData };
};
