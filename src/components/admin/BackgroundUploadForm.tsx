import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { useBackgroundConfig } from '@/hooks/useBackgroundConfig';
import { toast } from 'sonner';

interface BackgroundUploadFormProps {
  onSuccess?: () => void;
}

export const BackgroundUploadForm: React.FC<BackgroundUploadFormProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [zoom, setZoom] = useState<number>(100);
  const [opacity, setOpacity] = useState<number>(100);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const { uploadImagem, loading, uploadProgress, error } = useBackgroundUpload();
  const { configs, loading: isLoadingConfig, buscarConfigs } = useBackgroundConfig();

  // Carregar configuração existente
  React.useEffect(() => {
    buscarConfigs();
  }, [buscarConfigs]);

  React.useEffect(() => {
    const desktopConfig = configs.find(c => c.tipo_dispositivo === 'desktop');
    if (desktopConfig) {
      // Converter posição de coordenadas para string
      const posY = desktopConfig.posicao_y;
      const newPosition = posY <= 25 ? 'top' : posY >= 75 ? 'bottom' : 'center';
      setPosition(newPosition);
      setZoom(desktopConfig.zoom);
      setOpacity(Math.round(desktopConfig.opacidade * 100));
      setIsVisible(desktopConfig.ativo);
    }
  }, [configs]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione uma imagem primeiro.');
      return;
    }

    try {
      const result = await uploadImagem(selectedFile, {
        tipo_dispositivo: 'desktop', // Por padrão desktop, pode ser expandido depois
        posicao_x: position === 'center' ? 50 : position === 'top' ? 50 : 50,
        posicao_y: position === 'center' ? 50 : position === 'top' ? 0 : 100,
        zoom,
        opacidade: opacity / 100,
        ativo: isVisible
      });

      if (!result.success) {
        throw new Error(result.error || 'Erro no upload');
      }

      toast.success('Imagem de background atualizada com sucesso!');
      
      // Limpar formulário
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess?.();
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      toast.error('Erro ao fazer upload da imagem.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewStyle = () => {
    const baseStyle = {
      opacity: opacity / 100,
      transform: `scale(${zoom / 100})`,
      transition: 'all 0.3s ease'
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, objectPosition: 'top' };
      case 'bottom':
        return { ...baseStyle, objectPosition: 'bottom' };
      default:
        return { ...baseStyle, objectPosition: 'center' };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Imagem de Background
          </CardTitle>
          <CardDescription>
            Faça upload de uma nova imagem de background. Formatos aceitos: JPEG, PNG, WebP (máx. 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="background-file">Selecionar Imagem</Label>
            <Input
              id="background-file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </div>

          {/* Preview da imagem */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="relative">
                <Label>Preview da Imagem</Label>
                <div className="mt-2 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={getPreviewStyle()}
                  />
                  {!isVisible && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <EyeOff className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="absolute top-0 right-0 mt-1 mr-1"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Controles de configuração */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Posição */}
                <div className="space-y-2">
                  <Label>Posição</Label>
                  <Select value={position} onValueChange={(value: 'center' | 'top' | 'bottom') => setPosition(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="top">Topo</SelectItem>
                      <SelectItem value="bottom">Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibilidade */}
                <div className="space-y-2">
                  <Label>Visibilidade</Label>
                  <Select value={isVisible ? 'visible' : 'hidden'} onValueChange={(value) => setIsVisible(value === 'visible')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Visível
                        </div>
                      </SelectItem>
                      <SelectItem value="hidden">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          Oculto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zoom */}
                <div className="space-y-2">
                  <Label>Zoom: {zoom}%</Label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={50}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Opacidade */}
                <div className="space-y-2">
                  <Label>Opacidade: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={(value) => setOpacity(value[0])}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress bar durante upload */}
          {loading && (
            <div className="space-y-2">
              <Label>Progresso do Upload</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">{uploadProgress}% concluído</p>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de upload */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full"
          >
            {loading ? 'Fazendo Upload...' : 'Atualizar Background'}
          </Button>
        </CardContent>
      </Card>

      {/* Configuração atual */}
      {(() => {
        const desktopConfig = configs.find(c => c.tipo_dispositivo === 'desktop');
        return desktopConfig && !isLoadingConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Configuração Atual</CardTitle>
              <CardDescription>
                Background ativo no site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Posição X</Label>
                  <p className="font-medium">{desktopConfig.posicao_x}%</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Posição Y</Label>
                  <p className="font-medium">{desktopConfig.posicao_y}%</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Zoom</Label>
                  <p className="font-medium">{desktopConfig.zoom}%</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Opacidade</Label>
                  <p className="font-medium">{Math.round(desktopConfig.opacidade * 100)}%</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <p className="font-medium flex items-center gap-1">
                    {desktopConfig.ativo ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Inativo
                      </>
                    )}
                  </p>
                </div>
              </div>
              {desktopConfig.url_imagem && (
                <div className="mt-4">
                  <Label className="text-xs text-gray-500">Imagem Atual</Label>
                  <div className="mt-2 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={desktopConfig.url_imagem}
                      alt="Background atual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
};