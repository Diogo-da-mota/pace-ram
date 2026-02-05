import { DollarSign, Calculator, TrendingUp, Users } from 'lucide-react';
import { VendaEvento } from './types';
import { calcularResumoVenda, formatarMoeda } from './utils';

export const DetalheVendaEvento = ({ evento }: { evento: VendaEvento }) => {
  const resumo = calcularResumoVenda(evento);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-4 md:p-8 text-white dark:text-zinc-900">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{evento.nome}</h2>
        <p className="text-zinc-400 dark:text-zinc-600">{new Date(evento.data).toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <DollarSign className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Bruto</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.totalBruto)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Calculator className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Comissão ({resumo.percentualComissao}%)</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-red-500">
            - R$ {formatarMoeda(resumo.taxaPlataforma)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Calculator className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Líquido</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.totalLiquido)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Users className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Freelancers</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            - R$ {formatarMoeda(resumo.totalFreelancers)}
          </p>
        </div>

        {resumo.totalDespesas > 0 && (
          <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <DollarSign className="text-zinc-900 dark:text-zinc-100" size={24} />
              </div>
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Despesas</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              - R$ {formatarMoeda(resumo.totalDespesas)}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <TrendingUp className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Cada Sócio</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.parteIdealCadaSocio)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <DollarSign className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Acerto Final</span>
          </div>
          {resumo.transferencia > 0 ? (
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {resumo.quemTransfere} paga {resumo.quemRecebe}
              </p>
              <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                R$ {formatarMoeda(resumo.transferencia)}
              </p>
            </div>
          ) : (
            <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
              Contas Zeradas ✅
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <h3 className="text-lg md:text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            📊 Detalhamento Diogo
          </h3>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Conta Bancária:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.contaDiogo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Pagou Freelancers:</span>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                {resumo.quemPagouFreelancers === 'Diogo' ? `- R$ ${formatarMoeda(resumo.totalFreelancers)}` : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Saldo em Mãos:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.diogoPosFreelancers)}</span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg mt-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Lucro Final:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.diogoFinal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            📊 Detalhamento Aziel
          </h3>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Conta Bancária:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.contaAziel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Pagou Freelancers:</span>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                {resumo.quemPagouFreelancers === 'Aziel' ? `- R$ ${formatarMoeda(resumo.totalFreelancers)}` : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Saldo em Mãos:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.azielPosFreelancers)}</span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg mt-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Lucro Final:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.azielFinal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
