import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Calendar, Clock } from "lucide-react";

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
        text: 'Encerrado',
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
  isRecente = false
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
  );
};

export default RaceCard;