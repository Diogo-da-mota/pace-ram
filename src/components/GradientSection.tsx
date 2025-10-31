import React from 'react';

interface GradientSectionProps {
  children: React.ReactNode;
  className?: string;
}

const GradientSection: React.FC<GradientSectionProps> = ({ children, className = "" }) => {
  return (
    <section className={`pt-28 pb-20 section-padding relative bg-gray-1000 ${className}`}>
      {/* Efeito de partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full animate-float" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-1/3 w-3 h-3 rounded-full animate-float" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-1 h-1 rounded-full animate-float" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', animationDelay: '3s' }}></div>
      </div>
      
      {/* Conteúdo personalizado */}
      <div className="container-85 relative z-10">
        {children}
      </div>
    </section>
  );
};

export default GradientSection;