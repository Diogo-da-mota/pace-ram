import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioLinks } from '@/hooks/usePortfolioLinks';

const STORAGE_KEY = 'portfolio_external_link';

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const ExternalLinkForm: React.FC = () => {
  const { toast } = useToast();
  const { activeLink, getPortfolioLink, createPortfolioLink, loading } = usePortfolioLinks();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pré-carrega link ativo do Supabase
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
    try {
      // Salva no Supabase e mantém localStorage para compatibilidade com /portfolio
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
        <CardDescription>Informe o link da página que deseja exibir no seu portfolio público.</CardDescription>
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
        <Button onClick={handleSave} className="w-full" disabled={loading}>Salvar</Button>
      </CardContent>
    </Card>
  );
};

export default ExternalLinkForm;