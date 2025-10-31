import React from 'react';

// Configuração centralizada para os cards
export const CARD_CONFIG = {
  // Configurações do container
  container: {
    maxWidth: "max-w-2xl", // largura dos card
    margin: "mx-auto",
    spacing: "space-y-6"
  },
  
  // Configurações do card
  card: {
    borderRadius: "rounded-3xl", // arrendodadar os cantos dos cards
    padding: "p-3", // altura dos dos cards
    background: "bg-card",

    border: "border border-border",
    transition: "transition-all duration-500",
    hoverScale: "hover:scale-[1.02]",
    animation: "animate-fade-in",
    overflow: "overflow-hidden"
  },
  
  // Configurações do link
  link: {
    display: "block",
    position: "relative"
  },
  
  // Configurações do efeito de brilho
  glowEffect: {
    position: "absolute inset-0",
    background: "bg-gradient-to-r from-transparent via-primary/5 to-transparent",
    opacity: "opacity-0 group-hover:opacity-100",
    transition: "transition-opacity duration-300"
  },
  
  // Configurações do conteúdo
  content: {
    display: "flex items-center justify-between",
    position: "relative z-10"
  },
  
  // Configurações do título
  title: {
    fontSize: "text-xl",
    fontWeight: "font-bold",
    color: "text-card-foreground",
    hoverColor: "group-hover:text-primary",
    transition: "transition-colors duration-300"
  },
  
  // Configurações do botão de acesso
  arrow: {
    display: "flex items-center",
    color: "text-blue-500",
    hoverColor: "group-hover:text-blue-700",
    transition: "transition-colors duration-300",
    transform: "",
    fontSize: "",
    fontWeight: ""
  }
};

interface CardItem {
  id: string;
  titulo: string;
  link_externo?: string;
}

interface CardSectionProps {
  items: CardItem[];
  animationDelayMultiplier?: number;
}

const CardSection: React.FC<CardSectionProps> = ({ 
  items, 
  animationDelayMultiplier = 0.15 
}) => {
  const config = CARD_CONFIG;
  
  return (
    <div className={`${config.container.maxWidth} ${config.container.margin} ${config.container.spacing}`}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`group ${config.card.background} ${config.card.transition} ${config.card.hoverScale} ${config.card.border} ${config.card.animation} ${config.card.borderRadius} ${config.card.overflow}`}
          style={{ animationDelay: `${index * animationDelayMultiplier}s` }}
        >
          <a 
            href={item.link_externo || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${config.link.display} ${config.card.padding} ${config.link.position}`}
          >
            {/* Efeito de brilho no hover */}
            <div className={`${config.glowEffect.position} ${config.glowEffect.background} ${config.glowEffect.opacity} ${config.glowEffect.transition}`}></div>
            
            <div className={config.content.display + " " + config.content.position}>
              <h3 className={`${config.title.fontSize} ${config.title.fontWeight} ${config.title.color} ${config.title.hoverColor} ${config.title.transition}`}>
                {item.titulo}
              </h3>
              
              <div className={`${config.arrow.display} ${config.arrow.color} ${config.arrow.hoverColor} ${config.arrow.transition}`}>
                <span className="text-[10px] md:text-xs font-semibold bg-blue-50 group-hover:bg-blue-100 px-1 md:px-2 py-1 rounded-full transition-colors duration-300 whitespace-nowrap">
                  Acesse o site
                </span>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

export default CardSection;