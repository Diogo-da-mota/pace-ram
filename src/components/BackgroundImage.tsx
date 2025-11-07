import React, { useState, useEffect, useMemo } from 'react';
import { useBackgroundPublico } from '@/hooks/useBackgroundPublico';

interface BackgroundImageProps {
  className?: string;
}

const BackgroundImage = React.memo(({ className = "" }: BackgroundImageProps) => {
  const { backgroundDesktop, backgroundMobile, loading } = useBackgroundPublico();
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Selecionar background apropriado com memoização
  const currentBackground = useMemo(() => {
    return isMobile ? backgroundMobile : backgroundDesktop;
  }, [isMobile, backgroundMobile, backgroundDesktop]);

  // Resetar estados ao trocar de imagem
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentBackground?.url_imagem]);

  // Memoizar o estilo do background para evitar recriação desnecessária
  const backgroundStyle = useMemo(() => {
    if (!currentBackground) return {};
    const base = {
      backgroundPosition: `${currentBackground.posicao_x}% ${currentBackground.posicao_y}%`,
      backgroundSize: `${currentBackground.zoom * 100}%`,
      opacity: currentBackground.opacidade,
      backgroundRepeat: 'no-repeat',
      // Otimizar backgroundAttachment para mobile
      backgroundAttachment: isMobile ? 'scroll' : 'fixed',
    } as React.CSSProperties;

    if (imageError) {
      // Fallback visual simples quando a imagem falha
      return {
        ...base,
        backgroundImage: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      };
    }

    return {
      ...base,
      backgroundImage: `url(${currentBackground.url_imagem})`,
    };
  }, [currentBackground, isMobile, imageError]);

  // Se não há background configurado ou ainda está carregando
  if (loading || !currentBackground) {
    return null;
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const handleImageError = () => {
    setImageError(true);
    // Revela o fallback com a mesma transição
    setImageLoaded(true);
  };

  return (
    <>
      {/* Preload da imagem para lazy loading */}
      <img
        src={currentBackground.url_imagem}
        alt=""
        style={{ display: 'none' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        loading="lazy"
      />
      
      {/* Background div */}
      <div
        className={`fixed inset-0 w-full h-full transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={backgroundStyle}
        aria-hidden="true"
      />
    </>
  );
});

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;