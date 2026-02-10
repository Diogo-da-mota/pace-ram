import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioLinks } from '@/hooks/usePortfolioLinks';
import { usePortfolioPreview, OgData } from '@/hooks/usePortfolioPreview';
import { ExternalLink, Globe, ImageOff } from 'lucide-react';

const STORAGE_KEY = 'portfolio_external_link';

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const isSafeUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    const dangerousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
    return !dangerousProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

const MiniPreview: React.FC<{ ogData: OgData | null; loading: boolean; url: string }> = ({
  ogData,
  loading,
  url,
}) => {
  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  })();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border animate-pulse">
        <div className="w-12 h-12 rounded bg-muted/50 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-3 rounded bg-muted/50" />
          <div className="w-1/2 h-2 rounded bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!ogData) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      {ogData.image ? (
        <img
          src={ogData.image}
          alt=""
          className="w-12 h-12 rounded object-cover flex-shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5 text-muted-foreground/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {ogData.title || domain}
        </p>
        {ogData.description && (
          <p className="text-xs text-muted-foreground truncate">
            {ogData.description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          {ogData.favicon && (
            <img
              src={ogData.favicon}
              alt=""
              className="w-3 h-3"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span className="text-[10px] text-muted-foreground/60">{domain}</span>
        </div>
      </div>
    </div>
  );
};

export const ExternalLinkForm: React.FC = () => {
  const { toast } = useToast();
  const { activeLink, getPortfolioLink, createPortfolioLink, loading } = usePortfolioLinks();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { ogData, loading: ogLoading } = usePortfolioPreview(
    url && isValidUrl(url) ? url : undefined
  );

  useEffect(() => {
    (async () => {
      const res = await getPortfolioLink();
      if (res.success && res.data?.url) {
        setUrl(res.data.url);
      }
    })();
  }, []);

  const handleSave = () => {
    const trimmed = url.trim();

    if (!trimmed || !isValidUrl(trimmed)) {
      setError('Por favor, insira uma URL válida (http ou https).');
      return;
    }

    if (!isSafeUrl(trimmed)) {
      setError('URL potencialmente insegura. Use apenas URLs http ou https.');
      return;
    }

    try {
      createPortfolioLink({ url: trimmed }).then((result) => {
        if (result.success) {
          localStorage.setItem(STORAGE_KEY, trimmed);
          toast({
            title: 'Link salvo com sucesso',
            description: 'O portfolio público usará este link.',
          });
        } else if (result.error) {
          setError(result.error);
          toast({
            title: 'Erro ao salvar link',
            description: result.error,
            variant: 'destructive',
          });
        }
      });
    } catch (e) {
      setError('Não foi possível salvar o link. Tente novamente.');
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Link Externo</CardTitle>
        <CardDescription>
          Informe o link da página que deseja exibir no seu portfolio público.
          Se o site bloquear iframe, será exibido um card de preview automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="portfolio-url">Link da Página</Label>
          <Input
            id="portfolio-url"
            type="url"
            placeholder="https://exemplo.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Mini preview */}
        {url && isValidUrl(url) && (
          <MiniPreview ogData={ogData} loading={ogLoading} url={url} />
        )}

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExternalLinkForm;