import React from 'react';
import { ExternalLink, Globe, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OgData } from '@/hooks/usePortfolioPreview';

interface PortfolioPreviewCardProps {
    url: string;
    ogData: OgData | null;
    loading?: boolean;
}

const PortfolioPreviewCard: React.FC<PortfolioPreviewCardProps> = ({
    url,
    ogData,
    loading = false,
}) => {
    const domain = (() => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    })();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full animate-pulse gap-6 p-8">
                <div className="w-full max-w-2xl aspect-video rounded-xl bg-muted/40" />
                <div className="w-64 h-6 rounded bg-muted/40" />
                <div className="w-48 h-4 rounded bg-muted/30" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 md:p-12 gap-8 animate-fade-in">
            {/* Card principal */}
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full max-w-3xl rounded-2xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Abrir ${ogData?.title || domain} em nova aba`}
            >
                {/* Imagem OG */}
                {ogData?.image ? (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                        <img
                            src={ogData.image}
                            alt={ogData.title || 'Preview do portfolio'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling;
                                if (fallback instanceof HTMLElement) fallback.style.display = 'flex';
                            }}
                        />
                        {/* Fallback se imagem falhar */}
                        <div
                            className="absolute inset-0 items-center justify-center bg-muted hidden"
                            aria-hidden="true"
                        >
                            <ImageOff className="w-16 h-16 text-muted-foreground/40" />
                        </div>
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Badge "Abrir" no hover */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-md">
                            <ExternalLink className="w-4 h-4" />
                            Abrir site
                        </div>
                    </div>
                ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                        <Globe className="w-20 h-20 text-muted-foreground/30" />
                    </div>
                )}

                {/* Informações */}
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        {ogData?.favicon && (
                            <img
                                src={ogData.favicon}
                                alt=""
                                className="w-6 h-6 rounded-sm flex-shrink-0"
                                loading="lazy"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                        <span className="text-sm text-muted-foreground truncate">
                            {ogData?.siteName || domain}
                        </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {ogData?.title || domain}
                    </h2>

                    {ogData?.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {ogData.description}
                        </p>
                    )}
                </div>
            </a>

            {/* Botão secundário */}
            <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 border-border hover:bg-accent"
            >
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Abrir em nova aba
                </a>
            </Button>

            {/* Info sutil */}
            <p className="text-xs text-muted-foreground/60 text-center max-w-md">
                O site externo possui restrições de segurança que impedem a visualização embutida.
                Clique no card ou no botão acima para acessar o conteúdo.
            </p>
        </div>
    );
};

export default PortfolioPreviewCard;
