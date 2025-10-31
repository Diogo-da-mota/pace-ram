import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OutroData, NovoOutroData } from '@/hooks/useOutros';
import { useUrlPreview } from '@/hooks/useUrlPreview';

interface EditOutroModalProps {
  outro: OutroData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dados: NovoOutroData) => Promise<void>;
  loading?: boolean;
}

const EditOutroModal = ({ outro, isOpen, onClose, onSave, loading = false }: EditOutroModalProps) => {
  const [formData, setFormData] = useState<NovoOutroData>({
    titulo: '',
    link_externo: ''
  });

  const [tituloEditadoManualmente, setTituloEditadoManualmente] = useState(false);
  
  // Verificar se deve usar preview (não para URLs de exemplo)
  const shouldUsePreview = formData.link_externo && 
    !formData.link_externo.includes('exemplo.com') && 
    !formData.link_externo.includes('example.com');
  
  // Hook para preview de URL (condicionado)
  const { metadata: urlMetadata, loading: urlLoading, error: urlError } = useUrlPreview(
    shouldUsePreview ? formData.link_externo : ''
  );

  // Preencher formulário quando o outro for selecionado
  useEffect(() => {
    if (outro && isOpen) {
      setFormData({
        titulo: outro.titulo,
        link_externo: outro.link_externo || ''
      });
      setTituloEditadoManualmente(true); // Considera que já foi editado pois veio do banco
    }
  }, [outro, isOpen]);

  // Auto-preencher campos com metadados da URL (apenas se campos estiverem vazios)
  useEffect(() => {
    if (urlMetadata && !tituloEditadoManualmente && !formData.titulo && urlMetadata.title) {
      setFormData(prev => ({ ...prev, titulo: urlMetadata.title }));
    }
  }, [urlMetadata, formData.titulo, tituloEditadoManualmente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outro || !formData.titulo) {
      return;
    }

    await onSave(outro.id, formData);
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      link_externo: ''
    });
    setTituloEditadoManualmente(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Conteúdo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-outro-name" className="font-medium">
                Título do Conteúdo *
              </Label>
              <Input
                id="edit-outro-name"
                placeholder="Ex: Artigo sobre Nutrição"
                value={formData.titulo}
                onChange={(e) => {
                  setFormData({...formData, titulo: e.target.value});
                  setTituloEditadoManualmente(true);
                }}
                required
              />
              {!tituloEditadoManualmente && formData.titulo && urlMetadata?.title === formData.titulo && (
                <p className="text-xs text-muted-foreground mt-1">
                  ✨ Título preenchido automaticamente do link
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-outro-link" className="font-medium">
                Link do Conteúdo
              </Label>
              <Input
                id="edit-outro-link"
                type="url"
                placeholder="https://..."
                value={formData.link_externo}
                onChange={(e) => setFormData({...formData, link_externo: e.target.value})}
              />
              {urlError && (
                <p className="text-sm text-destructive mt-1">{urlError}</p>
              )}
              {urlLoading && formData.link_externo && (
                <p className="text-sm text-muted-foreground mt-1">🔍 Buscando informações automaticamente...</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOutroModal;