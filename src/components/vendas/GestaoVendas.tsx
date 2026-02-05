import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Plus, BarChart3 } from 'lucide-react';
import { VendaEvento } from './types';
import { FormularioVendaEvento } from './FormularioVendaEvento';
import { DetalheVendaEvento } from './DetalheVendaEvento';
import { RelatoriosVendas } from './RelatoriosVendas';
import { ListaVendas } from './ListaVendas';

// Wrapper para edição que lida com o parâmetro ID
const EditarVendaWrapper = ({ eventos, onSalvar, onCancelar }: { eventos: VendaEvento[], onSalvar: (evento: VendaEvento) => void, onCancelar: () => void }) => {
  const { id } = useParams();
  const evento = eventos.find(e => e.id === Number(id));
  
  if (!evento) return <div className="p-6 text-center text-zinc-500">Evento não encontrado</div>;
  
  return <FormularioVendaEvento evento={evento} onSalvar={onSalvar} onCancelar={onCancelar} />;
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
  
  // Determina qual aba está ativa baseado na URL
  const isLista = location.pathname.endsWith('dashboard-Venda-das-Corridas') || location.pathname.endsWith('dashboard-Venda-das-Corridas/');
  const isNovo = location.pathname.includes('/novo');
  const isRelatorios = location.pathname.includes('/relatorios');

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

  const handleSalvarNovo = (dados: Omit<VendaEvento, 'id'>) => {
    const novoEvento = { ...dados, id: Date.now() };
    setVendaEventos([...vendaEventos, novoEvento]);
    navigate('/dashboard-Venda-das-Corridas');
  };

  const handleSalvarEdicao = (dados: VendaEvento) => {
    const eventosAtualizados = vendaEventos.map(e =>
      e.id === dados.id ? dados : e
    );
    setVendaEventos(eventosAtualizados);
    navigate('/dashboard-Venda-das-Corridas');
  };

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
            onEditar={(evento) => navigate(`editar/${evento.id}`)}
            onDetalhes={(evento) => navigate(`detalhes/${evento.id}`)}
            onRelatorios={() => navigate('relatorios')}
          />
        } />
        <Route path="novo" element={
          <FormularioVendaEvento
            onSalvar={handleSalvarNovo}
            onCancelar={() => navigate('/dashboard-Venda-das-Corridas')}
          />
        } />
        <Route path="editar/:id" element={
          <EditarVendaWrapper 
            eventos={vendaEventos} 
            onSalvar={handleSalvarEdicao}
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
