import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useBackgroundConfig, UploadBackgroundData } from "@/hooks/useBackgroundConfig";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BackgroundUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'desktop' | 'mobile';
  onSuccess: () => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const BackgroundUploadModal = ({ isOpen, onClose, tipo, onSuccess }: BackgroundUploadModalProps) => {
  const { uploadImagem, uploading } = useBackgroundConfig();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [posicaoX, setPosicaoX] = useState([50]);
  const [posicaoY, setPosicaoY] = useState([50]);
  const [zoom, setZoom] = useState([1.0]);
  const [opacidade, setOpacidade] = useState([1.0]);
  const [ativo, setAtivo] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const tamanhoIdeal = tipo === 'desktop' 
    ? { width: 1920, height: 1080 } 
    : { width: 1080, height: 1920 };

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setImageDimensions(null);
    setPosicaoX([50]);
    setPosicaoY([50]);
    setZoom([1.0]);
    setOpacidade([1.0]);
    setAtivo(true);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo JPEG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);

      // Obter dimensões da imagem
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(10);

      const uploadData: UploadBackgroundData = {
        file: selectedFile,
        tipo_dispositivo: tipo,
        posicao_x: posicaoX[0],
        posicao_y: posicaoY[0],
        zoom: zoom[0],
        opacidade: opacidade[0],
        ativo
      };

      setUploadProgress(50);
      await uploadImagem(uploadData);
      setUploadProgress(100);

      toast({
        title: "Upload realizado com sucesso!",
        description: `Imagem de background para ${tipo} foi configurada.`,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  }, [selectedFile, tipo, posicaoX, posicaoY, zoom, opacidade, ativo, uploadImagem, toast, resetForm, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  }, [uploading, resetForm, onClose]);

  const isImageTooSmall = imageDimensions && (
    imageDimensions.width < tamanhoIdeal.width * 0.8 || 
    imageDimensions.height < tamanhoIdeal.height * 0.8
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Background - {tipo === 'desktop' ? 'Desktop' : 'Mobile'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecionar Imagem</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={uploading}
            />
            <p className="text-sm text-gray-500">
              Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB.
              <br />
              Tamanho ideal: {tamanhoIdeal.width}x{tamanhoIdeal.height} px
            </p>
          </div>

          {/* Informações do arquivo */}
          {selectedFile && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Arquivo selecionado:</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Nome:</strong> {selectedFile.name}</p>
                <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
                {imageDimensions && (
                  <p><strong>Dimensões:</strong> {imageDimensions.width}x{imageDimensions.height} px</p>
                )}
              </div>
            </div>
          )}

          {/* Alerta para imagem pequena */}
          {isImageTooSmall && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A imagem selecionada é menor que o tamanho recomendado ({tamanhoIdeal.width}x{tamanhoIdeal.height} px).
                Isso pode resultar em qualidade reduzida na exibição.
              </AlertDescription>
            </Alert>
          )}

          {/* Preview e controles */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-all duration-200"
                    style={{
                      objectPosition: `${posicaoX[0]}% ${posicaoY[0]}%`,
                      opacity: opacidade[0],
                      transform: `scale(${zoom[0]})`
                    }}
                  />
                  {!ativo && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Inativo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controles */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Posição Horizontal: {posicaoX[0]}%</Label>
                  <Slider
                    value={posicaoX}
                    onValueChange={setPosicaoX}
                    max={100}
                    step={1}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Posição Vertical: {posicaoY[0]}%</Label>
                  <Slider
                    value={posicaoY}
                    onValueChange={setPosicaoY}
                    max={100}
                    step={1}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zoom: {zoom[0].toFixed(1)}x</Label>
                  <Slider
                    value={zoom}
                    onValueChange={setZoom}
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opacidade: {Math.round(opacidade[0] * 100)}%</Label>
                  <Slider
                    value={opacidade}
                    onValueChange={setOpacidade}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    disabled={uploading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                    disabled={uploading}
                  />
                  <Label htmlFor="ativo">Ativar imediatamente</Label>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar durante upload */}
          {uploading && (
            <div className="space-y-2">
              <Label>Fazendo upload...</Label>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundUploadModal;