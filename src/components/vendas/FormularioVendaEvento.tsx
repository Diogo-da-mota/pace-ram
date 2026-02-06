import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Trash2, Plus, DollarSign, TrendingUp, Calculator, ChevronDown, Fuel, Utensils, Handshake, MoreHorizontal, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { VendaEvento, VendaFotografo, Despesa } from './types';
import { CurrencyInput } from './CurrencyInput';
import { formatarMoeda } from './utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// --- Subcomponentes ---

const FreelancerSelector = ({
  value,
  onChange,
  sugestoes,
  disabled
}: {
  value: string;
  onChange: (val: string) => void;
  sugestoes: string[];
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sugestoesFiltradas = useMemo(() => {
    if (!value) return sugestoes;
    if (sugestoes.includes(value)) return sugestoes;
    return sugestoes.filter(s => s.toLowerCase().includes(value.toLowerCase()));
  }, [value, sugestoes]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 text-sm pr-8 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          autoComplete="off"
          placeholder="Nome"
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
            tabIndex={-1}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>
      
      {open && !disabled && sugestoesFiltradas.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1">
          {sugestoesFiltradas.map((nome, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-sm text-zinc-900 dark:text-zinc-100"
              onClick={() => {
                onChange(nome);
                setOpen(false);
              }}
            >
              {nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CATEGORIAS_DESPESA = [
  { label: 'Gasolina', icon: Fuel },
  { label: 'Lanche', icon: Utensils },
  { label: 'Patrocínios', icon: Handshake },
  { label: 'Outros', icon: MoreHorizontal },
];

const ExpenseCategorySelector = ({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sugestoesFiltradas = useMemo(() => {
    if (!value) return CATEGORIAS_DESPESA;
    if (CATEGORIAS_DESPESA.some(c => c.label === value)) return CATEGORIAS_DESPESA;
    
    return CATEGORIAS_DESPESA.filter(c => 
      c.label.toLowerCase().includes(value.toLowerCase())
    );
  }, [value]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Selecione uma categoria"
          className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 dark:border-zinc-600 focus:ring-zinc-900 dark:focus:ring-zinc-100'} bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm pr-8 outline-none focus:ring-2 transition-all`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
          tabIndex={-1}
        >
          <ChevronDown size={16} />
        </button>
      </div>
      
      {open && sugestoesFiltradas.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1">
          {sugestoesFiltradas.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
                onClick={() => {
                  onChange(cat.label);
                  setOpen(false);
                }}
              >
                <Icon size={16} className="text-zinc-500" />
                {cat.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// --- Funções Auxiliares (Puras) ---

const calcularResultadosFinanceiros = (dados: VendaEvento) => {
  // 1. Faturamento Bruto: Soma das vendas de todos (Sócios + Freelancers)
  const faturamentoBruto = (dados.vendas || []).reduce((acc, v) => acc + (Number(v.valorVendido) || 0), 0);

  // 2. Faturamento Pós-Taxa
  const taxaSite = faturamentoBruto * ((Number(dados.comissaoPercentual) || 0) / 100);
  const faturamentoPosTaxa = faturamentoBruto - taxaSite;

  // 3. Lucro Distribuível
  // Subtrair pagamentos de freelancers
  const pagamentosFreelancers = (dados.vendas || [])
    .filter(v => v.tipo === 'freelancer')
    .reduce((acc, v) => acc + (Number(v.valorPago) || 0), 0);
  
  // Subtrair despesas pagas pelo Caixa
  const despesasCaixa = (dados.despesas || [])
    .filter(d => d.quemPagou === 'Caixa')
    .reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
    
  // Lucro Distribuível Final
  const lucroDistribuivel = faturamentoPosTaxa - pagamentosFreelancers - despesasCaixa;

  return {
    faturamentoBruto,
    faturamentoPosTaxa,
    pagamentosFreelancers,
    despesasCaixa,
    lucroDistribuivel
  };
};

interface FormularioVendaEventoProps {
  evento?: VendaEvento | null;
  eventosPassados?: VendaEvento[];
  onSalvar: (dados: VendaEvento | Omit<VendaEvento, 'id'>) => void;
  onCancelar: () => void;
}

export const FormularioVendaEvento = ({ evento, eventosPassados = [], onSalvar, onCancelar }: FormularioVendaEventoProps) => {
  const [formData, setFormData] = useState<VendaEvento>(evento || {
    id: Date.now(),
    nome: '',
    data: new Date().toISOString().split('T')[0],
    quemPagouFreelancers: 'Diogo',
    totalVendidoSite: 0,
    comissaoPercentual: 10,
    valorLiquido: 0,
    dividirLucros: true,
    vendas: [
      { nome: 'Diogo', tipo: 'socio', valorVendido: 0, porcentagem: 50, contaBancaria: 0 },
      { nome: 'Aziel', tipo: 'socio', valorVendido: 0, porcentagem: 50, contaBancaria: 0 }
    ],
    despesas: []
  });

  // Efeito para recalcular valores quando houver mudanças financeiras
  // Usamos um efeito controlado para evitar loops, focando nas dependências corretas
  useEffect(() => {
    // Evita recalcular se não houver dados básicos
    if (!formData.vendas) return;

    const { faturamentoBruto, lucroDistribuivel } = calcularResultadosFinanceiros(formData);
    
    let houveMudanca = false;
    let novoFormData = { ...formData };

    // Atualizar Total Vendido Site se estiver diferente (Sincronização)
    // Usamos uma pequena margem de erro para float comparison
    if (Math.abs(novoFormData.totalVendidoSite - faturamentoBruto) > 0.01) {
      novoFormData.totalVendidoSite = faturamentoBruto;
      houveMudanca = true;
    }

    // Atualizar Valor Líquido Global (que é o lucro distribuível neste contexto?)
    // O campo valorLiquido na raiz geralmente é o lucro total do evento pós taxas/despesas
    if (Math.abs(novoFormData.valorLiquido - lucroDistribuivel) > 0.01) {
      novoFormData.valorLiquido = lucroDistribuivel;
      houveMudanca = true;
    }

    // Atualizar Ganhos dos Sócios (vendas[].valorLiquido)
    const novasVendas = novoFormData.vendas.map(venda => {
      if (venda.tipo === 'socio') {
        const pct = venda.porcentagem ?? 50;
        const ganhoCalculado = lucroDistribuivel * (pct / 100);
        
        // Se o valor calculado for diferente do atual, atualiza
        if (Math.abs((venda.valorLiquido || 0) - ganhoCalculado) > 0.01) {
          houveMudanca = true;
          return { ...venda, valorLiquido: ganhoCalculado };
        }
      }
      return venda;
    });

    if (houveMudanca) {
      setFormData(prev => ({
        ...prev,
        totalVendidoSite: novoFormData.totalVendidoSite,
        valorLiquido: novoFormData.valorLiquido,
        vendas: novasVendas
      }));
    }
  }, [
    // Dependências explícitas que afetam o cálculo
    formData.comissaoPercentual,
    // JSON.stringify é um truque para deep compare de arrays simples sem loops infinitos (cuidado com performance em listas gigantes, mas aqui ok)
    JSON.stringify(formData.vendas.map(v => ({ v: v.valorVendido, p: v.valorPago, pct: v.porcentagem }))),
    JSON.stringify(formData.despesas)
  ]);

  const adicionarFreelancer = () => {
    setFormData(prev => ({
      ...prev,
      vendas: [...prev.vendas, { nome: '', tipo: 'freelancer', valorVendido: 0, valorPago: 0 }]
    }));
  };

  const removerFreelancer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vendas: prev.vendas.filter((_, i) => i !== index)
    }));
  };

  const atualizarVenda = (index: number, campo: keyof VendaFotografo, valor: string | number) => {
    setFormData(prev => {
      const novasVendas = [...prev.vendas];
      const isNumero = ['valorVendido', 'valorPago', 'contaBancaria', 'valorLiquido', 'porcentagem'].includes(campo);
      
      novasVendas[index] = { 
        ...novasVendas[index], 
        [campo]: isNumero ? Number(valor) : valor 
      };

      // Lógica de Porcentagem Recíproca (Regra 1)
      if (campo === 'porcentagem' && novasVendas[index].tipo === 'socio') {
        const socioAtual = novasVendas[index];
        const novaPct = Number(valor);
        
        // Encontrar o outro sócio
        const indexOutroSocio = novasVendas.findIndex((v, i) => v.tipo === 'socio' && i !== index);
        
        if (indexOutroSocio !== -1) {
          // Ajusta o outro para complementar 100%
          const pctRestante = Math.max(0, 100 - novaPct);
          novasVendas[indexOutroSocio] = {
            ...novasVendas[indexOutroSocio],
            porcentagem: pctRestante
          };
        }
      }

      return { ...prev, vendas: novasVendas };
    });
  };

  const resetarPorcentagens = () => {
    setFormData(prev => ({
      ...prev,
      vendas: prev.vendas.map(v => 
        v.tipo === 'socio' ? { ...v, porcentagem: 50 } : v
      )
    }));
    toast.success("Porcentagens resetadas para 50/50");
  };

  const atualizarDespesa = (index: number, campo: keyof Despesa, valor: string | number) => {
    setFormData(prev => {
      const novasDespesas = [...(prev.despesas || [])];
      const isNumero = campo === 'valor';
      novasDespesas[index] = { ...novasDespesas[index], [campo]: isNumero ? Number(valor) : valor };
      return { ...prev, despesas: novasDespesas };
    });
  };

  const adicionarDespesa = () => {
    setFormData(prev => ({
      ...prev,
      despesas: [...(prev.despesas || []), { descricao: '', valor: 0, quemPagou: 'Caixa' }]
    }));
  };

  const removerDespesa = (index: number) => {
    setFormData(prev => ({
      ...prev,
      despesas: (prev.despesas || []).filter((_, i) => i !== index)
    }));
  };

  // Sugestões de nomes
  const sugestoesNomes = useMemo(() => {
    const nomes = new Set<string>();
    eventosPassados.forEach(evt => {
      evt.vendas.forEach(venda => {
        if (venda.nome && !['Diogo', 'Aziel'].includes(venda.nome)) {
          nomes.add(venda.nome);
        }
      });
    });
    return Array.from(nomes).sort();
  }, [eventosPassados]);

  const handleSalvarClick = () => {
    if (formData.totalVendidoSite <= 0) {
      toast.error('O Total Vendido deve ser maior que zero.');
      return;
    }

    if (formData.despesas && formData.despesas.length > 0) {
      const despesasInvalidas = formData.despesas.some(d => !d.descricao || d.descricao.trim() === '');
      if (despesasInvalidas) {
        toast.error('Todas as despesas devem ter uma categoria selecionada.');
        return;
      }
    }

    const dadosParaSalvar: VendaEvento | Omit<VendaEvento, 'id'> = { ...formData };
    if (!evento) {
      // @ts-ignore
      delete (dadosParaSalvar as any).id;
    }

    onSalvar(dadosParaSalvar);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 md:p-8 max-w-5xl mx-auto border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {evento ? 'Editar Evento' : 'Novo Evento'}
        </h2>
        
        <div className="hidden md:flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
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
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Seção Financeira do Site */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Dados de Vendas do Site
          </h3>
          
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
            <div className="flex flex-row gap-4 md:contents">
              <div className="flex-1 md:w-auto">
                <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  Total Vendido (Site)
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium cursor-not-allowed">
                  R$ {formatarMoeda(formData.totalVendidoSite)}
                </div>
                <p className="text-xs text-zinc-400 mt-1">Calculado via soma das vendas abaixo</p>
              </div>

              <div className="w-[30%] md:w-auto">
                <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  Comissão
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.comissaoPercentual}
                    onChange={(e) => setFormData({...formData, comissaoPercentual: Number(e.target.value)})}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 outline-none pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                Lucro Distribuível (Calc.)
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-zinc-500" />
                R$ {formatarMoeda(formData.valorLiquido)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Após taxas, freelancers e despesas</p>
            </div>
          </div>
        </div>

        {/* Vendas */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Vendas por Fotógrafo</h3>
            <button 
              onClick={resetarPorcentagens}
              className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
              title="Resetar divisão para 50/50"
            >
              <RotateCcw size={12} /> Resetar 50/50
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.vendas.map((venda, index) => (
              <div key={index} className="p-3 md:p-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                  
                  {/* Nome e Tipo */}
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                      {venda.tipo === 'socio' ? 'Sócio' : 'Nome do Freelancer'}
                    </label>
                    <FreelancerSelector
                      value={venda.nome}
                      onChange={(valor) => atualizarVenda(index, 'nome', valor)}
                      sugestoes={venda.tipo === 'freelancer' ? sugestoesNomes : []}
                      disabled={venda.tipo === 'socio'}
                    />
                  </div>

                  {/* Valor Vendido */}
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor Vendido</label>
                    <CurrencyInput
                      value={venda.valorVendido}
                      onChange={(valor) => atualizarVenda(index, 'valorVendido', valor)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  </div>

                  {/* Se for Sócio: Porcentagem e Ganho */}
                  {venda.tipo === 'socio' && (
                    <>
                      <div className="w-full md:w-1/6 relative">
                        <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Divisão (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={venda.porcentagem ?? 50}
                            onChange={(e) => atualizarVenda(index, 'porcentagem', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
                        </div>
                      </div>

                      <div className="w-full md:w-1/4">
                        <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Líquido (Calc.)</label>
                        <div className="w-full px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium border border-transparent">
                          R$ {formatarMoeda(venda.valorLiquido)}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Se for Freelancer: Valor Pago */}
                  {venda.tipo === 'freelancer' && (
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Pagamento (Custo)</label>
                      <CurrencyInput
                        value={venda.valorPago || 0}
                        onChange={(valor) => atualizarVenda(index, 'valorPago', valor)}
                        className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 text-sm focus:ring-red-500"
                      />
                    </div>
                  )}

                  {/* Botão Remover (apenas freelancer) */}
                  {venda.tipo === 'freelancer' && (
                    <div className="md:ml-2">
                      <button
                        onClick={() => removerFreelancer(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover Freelancer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={adicionarFreelancer}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors px-2"
            >
              <Plus size={16} />
              Adicionar Freelancer
            </button>
          </div>
        </div>

        {/* Despesas do Evento */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Despesas do Evento</h3>
          
          <div className="space-y-4">
            {(formData.despesas || []).map((despesa, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Categoria</label>
                  <ExpenseCategorySelector
                    value={despesa.descricao}
                    onChange={(valor) => atualizarDespesa(index, 'descricao', valor)}
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor</label>
                  <CurrencyInput
                    value={despesa.valor}
                    onChange={(valor) => atualizarDespesa(index, 'valor', valor)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Quem Pagou?</label>
                  <select
                    value={despesa.quemPagou}
                    onChange={(e) => atualizarDespesa(index, 'quemPagou', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="Caixa">Caixa do Evento</option>
                    <option value="Diogo">Diogo</option>
                    <option value="Aziel">Aziel</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex justify-end md:justify-center">
                  <button
                    onClick={() => removerDespesa(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={adicionarDespesa}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors px-2"
            >
              <Plus size={16} />
              Adicionar Despesa
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvarClick}
            className="px-6 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Salvar Evento
          </button>
        </div>
      </div>
    </div>
  );
};
