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

  useEffect(() => {
    getPortfolioLink();
  }, []);

  useEffect(() => {
    setIframeLoaded(false);
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

  return (
    <div className="w-full h-full relative">
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <p className="text-muted-foreground">Carregando conteúdo externo...</p>
        </div>
      )}
      <iframe
        src={savedUrl}
        title="Portfolio Externo"
        className="w-full h-full border-0"
        onLoad={() => setIframeLoaded(true)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* Botão flutuante discreto para abrir em nova aba caso falhe */}
      <div className="absolute bottom-4 right-4 z-20 opacity-50 hover:opacity-100 transition-opacity">
        <Button asChild variant="outline" size="sm">
          <a href={savedUrl} target="_blank" rel="noopener noreferrer">
            Abrir em nova aba
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Portfolio;