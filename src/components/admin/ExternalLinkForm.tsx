import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useUrlPreview } from "@/hooks/useUrlPreview";
import { usePortfolioLinks, NovoPortfolioLink } from "@/hooks/usePortfolioLinks";
import { Trash2, Edit2, Plus, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const ExternalLinkForm = () => {
  const { 
    createPortfolioLink, 
    updatePortfolioLink, 
    deletePortfolioLink, 
    activeLink, 
    loading: dbLoading 
  } = usePortfolioLinks();

  const [url, setUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hook para preview automático da URL
  const { metadata, loading: previewLoading, error: previewError } = useUrlPreview(url);

  // Carregar dados quando houver um link ativo
  useEffect(() => {
    if (activeLink) {
      setUrl(activeLink.url);
    }
  }, [activeLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    const dados: NovoPortfolioLink = {
      url,
      titulo: metadata?.title || null,
      descricao: metadata?.description || null,
      og_data: metadata || null // Armazena todos os metadados brutos
    };

    if (activeLink) {
      await updatePortfolioLink(activeLink.id, { ...dados, ativo: true });
    } else {
      await createPortfolioLink(dados);
    }
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (activeLink) {
      await deletePortfolioLink(activeLink.id);
      setUrl("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Link do Portfólio</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              {activeLink ? "Alterar Link" : "Adicionar Link"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeLink ? "Editar Link" : "Novo Link"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio-url">URL do Portfólio</Label>
                <Input
                  id="portfolio-url"
                  type="url"
                  placeholder="https://seu-portfolio.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                {previewLoading && <p className="text-xs text-muted-foreground">Buscando informações...</p>}
                {previewError && <p className="text-xs text-red-500">Erro ao buscar metadados</p>}
              </div>

              {metadata && (
                <div className="p-3 border rounded-md bg-muted/50 text-sm">
                  <p className="font-medium truncate">{metadata.title}</p>
                  <p className="text-muted-foreground truncate">{metadata.description}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={dbLoading || previewLoading}>
                {dbLoading ? "Salvando..." : "Salvar Link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeLink ? (
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 overflow-hidden">
              <h4 className="font-medium truncate flex items-center gap-2">
                {activeLink.titulo || "Link Externo"}
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </h4>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {activeLink.descricao || activeLink.url}
              </p>
              <a 
                href={activeLink.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline truncate block"
              >
                {activeLink.url}
              </a>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
          <p>Nenhum link configurado</p>
          <p className="text-xs mt-1">Adicione um link externo para seu portfólio</p>
        </div>
      )}
    </div>
  );
};
