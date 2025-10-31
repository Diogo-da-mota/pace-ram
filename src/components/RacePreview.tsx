import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RacePreviewProps {
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  footerText?: string;
  link?: string;
  loading?: boolean;
  error?: string | null;
  showPlaceholder?: boolean;
}

const RacePreview: React.FC<RacePreviewProps> = ({
  title,
  date,
  location,
  image,
  footerText,
  link,
  loading = false,
  error = null,
  showPlaceholder = true
}) => {
  // Se não há dados suficientes e não deve mostrar placeholder, não renderiza
  if (!showPlaceholder && !title && !date && !location && !image) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const hasValidData = Boolean(title || date || location || image);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          Preview do Card
        </h3>
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Buscando metadados...</span>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="group overflow-hidden rounded-xl bg-card transition-all duration-300 border border-border max-w-sm">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="block">
            <PreviewContent 
              title={title}
              date={date}
              location={location}
              image={image}
              footerText={footerText}
              loading={loading}
              hasValidData={hasValidData}
              formatDate={formatDate}
            />
          </a>
        ) : (
          <PreviewContent 
            title={title}
            date={date}
            location={location}
            image={image}
            footerText={footerText}
            loading={loading}
            hasValidData={hasValidData}
            formatDate={formatDate}
          />
        )}
      </Card>

      {!hasValidData && !loading && (
        <p className="text-sm text-muted-foreground text-center">
          Preencha os campos acima para ver o preview do card
        </p>
      )}
    </div>
  );
};

interface PreviewContentProps {
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  footerText?: string;
  loading: boolean;
  hasValidData: boolean;
  formatDate: (dateString?: string) => string;
}

const PreviewContent = ({
  title,
  date,
  location,
  image,
  footerText,
  loading,
  hasValidData,
  formatDate
}: PreviewContentProps) => {
  return (
    <>
      {/* Header with date and location */}
      <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
        {loading ? (
          <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
        ) : (
          <span>
            {formatDate(date)} • {location || 'Local não informado'}
          </span>
        )}
      </div>
      
      {/* Image */}
      <div className="aspect-[16/9] overflow-hidden bg-muted flex items-center justify-center">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : image ? (
          <img 
            src={image} 
            alt={title || 'Preview da corrida'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex flex-col items-center justify-center text-muted-foreground">
                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm">Imagem não encontrada</span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {title || 'Nome do evento não informado'}
            </h3>
            
            {/* Footer */}
            <div className="text-muted-foreground text-sm font-medium">
              {footerText || 'Texto do rodapé não informado'}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RacePreview;