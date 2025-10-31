import React from 'react';

interface RunnerLoaderProps {
  message?: string;
}

const RunnerLoader: React.FC<RunnerLoaderProps> = ({ message = "Carregando..." }) => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        {/* SVG do atleta correndo - baseado na imagem fornecida */}
        <div className="mb-8 relative">
          <svg
            width="120"
            height="120"
            viewBox="-191 65 256 256"
            className="animate-float"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Atleta correndo - baseado no SVG fornecido */}
            <g className="animate-pulse">
              {/* Corpo principal do atleta */}
              <path 
                d="M0.4,95.8c-5.1,10.8-17.9,15.5-28.8,10.5s-15.5-17.9-10.5-28.8S-20.9,62-10,67S5.5,85,0.4,95.8z M47.1,167.2
                c0,5.1-4.3,9.5-9.5,9.5H-6.8c-4.1,0-7.6-2.7-8.9-6.2l-8.1-21.9l-27.1,57.9l35.2,96.6c2.4,7-1.1,14.9-8.1,17.3
                c-7,2.4-14.9-1.1-17.3-8.1l-33.8-92.8l-17.3,36.8c-2.2,4.6-6.8,7.8-12.2,7.8h-54.1c-7.6,0-13.5-6-13.5-13.5s6-13.5,13.5-13.5h45.4
                l49.2-105.5l-21.1,7.6l-17.3,36.8c-2.4,4.9-7.8,6.8-12.7,4.6c-4.9-2.4-6.8-7.8-4.6-12.7l18.9-40.3c1.1-2.4,3.2-4.3,5.7-5.1l36-13
                c7.8-3.2,17.3-3.5,25.7,0.5l3.8,1.9c9.2,3.2,16,10.6,19.2,18.9l9.7,26.8h37.9C42.5,157.5,46.8,161.8,47.1,167.2z" 
                fill="white" 
                className="animate-run-cycle"
              />
            </g>
            
            {/* Efeito de movimento - linhas de velocidade */}
            <g className="animate-speed-lines">
              <line x1="-150" y1="150" x2="-120" y2="150" stroke="white" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
              <line x1="-160" y1="170" x2="-130" y2="170" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
              <line x1="-155" y1="190" x2="-125" y2="190" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
              <line x1="-165" y1="210" x2="-135" y2="210" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
            </g>
            
            {/* Partículas de movimento */}
            <g className="animate-speed-lines">
              <circle cx="-140" cy="140" r="1" fill="white" opacity="0.6" className="animate-bounce" />
              <circle cx="-145" cy="160" r="1.5" fill="white" opacity="0.4" className="animate-bounce" style={{animationDelay: '0.2s'}} />
              <circle cx="-135" cy="180" r="1" fill="white" opacity="0.5" className="animate-bounce" style={{animationDelay: '0.4s'}} />
            </g>
          </svg>
        </div>
        
        {/* Texto de loading */}
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-2 animate-pulse">{message}</h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunnerLoader;