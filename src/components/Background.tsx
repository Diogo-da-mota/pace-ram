import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBackgroundConfig, BackgroundConfig } from "@/hooks/useBackgroundConfig";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Edit, Trash2, Monitor, Smartphone, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackgroundUploadModal from "./BackgroundUploadModal";

const Background = () => {
  const navigate = useNavigate();
  const { configs, loading, error, removerImagem, refetch } = useBackgroundConfig();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleRemoveImage = async (config: BackgroundConfig) => {
    if (!confirm(`Tem certeza que deseja remover a imagem de background para ${config.tipo_dispositivo}?`)) {
      return;
    }

    try {
      setRemovingId(config.id);
      await removerImagem(config.id);
      toast({
        title: "Imagem removida",
        description: `Background para ${config.tipo_dispositivo} foi removido com sucesso.`,
      });
      refetch();
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleOpenUploadModal = (tipo: 'desktop' | 'mobile') => {
    setSelectedTipo(tipo);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    refetch();
  };

  const BackgroundCard = ({ tipo, config }: { tipo: 'desktop' | 'mobile', config?: BackgroundConfig }) => {
    const tamanhoIdeal = tipo === 'desktop' ? '1920x1080 px' : '1080x1920 px';
    const Icon = tipo === 'desktop' ? Monitor : Smartphone;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {tipo === 'desktop' ? 'Desktop' : 'Mobile'}
          </CardTitle>
          <CardDescription>
            Tamanho ideal: {tamanhoIdeal}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview da imagem */}
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {config?.imagem_url ? (
              <div className="relative w-full h-full">
                <img
                  src={config.imagem_url}
                  alt={`Background ${tipo}`}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${config.posicao_x}% ${config.posicao_y}%`,
                    opacity: config.opacidade,
                    transform: `scale(${config.zoom})`
                  }}
                />
                {!config.ativo && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="secondary">Inativo</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma imagem configurada</p>
              </div>
            )}
          </div>

          {/* Status e informações */}
          {config && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={config.ativo ? "default" : "secondary"}>
                  {config.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Posição: {config.posicao_x}% x {config.posicao_y}%</p>
                <p>Zoom: {config.zoom}x | Opacidade: {Math.round(config.opacidade * 100)}%</p>
                <p>Atualizado: {new Date(config.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => handleOpenUploadModal(tipo)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {config ? 'Substituir' : 'Adicionar'} Imagem
            </Button>
            {config && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenUploadModal(tipo)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRemoveImage(config)}
                  disabled={removingId === config.id}
                >
                  {removingId === config.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-600 p-8">
            <p>Erro ao carregar configurações: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const desktopConfig = configs.find(c => c.tipo_dispositivo === 'desktop');
  const mobileConfig = configs.find(c => c.tipo_dispositivo === 'mobile');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Background do Site</h1>
            <p className="text-gray-600 mt-1">
              Configure as imagens de fundo para desktop e dispositivos móveis
            </p>
          </div>
        </div>

        {/* Cards de configuração */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BackgroundCard tipo="desktop" config={desktopConfig} />
          <BackgroundCard tipo="mobile" config={mobileConfig} />
        </div>

        {/* Modal de upload */}
        <BackgroundUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          tipo={selectedTipo}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default Background;