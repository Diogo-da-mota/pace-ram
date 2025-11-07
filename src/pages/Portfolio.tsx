import { useEffect, useRef, useState } from 'react';
import { usePortfolioLinks } from '@/hooks/usePortfolioLinks';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  return (
    <div className="w-screen h-screen bg-background">
      <PortfolioContent />
    </div>
  );
};

const PortfolioContent = () => {
  const { activeLink, loading, error, getPortfolioLink } = usePortfolioLinks();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const loadTimeoutRef = useRef<number | null>(null);
  const iframeLoadedRef = useRef(false);

  useEffect(() => {
    getPortfolioLink();
  }, []);

  useEffect(() => {
    setIframeLoaded(false);
    setFallback(false);
    iframeLoadedRef.current = false;

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    if (activeLink?.url) {
      loadTimeoutRef.current = window.setTimeout(() => {
        if (!iframeLoadedRef.current) {
          setFallback(true);
        }
      }, 2000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [activeLink?.url]);

  if (loading) {
    return (
      <p className="text-center text-muted-foreground">Carregando portfolio...</p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Erro ao carregar link do portfolio: {error}</p>
    );
  }

  const savedUrl = activeLink?.url || null;

  if (!savedUrl) {
    return (
      <p className="text-center text-muted-foreground">
        Nenhum link configurado ainda. Adicione um link na área de Dashboard.
      </p>
    );
  }

  if (fallback) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-muted-foreground">
            Este site não permite ser exibido em iframe. Abriremos em uma nova aba.
          </p>
          <Button asChild>
            <a href={savedUrl} target="_blank" rel="noopener noreferrer">
              Abrir portfolio em nova aba
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={savedUrl}
      title="Portfolio Externo"
      className="w-full h-full border-0"
      onLoad={() => {
        iframeLoadedRef.current = true;
        setIframeLoaded(true);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
      }}
      onError={() => {
        setFallback(true);
      }}
      allow="clipboard-write; fullscreen; autoplay; encrypted-media"
    />
  );
};

export default Portfolio;