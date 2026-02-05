import { useState, useEffect } from 'react';
import { Trash2, Plus, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { VendaEvento, VendaFotografo, Despesa } from './types';
import { CurrencyInput } from './CurrencyInput';
import { formatarMoeda } from './utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const FormularioVendaEvento = ({ evento, onSalvar, onCancelar }: { evento?: VendaEvento | null; onSalvar: (dados: VendaEvento | Omit<VendaEvento, 'id'>) => void; onCancelar: () => void }) => {
  const [formData, setFormData] = useState<VendaEvento>(evento || {
    id: Date.now(),
    nome: '',
    data: '',
    quemPagouFreelancers: 'Diogo',
    totalVendidoSite: 0,
    comissaoPercentual: 10,
    valorLiquido: 0,
    dividirLucros: true,
    vendas: [
      { nome: 'Diogo', tipo: 'socio', valorVendido: 0, contaBancaria: 0 },
      { nome: 'Aziel', tipo: 'socio', valorVendido: 0, contaBancaria: 0 }
    ],
    despesas: []
  });

  // Garantir valores padrão se vierem undefined do banco (para registros antigos)
  useEffect(() => {
    if (evento) {
      setFormData(prev => ({
        ...prev,
        totalVendidoSite: prev.totalVendidoSite ?? 0,
        comissaoPercentual: prev.comissaoPercentual ?? 10,
        valorLiquido: prev.valorLiquido ?? 0,
        dividirLucros: prev.dividirLucros ?? true
      }));
    }
  }, [evento]);

  const adicionarFreelancer = () => {
    setFormData({
      ...formData,
      vendas: [...formData.vendas, { nome: '', tipo: 'freelancer', valorVendido: 0, valorPago: 0 }]
    });
  };

  const removerFreelancer = (index: number) => {
    const novasVendas = formData.vendas.filter((_, i) => i !== index);
    setFormData({ ...formData, vendas: novasVendas });
  };

  const atualizarVenda = (index: number, campo: keyof VendaFotografo, valor: string | number) => {
    const novasVendas = [...formData.vendas];
    const isNumero = campo === 'valorVendido' || campo === 'valorPago' || campo === 'contaBancaria' || campo === 'valorLiquido';
    novasVendas[index] = { ...novasVendas[index], [campo]: isNumero ? Number(valor) : valor };
    setFormData({ ...formData, vendas: novasVendas });
  };

  const atualizarFinanceiro = (campo: 'totalVendidoSite' | 'comissaoPercentual', valor: number) => {
    const novosDados = { ...formData, [campo]: valor };
    
    // Recalcular líquido
    const total = campo === 'totalVendidoSite' ? valor : formData.totalVendidoSite;
    const comissao = campo === 'comissaoPercentual' ? valor : formData.comissaoPercentual;
    const liquido = total - (total * (comissao / 100));
    
    setFormData({ ...novosDados, valorLiquido: liquido });
  };

  const adicionarDespesa = () => {
    setFormData({
      ...formData,
      despesas: [...(formData.despesas || []), { descricao: '', valor: 0, quemPagou: 'Caixa' }]
    });
  };

  const removerDespesa = (index: number) => {
    const novasDespesas = (formData.despesas || []).filter((_, i) => i !== index);
    setFormData({ ...formData, despesas: novasDespesas });
  };

  const atualizarDespesa = (index: number, campo: keyof Despesa, valor: string | number) => {
    const novasDespesas = [...(formData.despesas || [])];
    const isNumero = campo === 'valor';
    novasDespesas[index] = { ...novasDespesas[index], [campo]: isNumero ? Number(valor) : valor };
    setFormData({ ...formData, despesas: novasDespesas });
  };

  const handleSalvarClick = () => {
    // Validação
    if (formData.totalVendidoSite <= 0) {
      toast.error('O Total Vendido deve ser maior que zero.');
      return;
    }

    // Preparar dados para envio
    const dadosParaSalvar: VendaEvento | Omit<VendaEvento, 'id'> = { ...formData };
    
    // Se não tiver evento original (modo criação), remover o ID temporário
    if (!evento) {
      // @ts-ignore - Removendo ID temporário para forçar criação
      delete (dadosParaSalvar as any).id;
    }

    // Verificar se houve alterações financeiras
    const houveAlteracaoFinanceira = evento && (
      formData.totalVendidoSite !== evento.totalVendidoSite ||
      formData.comissaoPercentual !== evento.comissaoPercentual
    );

    if (houveAlteracaoFinanceira) {
      // Usando confirm nativo para simplificar, mas poderia ser um modal customizado
      if (window.confirm('Você alterou dados financeiros importantes. Deseja confirmar essas alterações?')) {
        onSalvar(dadosParaSalvar);
      }
    } else {
      onSalvar(dadosParaSalvar);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-8 max-w-5xl mx-auto border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {evento ? 'Editar Evento' : 'Novo Evento'}
        </h2>
        
        <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Label htmlFor="dividir-lucros" className="cursor-pointer font-medium text-sm text-zinc-600 dark:text-zinc-400">
                {formData.dividirLucros !== false ? 'Dividindo Lucros' : 'Lucros Individuais'}
            </Label>
            <Switch
                id="dividir-lucros"
                checked={formData.dividirLucros !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, dividirLucros: checked })}
            />
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Cabeçalho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Nome do Evento</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
              placeholder="Ex: Corrida de Rua"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
            />
          </div>
        </div>

        {/* Seção Financeira do Site */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Dados de Vendas do Site
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Total Vendido (Site)
              </label>
              <CurrencyInput
                value={formData.totalVendidoSite}
                onChange={(v) => atualizarFinanceiro('totalVendidoSite', v)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Comissão (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.comissaoPercentual}
                  onChange={(e) => atualizarFinanceiro('comissaoPercentual', Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 outline-none pr-8"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Valor Líquido
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-zinc-500" />
                R$ {formatarMoeda(formData.valorLiquido)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Calculado automaticamente</p>
            </div>
          </div>
        </div>

        {/* Quem Pagou */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
          <label className="block text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            Quem pagou os freelancers?
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, quemPagouFreelancers: 'Diogo' })}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                formData.quemPagouFreelancers === 'Diogo'
                  ? 'bg-zinc-900 text-white shadow-lg scale-105 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Diogo
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, quemPagouFreelancers: 'Aziel' })}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                formData.quemPagouFreelancers === 'Aziel'
                  ? 'bg-zinc-900 text-white shadow-lg scale-105 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Aziel
            </button>
          </div>
        </div>

        {/* Vendas */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Vendas por Fotógrafo (Manual)</h3>
          <div className="space-y-4">
            {formData.vendas.map((venda, index) => (
              <div key={index} className="p-3 md:p-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                      {venda.tipo === 'socio' ? 'Sócio' : 'Nome'}
                    </label>
                    <input
                      type="text"
                      value={venda.nome}
                      onChange={(e) => atualizarVenda(index, 'nome', e.target.value)}
                      disabled={venda.tipo === 'socio'}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor Vendido</label>
                    <CurrencyInput
                      value={venda.valorVendido}
                      onChange={(valor) => atualizarVenda(index, 'valorVendido', valor)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  </div>
                  {venda.tipo === 'socio' ? (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Conta Bancária</label>
                      <CurrencyInput
                        value={venda.contaBancaria || 0}
                        onChange={(valor) => atualizarVenda(index, 'contaBancaria', valor)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor Pago</label>
                        <CurrencyInput
                          value={venda.valorPago || 0}
                          onChange={(valor) => atualizarVenda(index, 'valorPago', valor)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removerFreelancer(index)}
                          className="w-full md:w-auto px-4 py-2 bg-white border border-zinc-200 hover:border-red-200 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={adicionarFreelancer}
            className="mt-4 w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={20} /> Adicionar Freelancer
          </button>
        </div>

        {/* Despesas */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6" /> Despesas do Evento
          </h3>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Adicione gastos como gasolina, lanche, hospedagem, etc.
          </p>

          <div className="space-y-4">
            {(formData.despesas || []).map((despesa, index) => (
              <div key={`despesa-${index}`} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Descrição</label>
                    <input
                      type="text"
                      placeholder="Ex: Gasolina, Lanche"
                      value={despesa.descricao}
                      onChange={(e) => atualizarDespesa(index, 'descricao', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor</label>
                    <CurrencyInput
                      value={despesa.valor}
                      onChange={(valor) => atualizarDespesa(index, 'valor', valor)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Quem Pagou?</label>
                    <select
                      value={despesa.quemPagou}
                      onChange={(e) => atualizarDespesa(index, 'quemPagou', e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      <option value="Caixa">Caixa (Lucro)</option>
                      <option value="Diogo">Diogo</option>
                      <option value="Aziel">Aziel</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <button
                      onClick={() => removerDespesa(index)}
                      className="w-full px-2 py-2 bg-white border border-zinc-200 hover:border-red-200 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors flex justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={adicionarDespesa}
            className="mt-4 w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={16} /> Adicionar Despesa
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onCancelar}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSalvarClick()}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Salvar Evento
          </button>
        </div>
      </div>
    </div>
  );
};
