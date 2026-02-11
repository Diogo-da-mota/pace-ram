import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePortfolioLinks } from "@/hooks/usePortfolioLinks";
import { Loader2, ArrowLeft, ExternalLink, AlertCircle, Database, ShieldAlert, LayoutTemplate, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Portfolio = () => {
  const { getPortfolioLink, activeLink, loading, error } = usePortfolioLinks();
  const [iframeError, setIframeError] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'iframe' | 'card'>('iframe');

  // Diagnóstico automático ao montar
  useEffect(() => {
    const runDiagnostics = async () => {
      console.log("Iniciando diagnóstico...");
      try {
        // Tenta buscar QUALQUER dado da tabela, sem filtros, para ver se é permissão ou dados
        const { data, error } = await supabase.from('portfolio_links').select('*').limit(5);
        if (error) {
          setDebugError(error.message);
          console.error("Diagnóstico - Erro Supabase:", error);
        } else {
          setDebugData(data);
          console.log("Diagnóstico - Dados brutos:", data);
        }
      } catch (err: any) {
        setDebugError(err.message);
      }
    };

    getPortfolioLink();
    runDiagnostics();
  }, []);

  // Se detectar erro no iframe, NÃO muda para modo card automaticamente, apenas avisa
  const handleIframeError = () => {
    console.warn("Iframe reportou erro de carregamento (possível X-Frame-Options).");
    setIframeError(true);
    // Não mudamos mais automaticamente para 'card' para respeitar a preferência do usuário de "ver o site"
    // setViewMode('card'); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Carregando portfólio...</span>
      </div>
    );
  }

  // Se houver erro crítico na busca principal
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erro ao carregar</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        
        {debugError && (
           <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md max-w-lg w-full text-left mb-6 border border-red-200 dark:border-red-800">
             <p className="font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
               <ShieldAlert className="w-4 h-4" /> Detalhes do Erro (RLS/Permissões):
             </p>
             <code className="text-xs block mt-2 p-2 bg-white dark:bg-black rounded border border-red-100 dark:border-red-900/50 break-all">
               {debugError}
             </code>
             <p className="text-xs mt-2 text-red-600 dark:text-red-400">
               Verifique se as políticas RLS foram aplicadas corretamente no Supabase.
             </p>
           </div>
        )}

        <Link to="/">
          <Button variant="outline">Voltar ao Início</Button>
        </Link>
      </div>
    );
  }

  // Se houver link ativo
  if (activeLink) {
    const ogData = activeLink.og_data as any || {};
    
    return (
      <div className="fixed inset-0 flex flex-col bg-background z-50">
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 justify-between z-10 shadow-sm shrink-0">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              <span className="font-semibold text-foreground">{activeLink.titulo || "Portfólio"}</span>
            </span>
            
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('iframe')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'iframe' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Visualizar Site"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Visualizar Card de Informações"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
            </div>

            <a 
              href={activeLink.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        <div className="flex-1 relative w-full h-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          {viewMode === 'iframe' ? (
            <>
              <iframe
                key={activeLink.url} // Força recarregar se URL mudar
                src={activeLink.url}
                className="w-full h-full border-0 bg-white"
                title="Portfolio Preview"
                allowFullScreen
                onError={handleIframeError}
              />
              
              {/* Aviso flutuante se houver erro detectado, mas mantendo o iframe visível */}
              {iframeError && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100/90 backdrop-blur border border-red-200 shadow-lg rounded-lg p-4 max-w-md text-center animate-in fade-in slide-in-from-top-4 z-40">
                  <p className="text-sm text-red-800 font-semibold mb-2">
                    O site recusou a conexão no iframe.
                  </p>
                  <p className="text-xs text-red-600 mb-3">
                    Isso é uma proteção do próprio Canva/Site (X-Frame-Options).
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white hover:bg-red-50 text-red-900 border-red-200 h-8"
                      onClick={() => setViewMode('card')}
                    >
                      Ver Detalhes/Card
                    </Button>
                    <a href={activeLink.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white border-0">
                        Abrir Nova Aba
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              {/* Botão flutuante sempre visível para alternar modo */}
              <div className="absolute bottom-6 right-6 z-50">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="shadow-lg opacity-80 hover:opacity-100 transition-opacity"
                  onClick={() => setViewMode('card')}
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Ver Info do Site
                </Button>
              </div>
            </>
          ) : (
            // MODO CARD (FALLBACK RICO)
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Cabeçalho do Card (Imagem) */}
                <div className="aspect-video w-full bg-muted relative flex items-center justify-center overflow-hidden group">
                  {ogData.image ? (
                    <img 
                      src={ogData.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                      <Globe className="w-24 h-24 mb-4" />
                      <span className="text-sm font-medium">Sem imagem de preview</span>
                    </div>
                  )}
                  
                  {/* Overlay Gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2 leading-tight drop-shadow-md">
                      {activeLink.titulo || ogData.title || "Site Externo"}
                    </h2>
                    <p className="text-white/90 text-sm flex items-center gap-2 drop-shadow-md">
                      <ExternalLink className="w-3 h-3" />
                      {new URL(activeLink.url).hostname}
                    </p>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-6 md:p-8 space-y-6 bg-card">
                  {/* Descrição */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {activeLink.descricao || ogData.description || "Este site não permite visualização direta na plataforma por motivos de segurança. Você pode acessá-lo clicando no botão abaixo."}
                    </p>
                  </div>

                  {/* Detalhes do Bloqueio (Educativo) */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 flex gap-3 items-start">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      <strong>Visualização Restrita:</strong> O site <em>{new URL(activeLink.url).hostname}</em> possui proteções de segurança que impedem sua exibição dentro de janelas (iframes). Isso é normal para sites como Canva, Instagram, Bancos, etc.
                    </div>
                  </div>

                  {/* Ação Principal */}
                  <a 
                    href={activeLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button size="lg" className="w-full h-12 text-base gap-2 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                      Acessar Site Agora <ExternalLink className="w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se chegou aqui, não tem activeLink. Vamos mostrar o diagnóstico.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center animate-scale-in max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Portfólio</h1>
        <p className="text-xl text-muted-foreground mb-8">Nenhum link de portfólio ativo encontrado.</p>

        {/* Painel de Diagnóstico */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-left shadow-sm mb-8">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100">
            <Database className="w-4 h-4 text-blue-500" />
            Diagnóstico do Sistema
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Status da Busca:</p>
              {debugError ? (
                <span className="text-red-500 font-mono text-sm">{debugError}</span>
              ) : (
                <span className="text-green-500 font-mono text-sm">Conexão com Banco OK</span>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Dados na Tabela (portfolio_links):</p>
              {debugData && debugData.length > 0 ? (
                <div className="space-y-2">
                  {debugData.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-3 bg-white dark:bg-black rounded border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-blue-600">{item.url}</span>
                        <span className={item.ativo ? "text-green-600" : "text-red-600"}>
                          {item.ativo ? "ATIVO" : "INATIVO"}
                        </span>
                      </div>
                      <div className="text-zinc-500">ID: {item.id}</div>
                      <div className="text-zinc-500">Criado por: {item.criado_por || "N/A"}</div>
                    </div>
                  ))}
                  <p className="text-xs text-amber-600 mt-2">
                    Nota: Se você vê itens acima mas eles estão marcados como INATIVO, ative-os no Dashboard.
                    Se estão ATIVOS e mesmo assim não aparecem, verifique se há apenas um ativo (o sistema pega o mais recente).
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded text-sm text-zinc-500 italic">
                  Nenhum registro encontrado na tabela. Verifique se você realmente adicionou um link no Dashboard ou se as permissões de leitura (RLS) estão corretas.
                </div>
              )}
            </div>
          </div>
        </div>

        <Link to="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Portfolio;