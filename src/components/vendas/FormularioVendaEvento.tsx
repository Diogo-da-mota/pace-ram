import { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, Plus, DollarSign, TrendingUp, Calculator, ChevronDown, Fuel, Utensils, Handshake, MoreHorizontal, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { VendaEvento, VendaFotografo, Despesa } from './types';
import { CurrencyInput } from './CurrencyInput';
import { formatarMoeda } from './utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de filtro inteligente
  const sugestoesFiltradas = useMemo(() => {
    if (!value) return sugestoes;
    
    const valueLower = value.toLowerCase().trim();
    
    // Se o valor atual é exatamente uma das opções (case insensitive), mostra todas
    if (sugestoes.some(s => s.toLowerCase() === valueLower)) return sugestoes;
    
    // Caso contrário, filtra pelo texto digitado
    return sugestoes.filter(s => s.toLowerCase().includes(valueLower));
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
          onClick={() => setOpen(true)}
          onFocus={(e) => {
            setOpen(true);
            // Pequeno delay para garantir que a seleção ocorra após o foco
            setTimeout(() => e.target.select(), 10);
          }}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 text-sm pr-8 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          autoComplete="off"
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
    
    const valueLower = value.toLowerCase().trim();
    
    // Se o valor atual é exatamente uma das opções (case insensitive), mostra todas
    if (CATEGORIAS_DESPESA.some(c => c.label.toLowerCase() === valueLower)) {
      return CATEGORIAS_DESPESA;
    }
    
    return CATEGORIAS_DESPESA.filter(c => 
      c.label.toLowerCase().includes(valueLower)
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
          onClick={() => setOpen(true)}
          onFocus={(e) => {
            setOpen(true);
            setTimeout(() => e.target.select(), 10);
          }}
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
      setFormData(prev => {
        const vendasComPorcentagem = prev.vendas.map(v => ({
            ...v,
            porcentagem: v.tipo === 'socio' && v.porcentagem === undefined ? 50 : v.porcentagem
        }));
        
        return {
            ...prev,
            totalVendidoSite: prev.totalVendidoSite ?? 0,
            comissaoPercentual: prev.comissaoPercentual ?? 10,
            valorLiquido: prev.valorLiquido ?? 0,
            dividirLucros: prev.dividirLucros ?? true,
            vendas: vendasComPorcentagem
        };
      });
    }
  }, [evento]);

  // Helper para recalcular valores dos sócios
  const recalcularValoresSocios = (dados: VendaEvento): VendaEvento => {
    // Se não estiver dividindo lucros, talvez não devêssemos alterar, 
    // mas o usuário pediu cálculo automático. Vamos manter consistente.
    
    const totalLiquidoEvento = dados.valorLiquido || 0;
    
    const totalPagoFreelancers = dados.vendas
      .filter(v => v.tipo === 'freelancer')
      .reduce((acc, curr) => acc + (curr.valorPago || 0), 0);
    
    const totalDespesas = (dados.despesas || [])
       .reduce((acc, curr) => acc + (curr.valor || 0), 0);
    
    const lucroDisponivel = totalLiquidoEvento - totalPagoFreelancers - totalDespesas;

    const novasVendas = dados.vendas.map(venda => {
      if (venda.tipo === 'socio') {
        const pct = venda.porcentagem ?? 50;
        return {
            ...venda,
            valorLiquido: lucroDisponivel * (pct / 100)
        };
      }
      return venda;
    });

    return { ...dados, vendas: novasVendas };
  };

  const adicionarFreelancer = () => {
    const novosDados = {
      ...formData,
      vendas: [...formData.vendas, { nome: '', tipo: 'freelancer' as const, valorVendido: 0, valorPago: 0 }]
    };
    setFormData(recalcularValoresSocios(novosDados));
  };

  const removerFreelancer = (index: number) => {
    const novasVendas = formData.vendas.filter((_, i) => i !== index);
    const novosDados = { ...formData, vendas: novasVendas };
    setFormData(recalcularValoresSocios(novosDados));
  };

  const atualizarVenda = (index: number, campo: keyof VendaFotografo, valor: string | number) => {
    const novasVendas = [...formData.vendas];
    const isNumero = campo === 'valorVendido' || campo === 'valorPago' || campo === 'contaBancaria' || campo === 'valorLiquido' || campo === 'porcentagem';
    novasVendas[index] = { ...novasVendas[index], [campo]: isNumero ? Number(valor) : valor };
    
    // Se alterou valorVendido, recalcula tudo em cascata
    if (campo === 'valorVendido') {
        // 1. Somar todos os valores vendidos (sócios + freelancers)
        const novoTotalVendido = novasVendas.reduce((acc, curr) => acc + (curr.valorVendido || 0), 0);
        
        // 2. Calcular novo valor líquido global (Total - Comissão)
        const comissao = formData.comissaoPercentual || 0;
        const novoValorLiquido = novoTotalVendido - (novoTotalVendido * (comissao / 100));

        // 3. Recalcular porcentagens dos sócios baseado na produção individual
        const vendasSocios = novasVendas.filter(v => v.tipo === 'socio');
        const totalVendidoSocios = vendasSocios.reduce((acc, curr) => acc + (curr.valorVendido || 0), 0);
        
        const vendasComPorcentagemRecalculada = novasVendas.map(venda => {
            if (venda.tipo === 'socio') {
                let novaPct = 50; // Default
                if (totalVendidoSocios > 0) {
                    novaPct = ((venda.valorVendido || 0) / totalVendidoSocios) * 100;
                    // Arredondar para 2 casas decimais para evitar dízimas
                    novaPct = Math.round(novaPct * 100) / 100;
                }
                return { ...venda, porcentagem: novaPct };
            }
            return venda;
        });

        // 4. Montar novo objeto de dados e chamar o recálculo final (que abate despesas/freelancers)
        const dadosAtualizados = { 
            ...formData, 
            vendas: vendasComPorcentagemRecalculada,
            totalVendidoSite: novoTotalVendido,
            valorLiquido: novoValorLiquido
        };
        
        setFormData(recalcularValoresSocios(dadosAtualizados));
        return;
    }

    const dadosAtualizados = { ...formData, vendas: novasVendas };
    
    // Se alterou valorPago de freelancer, recalcula sócios
    if (novasVendas[index].tipo === 'freelancer' && campo === 'valorPago') {
        setFormData(recalcularValoresSocios(dadosAtualizados));
    } else {
        setFormData(dadosAtualizados);
    }
  };

  const handlePorcentagemChange = (index: number, novaPorcentagem: number) => {
    if (novaPorcentagem < 0 || novaPorcentagem > 100) return;
    
    const novasVendas = [...formData.vendas];
    
    // Atualizar o sócio modificado
    novasVendas[index] = { ...novasVendas[index], porcentagem: novaPorcentagem };
    
    // Tentar ajustar automaticamente o outro sócio
    const outrosSociosIndices = novasVendas
        .map((v, i) => ({ ...v, idx: i }))
        .filter(v => v.tipo === 'socio' && v.idx !== index);
        
    if (outrosSociosIndices.length === 1) {
        const outroSocioIdx = outrosSociosIndices[0].idx;
        const restante = 100 - novaPorcentagem;
        const restanteFormatado = Math.round(restante * 100) / 100;
        novasVendas[outroSocioIdx] = { 
            ...novasVendas[outroSocioIdx], 
            porcentagem: restanteFormatado 
        };
    }

    const dadosAtualizados = { ...formData, vendas: novasVendas };
    setFormData(recalcularValoresSocios(dadosAtualizados));
  };

  const resetarPorcentagens = () => {
    const novasVendas = formData.vendas.map(v => {
        if (v.tipo === 'socio') {
            return { ...v, porcentagem: 50 };
        }
        return v;
    });
    const dadosAtualizados = { ...formData, vendas: novasVendas };
    setFormData(recalcularValoresSocios(dadosAtualizados));
  };

  const atualizarFinanceiro = (campo: 'totalVendidoSite' | 'comissaoPercentual', valor: number) => {
    const novosDados = { ...formData, [campo]: valor };
    
    // Recalcular líquido
    const total = campo === 'totalVendidoSite' ? valor : formData.totalVendidoSite;
    const comissao = campo === 'comissaoPercentual' ? valor : formData.comissaoPercentual;
    const liquido = total - (total * (comissao / 100));
    
    const dadosComLiquido = { ...novosDados, valorLiquido: liquido };
    setFormData(recalcularValoresSocios(dadosComLiquido));
  };

  const adicionarDespesa = () => {
    const novosDados = {
      ...formData,
      despesas: [...(formData.despesas || []), { descricao: '', valor: 0, quemPagou: 'Caixa' as const }]
    };
    setFormData(recalcularValoresSocios(novosDados));
  };

  const removerDespesa = (index: number) => {
    const novasDespesas = (formData.despesas || []).filter((_, i) => i !== index);
    const novosDados = { ...formData, despesas: novasDespesas };
    setFormData(recalcularValoresSocios(novosDados));
  };

  const atualizarDespesa = (index: number, campo: keyof Despesa, valor: string | number) => {
    const novasDespesas = [...(formData.despesas || [])];
    const isNumero = campo === 'valor';
    novasDespesas[index] = { ...novasDespesas[index], [campo]: isNumero ? Number(valor) : valor };
    
    const dadosAtualizados = { ...formData, despesas: novasDespesas };
    
    // Se alterou valor ou quem pagou, pode afetar o cálculo (se for Caixa)
    setFormData(recalcularValoresSocios(dadosAtualizados));
  };

  // Extrair nomes de freelancers já cadastrados para sugestões
  const sugestoesNomes = useMemo(() => {
    const nomes = new Set<string>();
    eventosPassados.forEach(evt => {
      evt.vendas.forEach(venda => {
        if (venda.nome && venda.nome !== 'Diogo' && venda.nome !== 'Aziel') {
          nomes.add(venda.nome);
        }
      });
    });
    return Array.from(nomes).sort();
  }, [eventosPassados]);

  const handleSalvarClick = () => {
    // Validação
    if (formData.totalVendidoSite <= 0) {
      toast.error('O Total Vendido deve ser maior que zero.');
      return;
    }

    // Validar despesas
    if (formData.despesas && formData.despesas.length > 0) {
      const despesasInvalidas = formData.despesas.some(d => !d.descricao || d.descricao.trim() === '');
      if (despesasInvalidas) {
        toast.error('Todas as despesas devem ter uma categoria selecionada.');
        return;
      }
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
        
        <div className="hidden md:flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Label htmlFor="dividir-lucros" className="cursor-pointer font-medium text-sm text-zinc-600 dark:text-zinc-400">
                {formData.dividirLucros !== false ? 'Dividindo Lucros' : 'Lucros Individuais'}
            </Label>
            <Switch
                id="dividir-lucros"
                checked={formData.dividirLucros !== false}
                onCheckedChange={(checked) => {
                    const novosDados = { ...formData, dividirLucros: checked };
                    setFormData(recalcularValoresSocios(novosDados));
                }}
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
              <div className="md:hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <Switch
                  aria-label="Dividir Lucros"
                  checked={formData.dividirLucros !== false}
                  onCheckedChange={(checked) => {
                      const novosDados = { ...formData, dividirLucros: checked };
                      setFormData(recalcularValoresSocios(novosDados));
                  }}
                />
              </div>
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
                <CurrencyInput
                  value={formData.totalVendidoSite}
                  onChange={(v) => atualizarFinanceiro('totalVendidoSite', v)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900"
                />
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
                    onChange={(e) => atualizarFinanceiro('comissaoPercentual', Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 outline-none pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">%</span>
                </div>
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
          <div className="flex flex-row gap-4">
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Vendas por Fotógrafo (Manual)</h3>
            <button
                type="button"
                onClick={resetarPorcentagens}
                className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700"
                title="Resetar porcentagens para 50/50"
            >
                <RotateCcw size={14} />
                Resetar 50/50
            </button>
          </div>
          <div className="space-y-4">
            {formData.vendas.map((venda, index) => (
              <div key={index} className="p-3 md:p-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-row md:grid md:grid-cols-4 gap-2 md:gap-4 items-end">
                  <div className="w-[30%] md:w-auto">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                      {venda.tipo === 'socio' ? 'Sócio' : 'Nome'}
                    </label>
                    <FreelancerSelector
                      value={venda.nome}
                      onChange={(valor) => atualizarVenda(index, 'nome', valor)}
                      sugestoes={venda.tipo === 'freelancer' ? sugestoesNomes : []}
                      disabled={venda.tipo === 'socio'}
                    />
                  </div>
                  <div className="w-[30%] md:w-auto">
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor Vendido</label>
                    <CurrencyInput
                      value={venda.valorVendido}
                      onChange={(valor) => atualizarVenda(index, 'valorVendido', valor)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  </div>
                  {venda.tipo === 'socio' ? (
                    <div className="flex-1 md:col-span-2 flex flex-col md:flex-row gap-2">
                        <div className="flex-1 min-w-[80px]">
                             <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                                %
                             </label>
                             <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={venda.porcentagem ?? 50}
                                    onChange={(e) => handlePorcentagemChange(index, Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm pr-6 outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
                             </div>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                            <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                                Líquido (Calc.)
                            </label>
                            <div className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-sm font-medium cursor-not-allowed flex items-center">
                                <span className="text-xs mr-1">R$</span>
                                {formatarMoeda(venda.valorLiquido || 0)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Conta Bancária</label>
                          <CurrencyInput
                            value={venda.contaBancaria || 0}
                            onChange={(valor) => atualizarVenda(index, 'contaBancaria', valor)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                          />
                        </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 md:w-auto">
                        <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Valor Pago</label>
                        <CurrencyInput
                          value={venda.valorPago || 0}
                          onChange={(valor) => atualizarVenda(index, 'valorPago', valor)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                        />
                      </div>
                      <div className="flex items-end w-auto">
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
                    <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Categoria</label>
                    <ExpenseCategorySelector
                      value={despesa.descricao}
                      onChange={(valor) => atualizarDespesa(index, 'descricao', valor)}
                      error={!despesa.descricao && false}
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
