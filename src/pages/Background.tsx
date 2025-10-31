import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useBackgroundConfig } from "@/hooks/useBackgroundConfig";
import { Upload, Monitor, Smartphone, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BackgroundCardProps {
  tipo: 'desktop' | 'mobile';
  config: any;
  onUpload: (tipo: 'desktop' | 'mobile') => void;
  onRemove: (id: string) => void;
  onEdit: (config: any) => void;
}

const BackgroundCard = ({ tipo, config, onUpload, onRemove, onEdit }: BackgroundCardProps) => {
  const Icon = tipo === 'desktop' ? Monitor : Smartphone;
  const tamanhoIdeal = tipo === 'desktop' ? '1920x1080 px' : '1080x1920 px';
  
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
        {config ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={config.url_imagem} 
                alt={`Background ${tipo}`}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${config.posicao_x}% ${config.posicao_y}%`,
                  opacity: config.opacidade,
                  transform: `scale(${config.zoom})`
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant={config.ativo ? "default" : "secondary"}>
                  {config.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(config)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRemove(config.id)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma imagem configurada</p>
              </div>
            </div>
            <Button 
              onClick={() => onUpload(tipo)} 
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Background = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthSession();
  const { toast } = useToast();
  const { 
    configs, 
    loading, 
    buscarConfigs, 
    removerConfig 
  } = useBackgroundConfig();

  const [desktopConfig, setDesktopConfig] = useState(null);
  const [mobileConfig, setMobileConfig] = useState(null);

  // Verificação de autenticação agora é feita pelo ProtectedRoute
  useEffect(() => {
    buscarConfigs();
  }, [buscarConfigs]);

  useEffect(() => {
    if (configs) {
      setDesktopConfig(configs.find(c => c.tipo_dispositivo === 'desktop' && c.ativo) || null);
      setMobileConfig(configs.find(c => c.tipo_dispositivo === 'mobile' && c.ativo) || null);
    }
  }, [configs]);

  const handleUpload = (tipo: 'desktop' | 'mobile') => {
    // TODO: Implementar modal de upload
    toast({
      title: "Em desenvolvimento",
      description: `Upload para ${tipo} será implementado em breve.`,
    });
  };

  const handleEdit = (config: any) => {
    // TODO: Implementar modal de edição
    toast({
      title: "Em desenvolvimento",
      description: "Edição será implementada em breve.",
    });
  };

  const handleRemove = async (id: string) => {
    try {
      await removerConfig(id);
      toast({
        title: "Sucesso",
        description: "Configuração removida com sucesso.",
      });
      buscarConfigs();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover configuração.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-sm"
              >
                ← Voltar ao Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Background do Site
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Configurações de Background
          </h2>
          <p className="text-gray-600">
            Configure imagens de fundo diferentes para desktop e dispositivos móveis. 
            As imagens serão exibidas na página inicial do site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BackgroundCard
            tipo="desktop"
            config={desktopConfig}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onEdit={handleEdit}
          />
          
          <BackgroundCard
            tipo="mobile"
            config={mobileConfig}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onEdit={handleEdit}
          />
        </div>
      </main>
    </div>
  );
};

export default Background;