import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Plus, BarChart3, Loader2 } from 'lucide-react';
import { VendaEvento } from './types';
import { FormularioVendaEvento } from './FormularioVendaEvento';
import { DetalheVendaEvento } from './DetalheVendaEvento';
import { RelatoriosVendas } from './RelatoriosVendas';
import { ListaVendas } from './ListaVendas';
import { useVendas } from '../../hooks/useVendas';
import { toast } from 'sonner';

// Wrapper para edição que lida com o parâmetro ID
const EditarVendaWrapper = ({ eventos, onSalvar, onCancelar }: { eventos: VendaEvento[], onSalvar: (evento: VendaEvento | Omit<VendaEvento, 'id'>) => void, onCancelar: () => void }) => {
  const { id } = useParams();
  const evento = eventos.find(e => e.id === Number(id));
  
  if (!evento) return <div className="p-6 text-center text-zinc-500">Evento não encontrado</div>;
  
  return <FormularioVendaEvento evento={evento} eventosPassados={eventos} onSalvar={onSalvar} onCancelar={onCancelar} />;
};

// Wrapper para detalhes que lida com o parâmetro ID
const DetalhesVendaWrapper = ({ eventos }: { eventos: VendaEvento[] }) => {
  const { id } = useParams();
  const evento = eventos.find(e => e.id === Number(id));
  
  if (!evento) return <div className="p-6 text-center text-zinc-500">Evento não encontrado</div>;
  
  return <DetalheVendaEvento evento={evento} />;
};

export const GestaoVendas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventos: vendaEventos, loading, salvarEvento, excluirEvento } = useVendas();
  const scrollKey = 'gestao-vendas-scroll';
  
  // Determina qual aba está ativa baseado na URL
  const isLista = location.pathname.endsWith('dashboard-Venda-das-Corridas') || location.pathname.endsWith('dashboard-Venda-das-Corridas/');
  const isNovo = location.pathname.includes('/novo');
  const isRelatorios = location.pathname.includes('/relatorios');

  const salvarPosicaoScroll = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(scrollKey, String(window.scrollY));
  };

  const handleSalvar = async (dados: VendaEvento | Omit<VendaEvento, 'id'>) => {
    const sucesso = await salvarEvento(dados);
    if (sucesso) {
      toast.success('Evento salvo com sucesso!');
      navigate('/dashboard-Venda-das-Corridas');
    } else {
      toast.error('Erro ao salvar evento. Tente novamente.');
    }
  };

  const handleExcluir = async (evento: VendaEvento) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${evento.nome}"?`)) {
      await excluirEvento(evento.id);
      toast.success('Evento excluído com sucesso!');
    }
  };

  if (loading && vendaEventos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

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
          onClick={() => navigate('/dashboard-Venda-das-Corridas')}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all ${
            isLista
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Lista de Eventos
        </button>
        <button
          onClick={() => navigate('/dashboard-Venda-das-Corridas/novo')}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isNovo
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Plus size={20} /> Novo Evento
        </button>
        <button
          onClick={() => navigate('/dashboard-Venda-das-Corridas/relatorios')}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isRelatorios
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BarChart3 size={20} /> Relatórios
        </button>
      </div>

      <Routes>
        <Route path="/" element={
          <ListaVendas 
            eventos={vendaEventos} 
            onNovoEvento={() => navigate('novo')}
            onEditar={(evento) => {
              salvarPosicaoScroll();
              navigate(`editar/${evento.id}`);
            }}
            onDetalhes={(evento) => {
              salvarPosicaoScroll();
              navigate(`detalhes/${evento.id}`);
            }}
            onRelatorios={() => navigate('relatorios')}
            onExcluir={handleExcluir}
          />
        } />
        <Route path="novo" element={
          <FormularioVendaEvento
            eventosPassados={vendaEventos}
            onSalvar={handleSalvar}
            onCancelar={() => navigate('/dashboard-Venda-das-Corridas')}
          />
        } />
        <Route path="editar/:id" element={
          <EditarVendaWrapper 
            eventos={vendaEventos} 
            onSalvar={handleSalvar}
            onCancelar={() => navigate('/dashboard-Venda-das-Corridas')}
          />
        } />
        <Route path="detalhes/:id" element={
          <DetalhesVendaWrapper eventos={vendaEventos} />
        } />
        <Route path="relatorios" element={
          <RelatoriosVendas eventos={vendaEventos} />
        } />
      </Routes>
    </div>
  );
};
