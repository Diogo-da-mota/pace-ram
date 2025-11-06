import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { X } from 'lucide-react';
import { EventoData, NovoEventoData } from '@/hooks/useCalendario';
import { useUrlPreview } from '@/hooks/useUrlPreview';

interface EditEventoModalProps {
  evento: EventoData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dados: NovoEventoData) => Promise<void>;
  loading?: boolean;
}

const EditEventoModal = ({ evento, isOpen, onClose, onSave, loading = false }: EditEventoModalProps) => {
  // Opções de distância para eventos
  const distanciaOptions: MultiSelectOption[] = [
    { value: 'caminhada', label: 'Caminhada' },
    { value: '3k', label: '3K' },
    { value: '5k', label: '5K' },
    { value: '7k', label: '7K' },
    { value: '8k', label: '8K' },
    { value: '10k', label: '10K' },
    { value: '15k', label: '15K' },
    { value: '21k', label: '21K (Meia Maratona)' },
    { value: '42k', label: '42K (Maratona)' }
  ];

  const [formData, setFormData] = useState<NovoEventoData>({
    titulo: '',
    data_evento: '',
    local: '',
    link_externo: '',
    status: 'Inscrições abertas',
    distancia: [],
    horario: '',
    participantes: ''
  });

  const [tituloEditadoManualmente, setTituloEditadoManualmente] = useState(false);
  
  // Hook para preview de URL
  const { metadata: urlMetadata, loading: urlLoading, error: urlError } = useUrlPreview(formData.link_externo);

  // Preencher formulário quando o evento for selecionado
  useEffect(() => {
    if (evento && isOpen) {
      setFormData({
        titulo: evento.titulo || '',
        data_evento: evento.data_evento || '',
        local: evento.local || '',
        link_externo: evento.link_externo || '',
        status: evento.status || 'Inscrições abertas', // Garantir valor padrão
        distancia: evento.distancia || [],
        horario: evento.horario || '',
        participantes: evento.participantes || ''
      });
      setTituloEditadoManualmente(true); // Considera que já foi editado pois veio do banco
    } else if (!isOpen) {
      // Resetar formulário quando modal for fechado
      setFormData({
        titulo: '',
        data_evento: '',
        local: '',
        link_externo: '',
        status: 'Inscrições abertas',
        distancia: [],
        horario: '',
        participantes: ''
      });
      setTituloEditadoManualmente(false);
    }
  }, [evento, isOpen]);

  // Auto-preencher campos com metadados da URL (apenas se campos estiverem vazios)
  useEffect(() => {
    if (urlMetadata && !tituloEditadoManualmente && !formData.titulo && urlMetadata.title) {
      setFormData(prev => ({ ...prev, titulo: urlMetadata.title }));
    }
  }, [urlMetadata, formData.titulo, tituloEditadoManualmente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evento || !formData.titulo || !formData.data_evento || !formData.local) {
      return;
    }

    // Garantir que o status tenha um valor válido antes de enviar
    const dadosParaEnviar = {
      ...formData,
      status: formData.status || 'Inscrições abertas'
    };

    await onSave(evento.id, dadosParaEnviar);
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      data_evento: '',
      local: '',
      link_externo: '',
      status: 'Inscrições abertas',
      distancia: [],
      horario: '',
      participantes: ''
    });
    setTituloEditadoManualmente(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Evento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            {/* Linha única com todos os campos principais */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Data - 1 coluna */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-evento-date" className="text-card-foreground font-medium text-xs">
                  Data *
                </Label>
                <Input
                  id="edit-evento-date"
                  type="date"
                  lang="pt-BR"
                  className="bg-input border-border text-xs"
                  value={formData.data_evento}
                  onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                  required
                />
              </div>

              {/* Horário - 1 coluna */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="edit-evento-horario" className="text-card-foreground font-medium text-xs">
                  Horário
                </Label>
                <Input
                  id="edit-evento-horario"
                  type="time"
                  className="bg-input border-border text-xs"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                  placeholder="06:00"
                />
              </div>

              {/* Nome do Evento - 6 colunas */}
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="edit-evento-name" className="text-card-foreground font-medium text-xs">
                  Nome do Evento *
                </Label>
                <Input
                  id="edit-evento-name"
                  placeholder="Ex: Workshop de Corrida"
                  className="bg-input border-border"
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

              {/* Local - 2 colunas */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-evento-location" className="text-card-foreground font-medium text-xs">
                  Local *
                </Label>
                <Input
                  id="edit-evento-location"
                  placeholder="Ex: Parque Central"
                  className="bg-input border-border"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                  maxLength={20}
                  required
                />
              </div>

              {/* Distância - 1 coluna */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="edit-evento-distancia" className="text-card-foreground font-medium text-xs">
                  Distância
                </Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formData.distancia.includes(value)) {
                      setFormData({...formData, distancia: [...formData.distancia, value]});
                    }
                  }}
                >
                  <SelectTrigger className="bg-input border-border text-xs w-full">
                    <SelectValue placeholder="dist." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-card-foreground">
                    {distanciaOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="hover:bg-muted"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Distâncias selecionadas */}
                {formData.distancia.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.distancia.map((distanciaValue) => {
                      const option = distanciaOptions.find(opt => opt.value === distanciaValue);
                      return (
                        <span
                          key={distanciaValue}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 border border-blue-200"
                        >
                          {option?.label}
                          <button
                            type="button"
                            className="h-3 w-3 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors text-xs"
                            onClick={() => {
                              setFormData({
                                ...formData, 
                                distancia: formData.distancia.filter(d => d !== distanciaValue)
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantidade de participantes - 1 coluna */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-evento-participantes" className="text-card-foreground font-medium text-xs">
                  Quant/ participantes
                </Label>
                <Input
                  id="edit-evento-participantes"
                  type="number"
                  min="0"
                  placeholder="100"
                  className="bg-input border-border text-xs"
                  value={formData.participantes}
                  onChange={(e) => setFormData({...formData, participantes: e.target.value})}
                />
              </div>
            </div>

            {/* Segunda linha: Link e Status */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="space-y-2 md:col-span-9">
                <Label htmlFor="edit-evento-link" className="text-card-foreground font-medium text-xs">
                  Link
                </Label>
                <Input
                  id="edit-evento-link"
                  type="url"
                  placeholder="https://..."
                  className="bg-input border-border"
                  value={formData.link_externo}
                  onChange={(e) => setFormData({...formData, link_externo: e.target.value})}
                />
                {urlError && (
                  <p className="text-sm text-destructive mt-1">{urlError}</p>
                )}
                {urlLoading && formData.link_externo && (
                  <p className="text-sm text-muted-foreground mt-1">🔍 Buscando informações automaticamente...</p>
                )}
                {urlMetadata && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-2">
                    {urlMetadata.title && <p>📄 Título: {urlMetadata.title}</p>}
                    {urlMetadata.description && <p>📝 Descrição: {urlMetadata.description}</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="edit-evento-status" className="text-card-foreground font-medium text-xs">
                  Status *
                </Label>
                <Select
                  value={formData.status || 'Inscrições abertas'}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger id="edit-evento-status" className="bg-input border-border w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-card-foreground">
                    <SelectItem className="hover:bg-muted" value="Inscrições abertas">Inscrições abertas</SelectItem>
                    <SelectItem className="hover:bg-muted" value="Encerrado">Inscrições encerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="h-12 px-8"
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

export default EditEventoModal;