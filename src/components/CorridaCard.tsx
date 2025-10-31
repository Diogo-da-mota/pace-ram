import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink, Calendar, MapPin, Eye, EyeOff } from 'lucide-react';
import { CorridaData } from '@/hooks/useCorridas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CorridaCardProps {
  corrida: CorridaData;
  onEdit: (corrida: CorridaData) => void;
  onDelete: (id: string) => void;
  onToggleVisibilidade?: (id: string) => void;
  loading?: boolean;
}

const CorridaCard = ({ corrida, onEdit, onDelete, onToggleVisibilidade, loading = false }: CorridaCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="p-4 bg-card shadow-card border border-border hover:shadow-hover transition-shadow">
      <div className="flex flex-col space-y-4">
        {/* Imagem */}
        <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
          {corrida.imagem_principal && !imageError ? (
            <img
              src={corrida.imagem_principal}
              alt={corrida.titulo}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 break-words">
            {corrida.titulo}
          </h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(corrida.data_evento)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{corrida.local}</span>
            </div>
            
            {corrida.link_externo && (
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <a 
                  href={corrida.link_externo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#2F3237] hover:underline truncate"
                >
                  Link do evento
                </a>
              </div>
            )}
          </div>

          {corrida.texto_rodape && (
            <p className="text-sm text-muted-foreground italic line-clamp-2 break-words">
              {corrida.texto_rodape}
            </p>
          )}
        </div>

        {/* Botões de ação */}
          <div className="flex space-x-1 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(corrida)}
              disabled={loading}
              className="flex-1 h-8 text-[10px] py-1 px-1 border-border hover:bg-muted"
            >
              <Edit className="h-3 w-3 mr-0.5" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(corrida.id)}
              disabled={loading}
              className="flex-1 h-8 text-[10px] py-1 px-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3 mr-0.5" />
              Excluir
            </Button>

            {onToggleVisibilidade && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleVisibilidade(corrida.id)}
                disabled={loading}
                className="flex-1 h-8 text-[10px] py-1 px-1 border-border hover:bg-muted"
              >
                {(corrida.visivel_pagina_inicial ?? true) ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-0.5" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-0.5" />
                    Mostrar
                  </>
                )}
              </Button>
            )}
          </div>
      </div>
    </Card>
  );
};

export default CorridaCard;