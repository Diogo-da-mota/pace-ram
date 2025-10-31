import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CorridaData, NovaCorridaData } from '@/hooks/useCorridas';
import { useUrlPreview } from '@/hooks/useUrlPreview';
import RacePreview from '@/components/RacePreview';

interface EditCorridaModalProps {
  corrida: CorridaData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dados: NovaCorridaData) => Promise<void>;
  loading?: boolean;
}

const EditCorridaModal = ({ corrida, isOpen, onClose, onSave, loading = false }: EditCorridaModalProps) => {
  const [formData, setFormData] = useState<NovaCorridaData>({
    titulo: '',
    data_evento: '',
    local: '',
    imagem_principal: '',
    link_externo: '',
    texto_rodape: '',
    descricao: ''
  });

  const [tituloEditadoManualmente, setTituloEditadoManualmente] = useState(false);
  
  // Hook para preview de URL
  const { metadata: urlMetadata, loading: urlLoading, error: urlError } = useUrlPreview(formData.link_externo);

  // Preencher formulário quando a corrida for selecionada
  useEffect(() => {
    if (corrida && isOpen) {
      setFormData({
        titulo: corrida.titulo,
        data_evento: corrida.data_evento,
        local: corrida.local,
        imagem_principal: corrida.imagem_principal || '',
        link_externo: corrida.link_externo || '',
        texto_rodape: corrida.texto_rodape || '',
        descricao: corrida.descricao || ''
      });
      setTituloEditadoManualmente(true); // Considera que já foi editado pois veio do banco
    }
  }, [corrida, isOpen]);

  // Auto-preencher campos com metadados da URL (apenas se campos estiverem vazios)
  useEffect(() => {
    if (urlMetadata && !tituloEditadoManualmente && !formData.titulo && urlMetadata.title) {
      setFormData(prev => ({ ...prev, titulo: urlMetadata.title }));
    }
    
    if (urlMetadata && !formData.imagem_principal && urlMetadata.image) {
      setFormData(prev => ({ ...prev, imagem_principal: urlMetadata.image }));
    }
  }, [urlMetadata, formData.titulo, formData.imagem_principal, tituloEditadoManualmente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!corrida || !formData.titulo || !formData.data_evento || !formData.local) {
      return;
    }

    await onSave(corrida.id, formData);
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      data_evento: '',
      local: '',
      imagem_principal: '',
      link_externo: '',
      texto_rodape: '',
      descricao: ''
    });
    setTituloEditadoManualmente(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Corrida</DialogTitle>
          <DialogDescription>
            Edite as informações da corrida. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-name" className="font-medium">
                    Nome do Evento *
                  </Label>
                  <Input
                    id="edit-event-name"
                    placeholder="Ex: Maratona de São Paulo 2024"
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
                  <Label htmlFor="edit-event-date" className="font-medium">
                    Data *
                  </Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={formData.data_evento}
                    onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-location" className="font-medium">
                    Local *
                  </Label>
                  <Input
                    id="edit-event-location"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.local}
                    onChange={(e) => setFormData({...formData, local: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-link" className="font-medium">
                    Link do Evento
                  </Label>
                  <Input
                    id="edit-event-link"
                    type="url"
                    placeholder="https://..."
                    value={formData.link_externo}
                    onChange={(e) => setFormData({...formData, link_externo: e.target.value})}
                  />
                  {urlError && (
                    <p className="text-sm text-destructive mt-1">{urlError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-image" className="font-medium">
                    URL da Imagem
                  </Label>
                  <Input
                    id="edit-event-image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imagem_principal}
                    onChange={(e) => setFormData({...formData, imagem_principal: e.target.value})}
                  />
                  {urlLoading && formData.link_externo && (
                    <p className="text-sm text-muted-foreground mt-1">🔍 Buscando imagem automaticamente...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-footer-text" className="font-medium">
                    Texto do Rodapé
                  </Label>
                  <Input
                    id="edit-footer-text"
                    placeholder="Ex: Compre as suas fotos"
                    value={formData.texto_rodape}
                    onChange={(e) => setFormData({...formData, texto_rodape: e.target.value})}
                  />
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
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <RacePreview
              title={formData.titulo}
              date={formData.data_evento}
              location={formData.local}
              image={formData.imagem_principal}
              footerText={formData.texto_rodape}
              link={formData.link_externo}
              loading={urlLoading}
              error={urlError}
              showPlaceholder={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCorridaModal;