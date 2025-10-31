import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { OutroData } from '@/hooks/useOutros';

interface OutroCardProps {
  outro: OutroData;
  onEditar: (outro: OutroData) => void;
  onExcluir: (id: string) => void;
  animationDelay?: number;
}

const OutroCard: React.FC<OutroCardProps> = ({ 
  outro, 
  onEditar, 
  onExcluir, 
  animationDelay = 0 
}) => {
  const handleEdit = () => {
    onEditar(outro);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      onExcluir(outro.id);
    }
  };

  return (
    <div 
      className="group animate-fade-in mb-4"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Card className="bg-card dark:bg-card transition-all duration-500 hover:scale-[1.02] border border-border dark:border-border rounded-3xl overflow-hidden max-w-4xl mx-auto">
        <div className="p-4 relative">
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="flex items-center justify-between relative z-10">
            {/* Título do conteúdo */}
            <h3 className="text-xl font-bold text-card-foreground dark:text-card-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 flex-1 mr-4">
              {outro.titulo}
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* Botões de ação */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center space-x-1 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
              >
                <Edit className="h-3 w-3" />
                <span className="text-xs font-medium">Editar</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center space-x-1 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-xs font-medium">Apagar</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OutroCard;