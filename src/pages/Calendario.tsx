import { useState } from "react";
import Header from "@/components/Header";
import SimpleCalendarTitle from "@/components/SimpleCalendarTitle";
import EventoCard from "@/components/EventoCard";
import GradientSection from "@/components/GradientSection";
import { useEventosPublicos } from "@/hooks/useEventosPublicos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const Calendario = () => {
  const { eventos, regioes, anos, loading, error, buscarEventosComFiltros } = useEventosPublicos();
  const [filtroRegiao, setFiltroRegiao] = useState<string>("todas_regioes");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroDistancia, setFiltroDistancia] = useState<string>("todas");

  const handleFiltroRegiao = (valor: string) => {
    setFiltroRegiao(valor);
    const regiaoFiltro = valor === "todas_regioes" ? "" : valor;
    buscarEventosComFiltros(regiaoFiltro, filtroStatus);
  };

  const handleFiltroStatus = (valor: string) => {
    setFiltroStatus(valor);
    const regiaoFiltro = filtroRegiao === "todas_regioes" ? "" : filtroRegiao;
    buscarEventosComFiltros(regiaoFiltro, valor);
  };

  const handleFiltroAno = (valor: string) => {
    setFiltroAno(valor);
    // Por enquanto apenas atualiza o estado, funcionalidade será implementada depois
  };

  const handleFiltroDistancia = (valor: string) => {
    setFiltroDistancia(valor);
    // Por enquanto apenas atualiza o estado, funcionalidade será implementada depois
  };

  const limparFiltros = () => {
    setFiltroRegiao("todas_regioes");
    setFiltroStatus("todas");
    setFiltroAno("todos");
    setFiltroDistancia("todas");
    buscarEventosComFiltros("", "todas");
  };

  const temFiltrosAtivos = filtroRegiao !== "todas_regioes" || filtroStatus !== "todas" || filtroAno !== "todos" || filtroDistancia !== "todas";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Seção Calendário */}
      <GradientSection>
        <SimpleCalendarTitle 
          mainTitle="CALENDÁRIO DE CORRIDAS"
          subtitle="RIO VERDE E REGIÃO"
          period=" ANO DE 2025"
        />
      </GradientSection>

      {/* Seção de Filtros */}
      <section className="section-padding bg-background relative">
        <div className="container-85">
          {/* Container principal dos filtros */}
          <div className="space-y-4">
            {/* Grade de filtros - 2x2 em mobile, 4 colunas iguais em desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6 w-[95%] sm:w-[85%] mx-auto">
                {/* Filtro por Ano */}
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-foreground dark:text-gray-200 mb-1.5 sm:mb-2 truncate">
                    Ano
                  </label>
                  <Select value={filtroAno} onValueChange={handleFiltroAno}>
                    <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="todos" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Todos</SelectItem>
                      {anos.map((ano) => (
                        <SelectItem key={ano} value={ano} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Região */}
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-foreground dark:text-gray-200 mb-1.5 sm:mb-2 truncate">
                    Região
                  </label>
                  <Select value={filtroRegiao} onValueChange={handleFiltroRegiao}>
                    <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="todas_regioes" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Todas</SelectItem>
                      {regioes.map((regiao) => (
                        <SelectItem key={regiao} value={regiao} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {regiao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Distância */}
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-foreground dark:text-gray-200 mb-1.5 sm:mb-2 truncate">
                    Distância
                  </label>
                  <Select value={filtroDistancia} onValueChange={handleFiltroDistancia}>
                    <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="todas" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Todas</SelectItem>
                      <SelectItem value="caminhada" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Caminhada</SelectItem>
                      <SelectItem value="3k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">3K</SelectItem>
                      <SelectItem value="5k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">5K</SelectItem>
                      <SelectItem value="7k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">7K</SelectItem>
                      <SelectItem value="8k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">8K</SelectItem>
                      <SelectItem value="10k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">10K</SelectItem>
                      <SelectItem value="15k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">15K</SelectItem>
                      <SelectItem value="21k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">21K (Meia)</SelectItem>
                      <SelectItem value="42k" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">42K (Maratona)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Status */}
                <div className="min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-foreground dark:text-gray-200 mb-1.5 sm:mb-2 truncate">
                    Status
                  </label>
                  <Select value={filtroStatus} onValueChange={handleFiltroStatus}>
                    <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectItem value="todas" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Todas</SelectItem>
                      <SelectItem value="inscricoes_abertas" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Abertas</SelectItem>
                      <SelectItem value="em_andamento" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Andamento</SelectItem>
                      <SelectItem value="encerrado" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão Limpar Filtros - centralizado em mobile, alinhado à direita em desktop */}
              {temFiltrosAtivos && (
                <div className="flex justify-center lg:justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparFiltros}
                    className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
        </div>
      </section>

      {/* Seção de Eventos */}
      <section className="py-16 section-padding bg-background dark:bg-background">
        <div className="container-85">
          {/* Título da seção */}
          <div className="text-center mb-12">
            <div className="flex items-center gap-4 justify-left px-6">
              <div className="w-16 h-2 bg-blue-600 rounded flex-shrink-0"></div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground dark:text-foreground">
                CALENDÁRIO DO ANO
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary"></div>
              <span className="ml-3 text-muted-foreground dark:text-muted-foreground">Carregando eventos...</span>
            </div>
          ) : error ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <p className="text-muted-foreground dark:text-muted-foreground mb-4">Erro ao carregar eventos: {error}</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-12">
              <p className="text-muted-foreground dark:text-muted-foreground mb-4">Nenhum evento encontrado com os filtros aplicados.</p>
              {temFiltrosAtivos && (
                <Button variant="outline" onClick={limparFiltros} className="bg-background dark:bg-background border-border dark:border-border text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted">
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento, index) => (
                <EventoCard 
                  key={evento.id}
                  evento={evento}
                  animationDelay={index * 0.15}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white section-padding-sm relative overflow-hidden">
        <div className="container-85 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="mb-4">
              
            </div>
            
            <div className="border-t border-white/20 pt-10">
              <p className="text-sm opacity-90">
                © 2025 PACE RAM. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calendario;