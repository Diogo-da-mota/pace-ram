import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RedeSocialData, NovaRedeSocialData, useRedesSociais } from '@/hooks/useRedesSociais';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface EditRedeSocialModalProps {
  redeSocial: RedeSocialData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditRedeSocialModal = ({
  redeSocial,
  isOpen, 
  onClose
}: EditRedeSocialModalProps) => {
  const { editarRedeSocial } = useRedesSociais();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NovaRedeSocialData>({
    titulo: '',
    link: '',
    icone: 'link',
    titulo_secao: ''
  });

  // Preencher formulário quando a rede social for selecionada
  useEffect(() => {
    if (redeSocial && isOpen) {
      setFormData({
        titulo: redeSocial.titulo,
        link: redeSocial.link,
        icone: redeSocial.icone,
        titulo_secao: redeSocial.titulo_secao || ''
      });
    }
  }, [redeSocial, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.link.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!redeSocial?.id) {
      toast.error('Erro: ID da rede social não encontrado');
      return;
    }

    setLoading(true);
    try {
      const dadosParaEditar = {
        titulo: formData.titulo,
        link: formData.link,
        icone: formData.icone,
        titulo_secao: formData.titulo_secao
      };
      await editarRedeSocial(redeSocial.id, dadosParaEditar);
      toast.success('Rede social atualizada com sucesso!');
      handleClose();
    } catch (error) {
      console.error('Erro ao editar rede social:', error);
      toast.error('Erro ao atualizar rede social');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      link: '',
      icone: 'link',
      titulo_secao: ''
    });
    onClose();
  };

  const getIconPreview = () => {
    switch (formData.icone) {
      case 'instagram':
        return <FaInstagram className="h-8 w-8 text-pink-500" />;
      case 'whatsapp':
        return <FaWhatsapp className="h-8 w-8 text-green-500" />;
      case 'link':
      default:
        return <ExternalLink className="h-8 w-8 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Rede Social</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-social-title" className="font-medium">
                    Título *
                  </Label>
                  <Input
                    id="edit-social-title"
                    placeholder="Ex: Instagram Oficial"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-social-link" className="font-medium">
                    Link *
                  </Label>
                  <Input
                    id="edit-social-link"
                    type="url"
                    placeholder="https://..."
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-social-section-title" className="font-medium">
                    Título da Seção
                  </Label>
                  <Input
                    id="edit-social-section-title"
                    placeholder="Ex: Siga-nos nas redes sociais"
                    value={formData.titulo_secao}
                    onChange={(e) => setFormData({...formData, titulo_secao: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este título aparecerá acima dos ícones de redes sociais na página inicial
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-social-icon" className="font-medium">
                    Ícone *
                  </Label>
                  <Select 
                    value={formData.icone} 
                    onValueChange={(value: 'instagram' | 'whatsapp' | 'link') => 
                      setFormData({...formData, icone: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center space-x-2">
                          <FaInstagram className="h-4 w-4 text-pink-500" />
                          <span>Instagram</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center space-x-2">
                          <FaWhatsapp className="h-4 w-4 text-green-500" />
                          <span>WhatsApp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="link">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <span>Link Genérico</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex justify-center items-center h-16">
                  {getIconPreview()}
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-white">
                    {formData.titulo || 'Título da rede social'}
                  </h4>
                  <p className="text-sm text-blue-400 mt-1">
                    {formData.link || 'Link da rede social'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRedeSocialModal;