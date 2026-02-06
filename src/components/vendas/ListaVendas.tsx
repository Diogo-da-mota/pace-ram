import { useMemo } from 'react';
import { Plus, Edit2, BarChart3, Calendar } from 'lucide-react';
import { VendaEvento } from './types';
import { calcularResumoVenda, formatarMoeda } from './utils';

interface ListaVendasProps {
  eventos: VendaEvento[];
  onNovoEvento: () => void;
  onEditar: (evento: VendaEvento) => void;
  onDetalhes: (evento: VendaEvento) => void;
  onRelatorios: () => void;
}

export const ListaVendas = ({ eventos, onNovoEvento, onEditar, onDetalhes, onRelatorios }: ListaVendasProps) => {
  const eventosAgrupados = useMemo(() => {
    const filtrados = [...eventos].sort((a, b) => a.data.localeCompare(b.data));

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
  }, [eventos]);

  return (
    <div className="space-y-8">
      {Object.keys(eventosAgrupados).length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum evento encontrado.</p>
          </div>
        ) : (
          Object.entries(eventosAgrupados).map(([mesAno, eventosDoMes]) => (
            <div key={mesAno}>
              <h2 className="text-2xl font-bold capitalize mb-4 text-zinc-900 dark:text-zinc-100 sticky top-0 bg-zinc-50 dark:bg-black py-2 z-10">
                {mesAno}
              </h2>
              <div className="space-y-4">
                {eventosDoMes.map((evento) => {
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
                            onClick={() => onDetalhes(evento)}
                            className="flex-1 md:flex-none px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors font-medium text-center text-sm"
                          >
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => onEditar(evento)}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                        <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                          <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Total Vendido</p>
                          <p className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            R$ {formatarMoeda(resumo.totalBruto)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                          <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Valor Líquido</p>
                          <p className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl font-bold text-green-600 dark:text-green-400">
                            R$ {formatarMoeda(resumo.totalLiquido)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                          <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Freelancers</p>
                          <p className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            - R$ {formatarMoeda(resumo.totalFreelancers)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                          <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Cada Sócio</p>
                          <p className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            R$ {formatarMoeda(resumo.parteIdealCadaSocio)}
                          </p>
                        </div>
                        
                        <div className="col-span-2 xl:col-span-1 flex flex-col gap-2 p-3 md:p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
                          <div className="flex justify-between items-center w-full">
                            <p className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Transferência</p>
                            {resumo.transferencia > 0 && (
                              <span className="text-xs opacity-80 font-normal text-zinc-500">{resumo.quemTransfere} → {resumo.quemRecebe}</span>
                            )}
                          </div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            {resumo.transferencia > 0 ? (
                              <span className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl">R$ {formatarMoeda(resumo.transferencia)}</span>
                            ) : (
                              <span className="text-lg md:text-2xl xl:text-xl 2xl:text-2xl opacity-50">Não necessária</span>
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
  );
};
