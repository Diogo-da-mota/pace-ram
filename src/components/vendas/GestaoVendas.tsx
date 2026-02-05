import { useState, useMemo } from 'react';
import { Plus, Edit2, BarChart3, Calendar } from 'lucide-react';
import { VendaEvento } from './types';
import { calcularResumoVenda, formatarMoeda } from './utils';
import { FormularioVendaEvento } from './FormularioVendaEvento';
import { DetalheVendaEvento } from './DetalheVendaEvento';
import { RelatoriosVendas } from './RelatoriosVendas';

export const GestaoVendas = () => {
  const [vendaEventos, setVendaEventos] = useState<VendaEvento[]>([
    {
      id: 1,
      nome: "Corrida de Rua",
      data: "2026-02-01",
      quemPagouFreelancers: "Diogo",
      vendas: [
        { nome: "Diogo", tipo: "socio", valorVendido: 2788.51, contaBancaria: 6546.59 },
        { nome: "Aziel", tipo: "socio", valorVendido: 1784.25, contaBancaria: 1784.25 },
        { nome: "Talytta", tipo: "freelancer", valorVendido: 2298.00, valorLiquido: 2122.00, valorPago: 250.00 },
        { nome: "Franciele", tipo: "freelancer", valorVendido: 1699.00, valorLiquido: 1568.00, valorPago: 250.00 },
        { nome: "Matheus", tipo: "freelancer", valorVendido: 306.67, valorPago: 300.00 },
        { nome: "Vitor", tipo: "freelancer", valorVendido: 306.67, valorPago: 300.00 }
      ],
      despesas: []
    }
  ]);
  const [vendaEventoAtual, setVendaEventoAtual] = useState<VendaEvento | null>(null);
  const [vendaAbaSelecionada, setVendaAbaSelecionada] = useState<'lista' | 'novo' | 'editar' | 'detalhes' | 'relatorios'>('lista');

  const eventosAgrupados = useMemo(() => {
    const filtrados = vendaEventos
      .sort((a, b) => a.data.localeCompare(b.data));

    return filtrados.reduce((acc, evento) => {
      const [ano, mes, dia] = evento.data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      const mesAno = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!acc[mesAno]) {
        acc[mesAno] = [];
      }
      acc[mesAno].push(evento);
      return acc;
    }, {} as Record<string, VendaEvento[]>);
  }, [vendaEventos]);

  return (
    <div className="bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Gestão de Corridas
        </h1>
        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
          Controle completo de vendas e pagamentos dos eventos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          onClick={() => setVendaAbaSelecionada('lista')}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all ${
            vendaAbaSelecionada === 'lista'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Lista de Eventos
        </button>
        <button
          onClick={() => {
            setVendaEventoAtual(null);
            setVendaAbaSelecionada('novo');
          }}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            vendaAbaSelecionada === 'novo'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Plus size={20} /> Novo Evento
        </button>
        <button
          onClick={() => setVendaAbaSelecionada('relatorios')}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            vendaAbaSelecionada === 'relatorios'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BarChart3 size={20} /> Relatórios
        </button>
      </div>

      {vendaAbaSelecionada === 'lista' && (
        <div className="space-y-8">
          {Object.keys(eventosAgrupados).length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum evento encontrado.</p>
            </div>
          ) : (
            Object.entries(eventosAgrupados).map(([mesAno, eventos]) => (
              <div key={mesAno}>
                <h2 className="text-2xl font-bold capitalize mb-4 text-zinc-900 dark:text-zinc-100 sticky top-0 bg-zinc-50 dark:bg-black py-2 z-10">
                  {mesAno}
                </h2>
                <div className="space-y-4">
                  {eventos.map((evento) => {
                    const resumo = calcularResumoVenda(evento);
                    const [ano, mes, dia] = evento.data.split('-').map(Number);
                    const dataObj = new Date(ano, mes - 1, dia);
                    
                    return (
                      <div key={evento.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs md:text-xl font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 md:px-3 rounded-lg w-fit">
                              {dataObj.toLocaleDateString('pt-BR')}
                            </span>
                            <h3 className="text-lg md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">{evento.nome}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                              onClick={() => {
                                setVendaEventoAtual(evento);
                                setVendaAbaSelecionada('detalhes');
                              }}
                              className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-center"
                            >
                              Ver Detalhes
                            </button>
                            <button
                              onClick={() => {
                                setVendaEventoAtual(evento);
                                setVendaAbaSelecionada('editar');
                              }}
                              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                          <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Total Vendido</p>
                            <p className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                              R$ {formatarMoeda(resumo.totalBruto)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20">
                            <p className="text-red-600/70 dark:text-red-400/70 font-semibold uppercase tracking-wider text-xs">Freelancers</p>
                            <p className="text-xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                              - R$ {formatarMoeda(resumo.totalFreelancers)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20">
                            <p className="text-green-600/70 dark:text-green-400/70 font-semibold uppercase tracking-wider text-xs">Cada Sócio</p>
                            <p className="text-xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                              R$ {formatarMoeda(resumo.parteIdealCadaSocio)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-100 dark:border-yellow-900/20">
                            <p className="text-yellow-600/70 dark:text-yellow-400/70 font-semibold uppercase tracking-wider text-xs">Transferência</p>
                            <div className="font-bold text-yellow-600 dark:text-yellow-400">
                              {resumo.transferencia > 0 ? (
                                <div className="flex flex-col">
                                  <span className="text-xs opacity-80 mb-1 font-normal">{resumo.quemTransfere} → {resumo.quemRecebe}</span>
                                  <span className="text-xl md:text-3xl">R$ {formatarMoeda(resumo.transferencia)}</span>
                                </div>
                              ) : (
                                <span className="text-lg md:text-2xl opacity-50">Não necessária</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {vendaAbaSelecionada === 'novo' && (
        <FormularioVendaEvento
          onSalvar={(dados) => {
            const novoEvento = { ...dados, id: Date.now() };
            setVendaEventos([...vendaEventos, novoEvento]);
            setVendaAbaSelecionada('lista');
          }}
          onCancelar={() => setVendaAbaSelecionada('lista')}
        />
      )}

      {vendaAbaSelecionada === 'editar' && vendaEventoAtual && (
        <FormularioVendaEvento
          evento={vendaEventoAtual}
          onSalvar={(dados) => {
            const eventosAtualizados = vendaEventos.map(e =>
              e.id === vendaEventoAtual.id ? { ...dados, id: vendaEventoAtual.id } : e
            );
            setVendaEventos(eventosAtualizados);
            setVendaAbaSelecionada('lista');
          }}
          onCancelar={() => setVendaAbaSelecionada('lista')}
        />
      )}

      {vendaAbaSelecionada === 'detalhes' && vendaEventoAtual && (
        <DetalheVendaEvento evento={vendaEventoAtual} />
      )}

      {vendaAbaSelecionada === 'relatorios' && (
        <RelatoriosVendas eventos={vendaEventos} />
      )}
    </div>
  );
};
