import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Calendar, Clock, MapPin } from "lucide-react";

interface RaceCardProps {
  title: string;
  date: string;
  location: string;
  image: string;
  footerText: string;
  link: string;
  // Novos props para sincronização de status
  status?: 'inscricoes_abertas' | 'em_andamento' | 'encerrado';
  evento_calendario_id?: string;
  // Prop para diferenciar corridas recentes de em breve
  isRecente?: boolean;
  // Prop para layout mobile vertical
  isMobileVertical?: boolean;
}

// Função para obter as configurações do badge de status (reutilizada do EventoCard)
const getStatusConfig = (status?: string) => {
  switch (status) {
    case 'inscricoes_abertas':
      return {
        text: 'Inscrições abertas',
        className: 'bg-green-500 hover:bg-green-600 text-white',
        icon: Clock
      };
    case 'em_andamento':
      return {
        text: 'Em andamento',
        className: 'bg-gray-500 hover:bg-gray-600 text-white',
        icon: Clock
      };
    case 'encerrado':
      return {
        text: 'Inscrições encerrada',
        className: 'bg-red-500 hover:bg-red-600 text-white',
        icon: Clock
      };
    default:
      return {
        text: 'Inscrições abertas',
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: Image
      };
  }
};

const RaceCard = ({ 
  title, 
  date, 
  location, 
  image, 
  footerText, 
  link, 
  status, 
  evento_calendario_id,
  isRecente = false,
  isMobileVertical = false
}: RaceCardProps) => {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Obter configuração do status (se houver sincronização com calendário)
  const statusConfig = getStatusConfig(status);
  
  // Para corridas recentes, sempre usar footerText; para em breve, usar status se houver
  const buttonText = isRecente ? footerText : (status ? statusConfig.text : footerText);
  const buttonClassName = isRecente ? 'bg-blue-600 hover:bg-blue-700 text-white' : (status ? statusConfig.className : 'bg-blue-600 hover:bg-blue-700 text-white');
  const ButtonIcon = isRecente ? Image : (status ? statusConfig.icon : Image);

  // Se isMobileVertical for true, renderizar layout condicional
  if (isMobileVertical) {
    return (
      <>
        {/* Mobile: Layout horizontal com imagem lateral */}
        <div className="md:hidden flex gap-4 bg-gray-900 rounded-2xl overflow-hidden p-4">
          {/* Imagem menor na lateral */}
          <div className="w-24 h-24 flex-shrink-2 rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Conteúdo à direita */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-2 mb-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botão full width abaixo do card (mobile) */}
        <div className="md:hidden -mt-2">
          <Button 
            onClick={handleClick}
            disabled={!link}
            className={`w-full ${buttonClassName} rounded-full py-2 text-sm transition-colors duration-200`}
          >
            <ButtonIcon className="h-3 w-3 mr-1" />
            {buttonText}
          </Button>
        </div>
        
        {/* Desktop: Layout normal (grid) */}
        <div className="hidden md:block">
          <Card className="group overflow-hidden rounded-lg md:rounded-xl bg-card transition-all duration-300 hover:scale-105 border border-border animate-fade-in h-64 md:h-72">
            <div className="h-full flex flex-col">
              {/* Image with badge overlay - SESSÃO 4 implementada */}
              <div className="relative h-36 md:h-44 overflow-hidden">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Badge com data e local sobre a imagem - 98% da largura */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[98%] bg-gray-900 bg-opacity-90 text-white px-2 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{date} • {location}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-2 md:p-3 flex flex-col flex-1">
                {/* Título na posição original */}
                <h3 className="text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2">
                  {title}
                </h3>

                {/* Espaço flexível para empurrar o botão para baixo */}
                <div className="flex-1"></div>

                {/* Botão com status dinâmico - 98% da largura */}
                <div className="mt-auto flex justify-center">
                  <Button
                    onClick={handleClick}
                    className={`w-[105%] ${buttonClassName} rounded-full py-1 md:py-1.5 text-xs md:text-sm transition-colors duration-200`}
                    disabled={!link}
                  >
                    <ButtonIcon className="h-3 w-3 mr-1" />
                    {buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Layout padrão (quando isMobileVertical é false)
  return (
    <Card className="group overflow-hidden rounded-lg md:rounded-xl bg-card transition-all duration-300 hover:scale-105 border border-border animate-fade-in h-64 md:h-72">
      <div className="h-full flex flex-col">
        {/* Image with badge overlay - SESSÃO 4 implementada */}
        <div className="relative h-36 md:h-44 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Badge com data e local sobre a imagem - 98% da largura */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[98%] bg-gray-900 bg-opacity-90 text-white px-2 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{date} • {location}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-2 md:p-3 pb-6 md:pb-8 flex flex-col flex-1">
          {/* Título na posição original */}
          <h3 className="text-sm md:text-base font-bold text-foreground mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Espaço flexível para empurrar o botão para baixo */}
          <div className="flex-1"></div>

          {/* Botão com status dinâmico - 98% da largura */}
          <div className="mt-auto flex justify-center">
            <Button
              onClick={handleClick}
              className={`w-[105%] ${buttonClassName} rounded-full py-1 md:py-1.5 text-xs md:text-sm transition-colors duration-200`}
              disabled={!link}
            >
              <ButtonIcon className="h-3 w-3 mr-1" />
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RaceCard;