import React from 'react';

interface SimpleCalendarTitleProps {
  mainTitle?: string;
  subtitle?: string;
  period?: string;
}

const SimpleCalendarTitle = ({ 
  mainTitle = "CALENDÁRIO DE CORRIDAS",
  subtitle = "RIO VERDE E REGIÃO", 
  period = "OUTUBRO/2025"
}: SimpleCalendarTitleProps) => {

  return (
    <div className="text-center mb-0 animate-slide-up" style={{ marginTop: '3rem' }}>
      {/* Título principal */}
      <h1 className="text-black dark:text-white font-black text-2xl md:text-5xl lg:text-6xl mb-6 tracking-wide drop-shadow-lg whitespace-nowrap">
        {mainTitle}
      </h1>
      
      {/* Subtítulo com ícone à esquerda, botão dark mode e fundo cinza */}
      <div className="flex items-center justify-center mb-6">
        {/* Ícone de calendário à esquerda */}
        <div 
          className="mr-4 p-3 shadow-lg"
          style={{ backgroundColor: 'rgba(102, 102, 102, 0.3)', borderRadius: '0.5rem' }}
        >
          <svg 
            className="w-8 h-8 text-black dark:text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>


        
        {/* Subtítulo com fundo cinza */}
        <div 
          className="inline-block px-8 py-3 transform -skew-x-12 shadow-xl"
          style={{ backgroundColor: 'rgba(102, 102, 102, 0.3)', borderRadius: '0.5rem' }}
        >
          <span className="text-black dark:text-white font-bold text-xl md:text-2xl lg:text-3xl tracking-wider transform skew-x-12 block">
            {subtitle}
          </span>
        </div>
      </div>
      
      {/* Período */}
      <p className="text-black dark:text-white font-bold text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] drop-shadow-md">
        {period}
      </p>
    </div>
  );
};

export default SimpleCalendarTitle;