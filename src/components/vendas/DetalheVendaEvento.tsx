import { DollarSign, Calculator, TrendingUp, Users } from 'lucide-react';
import { VendaEvento } from './types';
import { calcularResumoVenda, formatarMoeda } from './utils';

export const DetalheVendaEvento = ({ evento }: { evento: VendaEvento }) => {
  const resumo = calcularResumoVenda(evento);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{evento.nome}</h2>
        <p className="text-blue-100">{new Date(evento.data).toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Bruto</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.totalBruto)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calculator className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total Líquido</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.totalLiquido)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Users className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Freelancers</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.totalFreelancers)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Cada Sócio</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            R$ {formatarMoeda(resumo.parteIdealCadaSocio)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <DollarSign className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Acerto Final</span>
          </div>
          {resumo.transferencia > 0 ? (
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {resumo.quemTransfere} paga {resumo.quemRecebe}
              </p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                R$ {formatarMoeda(resumo.transferencia)}
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-2">
              Contas Zeradas ✅
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            📊 Detalhamento Diogo
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Vendeu na Maquininha:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.contaDiogo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Pagou Freelancers:</span>
              <span className="font-semibold text-red-500">
                {resumo.quemPagouFreelancers === 'Diogo' ? `- R$ ${formatarMoeda(resumo.totalFreelancers)}` : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Saldo em Mãos:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">R$ {formatarMoeda(resumo.diogoPosFreelancers)}</span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg mt-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Lucro Final:</span>
              <span className="font-bold text-green-600 dark:text-green-400">R$ {formatarMoeda(resumo.diogoFinal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            📊 Detalhamento Aziel
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Vendeu na Maquininha:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">R$ {formatarMoeda(resumo.contaAziel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Pagou Freelancers:</span>
              <span className="font-semibold text-red-500">
                {resumo.quemPagouFreelancers === 'Aziel' ? `- R$ ${formatarMoeda(resumo.totalFreelancers)}` : 'R$ 0,00'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Saldo em Mãos:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">R$ {formatarMoeda(resumo.azielPosFreelancers)}</span>
            </div>
            <div className="flex justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg mt-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Lucro Final:</span>
              <span className="font-bold text-green-600 dark:text-green-400">R$ {formatarMoeda(resumo.azielFinal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
