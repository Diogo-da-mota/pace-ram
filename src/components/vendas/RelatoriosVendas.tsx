import { useState, useMemo } from 'react';
import { VendaEvento } from './types';
import { BarChart3, Filter, Users, TrendingUp, DollarSign, Check, ChevronsUpDown, X } from 'lucide-react';
import { formatarMoeda } from './utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RelatoriosVendasProps {
  eventos: VendaEvento[];
}

export const RelatoriosVendas = ({ eventos }: RelatoriosVendasProps) => {
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [filtroAno, setFiltroAno] = useState<string>('todos');
  const [filtroPessoa, setFiltroPessoa] = useState<string>('todos');
  const [filtroEventosIds, setFiltroEventosIds] = useState<number[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Extrair anos únicos dos eventos
  const anosDisponiveis = useMemo(() => {
    const anos = eventos.map(e => e.data.split('-')[0]);
    return [...new Set(anos)].sort().reverse();
  }, [eventos]);

  // Extrair nomes únicos de todas as vendas (sócios e freelancers)
  const pessoasDisponiveis = useMemo(() => {
    const nomes = new Set<string>();
    eventos.forEach(evento => {
      evento.vendas.forEach(venda => {
        if (venda.nome) nomes.add(venda.nome);
      });
    });
    return Array.from(nomes).sort();
  }, [eventos]);

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    return eventos.filter(evento => {
      // Filtrar por IDs específicos se houver seleção
      if (filtroEventosIds.length > 0 && !filtroEventosIds.includes(evento.id)) {
        return false;
      }

      const [ano, mes] = evento.data.split('-');
      
      if (filtroAno !== 'todos' && ano !== filtroAno) return false;
      if (filtroMes !== 'todos' && mes !== filtroMes) return false;
      
      if (filtroPessoa !== 'todos') {
        const participou = evento.vendas.some(v => v.nome === filtroPessoa);
        return participou;
      }
      
      return true;
    });
  }, [eventos, filtroAno, filtroMes, filtroPessoa, filtroEventosIds]);

  // Ranking de Fotógrafos/Freelancers
  const rankingFotografos = useMemo(() => {
    const stats = new Map<string, {
      nome: string;
      tipo: 'socio' | 'freelancer';
      totalVendido: number;
      totalPago: number;
      qtdEventos: number;
    }>();

    dadosFiltrados.forEach(evento => {
      evento.vendas.forEach(venda => {
        if (!venda.nome) return;

        // Se filtro de pessoa estiver ativo, só processa ela (opcional, mas bom para consistência)
        if (filtroPessoa !== 'todos' && venda.nome !== filtroPessoa) return;
        
        const current = stats.get(venda.nome) || {
          nome: venda.nome,
          tipo: venda.tipo,
          totalVendido: 0,
          totalPago: 0,
          qtdEventos: 0
        };

        current.totalVendido += venda.valorVendido || 0;
        // Para sócios, assumimos que 'contaBancaria' é o valor retirado/pago, similar ao valorPago do freelancer
        // Se não tiver contaBancaria, usamos 0 (custo zero para empresa neste cálculo específico, ou ajuste conforme regra de negócio)
        const valorPago = venda.tipo === 'socio' ? (venda.contaBancaria || 0) : (venda.valorPago || 0);
        current.totalPago += valorPago;
        current.qtdEventos += 1;
        
        stats.set(venda.nome, current);
      });
    });

    return Array.from(stats.values())
      .map(stat => {
        const lucro = stat.totalVendido - stat.totalPago;
        const margem = stat.totalVendido > 0 ? (lucro / stat.totalVendido) * 100 : 0;
        return { ...stat, lucro, margem };
      })
      .sort((a, b) => b.totalVendido - a.totalVendido);
  }, [dadosFiltrados, filtroPessoa]);

  // Calcular totais
  const totais = useMemo(() => {
    let faturamentoTotal = 0;
    let lucroLiquidoTotal = 0;
    let despesasTotal = 0;
    let ganhoDiogo = 0;
    let ganhoAziel = 0;
    let gastoFreelancers = 0;

    // Dados específicos para o filtro de pessoa
    let ganhosPessoaSelecionada = 0;
    let custoPessoaSelecionada = 0; // Quanto a empresa gastou com este freelancer

    dadosFiltrados.forEach(evento => {
      // Totais gerais do evento
      const totalEvento = evento.vendas.reduce((acc, v) => acc + v.valorVendido, 0);
      const taxaPlataforma = totalEvento * 0.10;
      const totalFreelancers = evento.vendas
        .filter(v => v.tipo === 'freelancer')
        .reduce((acc, v) => acc + (v.valorPago || 0), 0);
      
      const totalDespesas = (evento.despesas || []).reduce((acc, d) => acc + d.valor, 0);
      
      faturamentoTotal += totalEvento;
      despesasTotal += totalDespesas;
      gastoFreelancers += totalFreelancers;
      
      const lucroLiquidoEvento = totalEvento - taxaPlataforma - totalFreelancers - totalDespesas;
      lucroLiquidoTotal += lucroLiquidoEvento;

      // Ganhos dos Sócios (Calculado pela porcentagem de cada um)
      const socioDiogo = evento.vendas.find(v => v.nome === 'Diogo');
      const pctDiogo = socioDiogo?.porcentagem ?? 50;
      ganhoDiogo += lucroLiquidoEvento * (pctDiogo / 100);

      const socioAziel = evento.vendas.find(v => v.nome === 'Aziel');
      const pctAziel = socioAziel?.porcentagem ?? 50;
      ganhoAziel += lucroLiquidoEvento * (pctAziel / 100);

      // Cálculos específicos por pessoa
      if (filtroPessoa !== 'todos') {
        const vendasPessoa = evento.vendas.filter(v => v.nome === filtroPessoa);
        
        vendasPessoa.forEach(v => {
          if (v.tipo === 'socio') {
            // Se for sócio, o ganho é a divisão do lucro baseada na porcentagem
            const pct = v.porcentagem ?? 50;
            ganhosPessoaSelecionada += lucroLiquidoEvento * (pct / 100);
          } else {
            // Se for freelancer, ganho é o valor pago
            ganhosPessoaSelecionada += (v.valorPago || 0);
            custoPessoaSelecionada += (v.valorPago || 0);
          }
        });
      }
    });

    return {
      faturamentoTotal,
      lucroLiquidoTotal,
      despesasTotal,
      ganhoDiogo,
      ganhoAziel,
      gastoFreelancers,
      ganhosPessoaSelecionada,
      custoPessoaSelecionada
    };
  }, [dadosFiltrados, filtroPessoa]);

  // Formatar nome do evento para o select
  const formatarNomeEvento = (evento: VendaEvento) => {
    const dataFormatada = evento.data.split('-').reverse().slice(0, 2).join('/');
    const nomeCurto = evento.nome.length > 20 ? evento.nome.substring(0, 20) + '...' : evento.nome;
    return `${dataFormatada} - ${nomeCurto}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100 font-semibold">
          <Filter className="w-5 h-5" />
          <h2>Filtros de Análise</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4 lg:col-span-1">
             <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Eventos Específicos</label>
             <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                >
                  {filtroEventosIds.length === 0
                    ? "Todos os eventos"
                    : `${filtroEventosIds.length} selecionado(s)`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl z-50" align="start">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Buscar evento..." className="border-none focus:ring-0" />
                  <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <CommandEmpty className="py-6 text-center text-sm text-zinc-500">Nenhum evento encontrado.</CommandEmpty>
                    <CommandGroup>
                      {eventos.map((evento) => (
                        <CommandItem
                          key={evento.id}
                          value={`${evento.data} ${evento.nome}`}
                          onSelect={() => {
                            setFiltroEventosIds((prev) =>
                              prev.includes(evento.id)
                                ? prev.filter((id) => id !== evento.id)
                                : [...prev, evento.id]
                            );
                          }}
                          className="cursor-pointer aria-selected:bg-blue-600 aria-selected:text-white data-[selected=true]:bg-blue-600 data-[selected=true]:text-white flex items-center gap-2 px-2 py-2.5 m-1 rounded-md transition-colors"
                        >
                          <div className={cn(
                            "flex items-center justify-center w-4 h-4 border rounded bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 group-aria-selected:border-white group-data-[selected=true]:border-white",
                            filtroEventosIds.includes(evento.id) ? "bg-blue-600 border-blue-600 text-white" : "text-transparent"
                          )}>
                             {filtroEventosIds.includes(evento.id) && <Check className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{formatarNomeEvento(evento)}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {filtroEventosIds.length > 0 && (
               <button 
                 onClick={() => setFiltroEventosIds([])}
                 className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
               >
                 <X size={12} /> Limpar seleção
               </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Pessoa</label>
            <select
              value={filtroPessoa}
              onChange={(e) => setFiltroPessoa(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="todos">Todos</option>
              {pessoasDisponiveis.map(nome => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Mês</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="todos">Todos</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Ano</label>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="todos">Todos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {filtroPessoa === 'todos' ? (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Faturamento Total</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.faturamentoTotal)}</h3> </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Soma de todas as vendas brutas</p>
            </div>

            <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-zinc-100 dark:border-l-zinc-900">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">Lucro Líquido</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-white dark:text-zinc-900">R$ {formatarMoeda(totais.lucroLiquidoTotal)}</h3>
                </div>
                <div className="p-2 bg-zinc-800 dark:bg-zinc-200 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white dark:text-zinc-900" />
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 text-xs">Após taxas, freelancers e despesas</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Gasto com Freelancers</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.gastoFreelancers)}</h3>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Despesas Extras</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.despesasTotal)}</h3>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Viagem, Lanche, Gasolina</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 text-sm font-medium">Ganho Diogo</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.ganhoDiogo)}</h3>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 text-sm font-medium">Ganho Aziel</p>
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.ganhoAziel)}</h3>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2 border-l-4 border-l-zinc-100 dark:border-l-zinc-900">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">Ganho Total de {filtroPessoa}</p>
                  <h3 className="text-2xl md:text-4xl font-bold mt-1 text-white dark:text-zinc-900">R$ {formatarMoeda(totais.ganhosPessoaSelecionada)}</h3>
                </div>
                <div className="p-2 bg-zinc-800 dark:bg-zinc-200 rounded-lg">
                  <DollarSign className="w-8 h-8 text-white dark:text-zinc-900" />
                </div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm">Neste período selecionado</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-500 text-sm font-medium">Custo para Empresa</p>
                  <h3 className="text-2xl md:text-4xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.custoPessoaSelecionada)}</h3>
                </div>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <p className="text-zinc-500 text-sm">Quanto foi pago a este profissional</p>
            </div>
          </>
        )}
      </div>

      {/* Lista Detalhada */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-3 md:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {filtroPessoa === 'todos' ? 'Histórico Geral de Eventos' : `Histórico de ${filtroPessoa}`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Data</th>
                <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Evento</th>
                {filtroPessoa === 'todos' ? (
                  <>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Faturamento</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Freelancer</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Despesas</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Lucro Líquido</th>
                  </>
                ) : (
                  <th className="px-3 py-2 md:px-6 md:py-4 font-medium whitespace-nowrap">Valor Recebido</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {dadosFiltrados.map(evento => {
                const totalEvento = evento.vendas.reduce((acc, v) => acc + v.valorVendido, 0);
                const taxaPlataforma = totalEvento * 0.10;
                const totalFreelancers = evento.vendas
                  .filter(v => v.tipo === 'freelancer')
                  .reduce((acc, v) => acc + (v.valorPago || 0), 0);
                const totalDespesas = (evento.despesas || []).reduce((acc, d) => acc + d.valor, 0);
                const lucroLiquido = totalEvento - taxaPlataforma - totalFreelancers - totalDespesas;
                
                let valorPessoa = 0;
                if (filtroPessoa !== 'todos') {
                  const vendasPessoa = evento.vendas.filter(v => v.nome === filtroPessoa);
                  vendasPessoa.forEach(v => {
                    if (v.tipo === 'socio') {
                        const pct = v.porcentagem ?? 50;
                        valorPessoa += lucroLiquido * (pct / 100);
                    }
                    else valorPessoa += (v.valorPago || 0);
                  });
                }

                return (
                  <tr key={evento.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 py-2 md:px-6 md:py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(evento.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      {evento.nome}
                    </td>
                    {filtroPessoa === 'todos' ? (
                      <>
                        <td className="px-3 py-2 md:px-6 md:py-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          R$ {formatarMoeda(totalEvento)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          R$ {formatarMoeda(totalFreelancers)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          R$ {formatarMoeda(totalDespesas)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-zinc-900 dark:text-zinc-100 font-bold whitespace-nowrap">
                          R$ {formatarMoeda(lucroLiquido)}
                        </td>
                      </>
                    ) : (
                      <td className="px-3 py-2 md:px-6 md:py-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        R$ {formatarMoeda(valorPessoa)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Tabela de Performance por Fotógrafo/Freelancer */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-100 font-semibold">
          <Users className="w-5 h-5" />
          <h2>Performance por Pessoa (Ranking)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Nome</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Eventos</th>
                <th className="px-4 py-3">Total Vendido</th>
                <th className="px-4 py-3">Valor Pago</th>
                <th className="px-4 py-3">Lucro Empresa</th>
                <th className="px-4 py-3 rounded-r-lg">Margem %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rankingFotografos.map((stat, idx) => (
                <tr key={stat.nome} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {idx + 1}
                      </span>
                      {stat.nome}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stat.tipo === 'socio' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {stat.tipo === 'socio' ? 'Sócio' : 'Freelancer'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{stat.qtdEventos}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                    R$ {formatarMoeda(stat.totalVendido)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    R$ {formatarMoeda(stat.totalPago)}
                  </td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                    R$ {formatarMoeda(stat.lucro)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${Math.min(stat.margem, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {stat.margem.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {rankingFotografos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Nenhum dado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};