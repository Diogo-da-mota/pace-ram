import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube, 
  FaTiktok, 
  FaDiscord, 
  FaTelegram, 
  FaPinterest, 
  FaSnapchat 
} from 'react-icons/fa';
import { RedeSocialData } from '@/hooks/useRedesSociais';

interface RedeSocialCardProps {
  redeSocial: RedeSocialData;
  onEdit: (redeSocial: RedeSocialData) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  showActions?: boolean; // Para controlar se mostra botões de ação (Dashboard vs página inicial)
}

const RedeSocialCard = ({ 
  redeSocial, 
  onEdit, 
  onDelete, 
  loading = false, 
  showActions = true 
}: RedeSocialCardProps) => {
  const getIcon = () => {
    switch (redeSocial.icone) {
      case 'instagram':
        return <FaInstagram className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'whatsapp':
        return <FaWhatsapp className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'facebook':
        return <FaFacebook className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'twitter':
        return <FaTwitter className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'linkedin':
        return <FaLinkedin className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'youtube':
        return <FaYoutube className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'tiktok':
        return <FaTiktok className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'discord':
        return <FaDiscord className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'telegram':
        return <FaTelegram className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'pinterest':
        return <FaPinterest className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'snapchat':
        return <FaSnapchat className="h-8 w-8 md:h-12 md:w-12 text-white" />;
      case 'link':
      default:
        return <ExternalLink className="h-12 w-12 text-white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (redeSocial.icone) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'whatsapp':
        return 'bg-green-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'twitter':
        return 'bg-sky-500';
      case 'linkedin':
        return 'bg-blue-700';
      case 'youtube':
        return 'bg-red-600';
      case 'tiktok':
        return 'bg-black';
      case 'discord':
        return 'bg-indigo-500';
      case 'telegram':
        return 'bg-sky-400';
      case 'pinterest':
        return 'bg-red-500';
      case 'snapchat':
        return 'bg-yellow-400';
      case 'link':
      default:
        return 'bg-blue-500';
    }
  };

  const handleClick = () => {
    if (redeSocial.link) {
      window.open(redeSocial.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="bg-card shadow-card border border-border hover:shadow-hover transition-all duration-300 rounded-lg md:rounded-xl p-2 md:p-3 h-64 md:h-72">
      <div className="flex flex-col h-full">
        {/* Área superior colorida com ícone */}
        <div className={`${getBackgroundColor()} h-24 md:h-28 flex items-center justify-center relative rounded-lg`}>
          {getIcon()}
        </div>

        {/* Conteúdo do card */}
        <div className="p-2 md:p-3 flex flex-col flex-1">
          {/* Título */}
          <div className="text-center mb-1 md:mb-2">
            <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
              {redeSocial.titulo}
            </h3>
          </div>

          {/* Descrição/Subtítulo */}
          {redeSocial.titulo_secao && (
            <div className="text-center mb-2 md:mb-3">
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                {redeSocial.titulo_secao}
              </p>
            </div>
          )}

          {/* Espaço flexível para empurrar o botão para baixo */}
          <div className="flex-1"></div>

          {/* Botão de ação principal */}
          <div className="mt-auto">
            <Button
              onClick={handleClick}
              className="w-full bg-[#2F3237] hover:bg-[#1F2125] text-white rounded-full py-1.5 md:py-2 text-[10px] md:text-sm transition-colors duration-200"
              disabled={!redeSocial.link}
            >
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="whitespace-nowrap">Acessar</span>
            </Button>
          </div>

          {/* Botões de ação - apenas no Dashboard */}
          {showActions && (
            <div className="flex space-x-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(redeSocial)}
                disabled={loading}
                className="flex-1 border-border hover:bg-muted h-8 py-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(redeSocial.id)}
                disabled={loading}
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 py-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RedeSocialCard;