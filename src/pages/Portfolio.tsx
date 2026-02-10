import { useEffect, useRef, useState, useCallback } from 'react';
import { usePortfolioLinks } from '@/hooks/usePortfolioLinks';
import { usePortfolioPreview } from '@/hooks/usePortfolioPreview';
import { Button } from '@/components/ui/button';
import PortfolioPreviewCard from '@/components/PortfolioPreviewCard';

/**
 * Tempo para considerar que o iframe falhou em carregar.
 * Quando CSP bloqueia, o browser dispara onLoad mas renderiza error page.
 * Não há API JS confiável para detectar isso em cross-origin,
 * por isso usamos uma heurística: verificamos se o iframe tem
 * dimensões de conteúdo visível após o load.
 */
const IFRAME_CHECK_DELAY = 2000;

const Portfolio = () => {
  return (
    <div className="w-screen h-screen bg-background">
      <PortfolioContent />
    </div>
  );
};

const PortfolioContent = () => {
  const { activeLink, loading, error, getPortfolioLink } = usePortfolioLinks();
  const savedUrl = activeLink?.url || null;

  const {
    ogData,
    loading: ogLoading,
    iframeBlocked,
    setIframeBlocked,
  } = usePortfolioPreview(savedUrl || undefined);

  const [iframeReady, setIframeReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getPortfolioLink();
  }, []);

  // Resetar estados quando URL muda
  useEffect(() => {
    setIframeReady(false);
    setIframeBlocked(false);
    setChecking(true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [savedUrl, setIframeBlocked]);

  /**
   * Quando o iframe dispara onLoad, verificamos se é um carregamento real
   * ou se o CSP bloqueou (browser renderiza sua error page). 
   * A heurística: tentamos acessar contentWindow.length — se for cross-origin
   * e carregou com sucesso, isso lança SecurityError (bom sinal!).
   * Se não lança nada e retorna 0, provavelmente é about:blank ou error page.
   */
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Aguarda um pouco para o browser renderizar
    timerRef.current = setTimeout(() => {
      try {
        // Se é cross-origin com conteúdo real, acessar contentDocument lança SecurityError
        // Isso é BOM — significa que o site carregou!
        const doc = iframe.contentDocument;

        // Se conseguimos acessar o document sem erro, é same-origin ou about:blank/error
        if (doc) {
          // Verificar se tem conteúdo real
          const bodyText = doc.body?.innerText?.trim() || '';
          const hasContent = bodyText.length > 10;

          if (hasContent) {
            // Same-origin com conteúdo real
            setIframeReady(true);
            setChecking(false);
          } else {
            // Provavelmente error page do browser ou about:blank
            setIframeBlocked(true);
            setChecking(false);
          }
        } else {
          // document é null — situação incomum, considerar bloqueado
          setIframeBlocked(true);
          setChecking(false);
        }
      } catch (e) {
        // SecurityError = cross-origin = site carregou com sucesso!
        if (e instanceof DOMException && e.name === 'SecurityError') {
          setIframeReady(true);
          setChecking(false);
        } else {
          // Outro erro — considerar bloqueado
          setIframeBlocked(true);
          setChecking(false);
        }
      }
    }, IFRAME_CHECK_DELAY);
  }, [setIframeBlocked]);

  const handleIframeError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIframeBlocked(true);
    setChecking(false);
  }, [setIframeBlocked]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-muted-foreground">Carregando portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-red-500">
          Erro ao carregar link do portfolio: {error}
        </p>
      </div>
    );
  }

  if (!savedUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-muted-foreground">
          Nenhum link configurado ainda. Adicione um link na área de Dashboard.
        </p>
      </div>
    );
  }

  // Se iframe foi bloqueado, exibe card de preview OG
  if (iframeBlocked) {
    return (
      <div className="w-full h-full overflow-auto">
        <PortfolioPreviewCard
          url={savedUrl}
          ogData={ogData}
          loading={ogLoading}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading enquanto verifica se iframe vai carregar */}
      {(checking || !iframeReady) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">
              Carregando conteúdo externo...
            </p>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={savedUrl}
        title="Portfolio Externo"
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Botão flutuante para abrir em nova aba */}
      {iframeReady && (
        <div className="absolute bottom-4 right-4 z-20 opacity-50 hover:opacity-100 transition-opacity">
          <Button asChild variant="outline" size="sm">
            <a href={savedUrl} target="_blank" rel="noopener noreferrer">
              Abrir em nova aba
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
