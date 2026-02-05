import { useState, useMemo } from 'react';
import { VendaEvento } from './types';
import { BarChart3, Filter, Users, TrendingUp, DollarSign } from 'lucide-react';
import { formatarMoeda } from './utils';

interface RelatoriosVendasProps {
  eventos: VendaEvento[];
}

export const RelatoriosVendas = ({ eventos }: RelatoriosVendasProps) => {
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [filtroAno, setFiltroAno] = useState<string>('todos');
  const [filtroPessoa, setFiltroPessoa] = useState<string>('todos');

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
      const [ano, mes] = evento.data.split('-');
      
      if (filtroAno !== 'todos' && ano !== filtroAno) return false;
      if (filtroMes !== 'todos' && mes !== filtroMes) return false;
      
      if (filtroPessoa !== 'todos') {
        const participou = evento.vendas.some(v => v.nome === filtroPessoa);
        return participou;
      }
      
      return true;
    });
  }, [eventos, filtroAno, filtroMes, filtroPessoa]);

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

      // Ganhos dos Sócios (Simplificado: 50% do lucro líquido para cada)
      ganhoDiogo += lucroLiquidoEvento / 2;
      ganhoAziel += lucroLiquidoEvento / 2;

      // Cálculos específicos por pessoa
      if (filtroPessoa !== 'todos') {
        const vendasPessoa = evento.vendas.filter(v => v.nome === filtroPessoa);
        
        vendasPessoa.forEach(v => {
          if (v.tipo === 'socio') {
            // Se for sócio, o ganho é a divisão do lucro
            ganhosPessoaSelecionada += lucroLiquidoEvento / 2;
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filtros */}
      <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100 font-semibold">
          <Filter className="w-5 h-5" />
          <h2>Filtros de Análise</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Pessoa</label>
            <select
              value={filtroPessoa}
              onChange={(e) => setFiltroPessoa(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
              className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
                  <h3 className="text-xl md:text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(totais.faturamentoTotal)}</h3>
                </div>
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
                    if (v.tipo === 'socio') valorPessoa += lucroLiquido / 2;
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
    </div>
  );
};