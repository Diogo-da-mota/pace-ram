import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventoPublico {
  id: string;
  titulo: string;
  data_evento: string;
  local?: string;
  link_externo?: string;
  descricao?: string;
  status?: 'inscricoes_abertas' | 'em_andamento' | 'encerrado';
  regiao?: string;
  distancia?: string[];
}

export const useEventosPublicos = () => {
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [regioes, setRegioes] = useState<string[]>([]);
  const [anos, setAnos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarEventosPublicos = async (filtroRegiao?: string, filtroStatus?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('eventos_calendario')
        .select('*')
        .eq('publicado', true);

      // Aplicar filtros se fornecidos
      if (filtroRegiao && filtroRegiao !== '') {
        query = query.eq('regiao', filtroRegiao);
      }

      if (filtroStatus && filtroStatus !== '' && filtroStatus !== 'todas') {
        query = query.eq('status', filtroStatus);
      }

      query = query.order('data_evento', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Processar distancia para cada evento
      const eventosProcessados = data?.map(evento => ({
        ...evento,
        distancia: evento.distancia ? JSON.parse(evento.distancia) : []
      })) || [];

      setEventos(eventosProcessados);
    } catch (error: any) {
      console.error('Erro ao buscar eventos públicos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarRegioes = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('regiao')
        .eq('publicado', true)
        .not('regiao', 'is', null)
        .not('regiao', 'eq', '');

      if (error) throw error;

      // Extrair regiões únicas
      const regioesUnicas = [...new Set(data?.map(item => item.regiao).filter(Boolean))] as string[];
      setRegioes(regioesUnicas.sort());
    } catch (error: any) {
      console.error('Erro ao buscar regiões:', error);
    }
  };

  const buscarAnos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('data_evento')
        .eq('publicado', true)
        .not('data_evento', 'is', null);

      if (error) throw error;

      // Extrair anos únicos das datas
      const anosUnicos = [...new Set(data?.map(item => {
        const ano = new Date(item.data_evento).getFullYear().toString();
        return ano;
      }).filter(Boolean))] as string[];
      
      setAnos(anosUnicos.sort((a, b) => parseInt(b) - parseInt(a))); // Ordem decrescente (mais recente primeiro)
    } catch (error: any) {
      console.error('Erro ao buscar anos:', error);
    }
  };

  useEffect(() => {
    // Busca inicial
    buscarEventosPublicos();
    buscarRegioes();
    buscarAnos();
    
    // Criar subscription do Realtime
    const channel = supabase
      .channel('eventos-publicos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'eventos_calendario'
        },
        (payload) => {
          console.log('Mudança detectada na tabela eventos_calendario:', payload);
          buscarEventosPublicos(); // Recarrega eventos
          buscarRegioes(); // Recarrega regiões
          buscarAnos(); // Recarrega anos
        }
      )
      .subscribe();
    
    // Cleanup: remover subscription quando desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    eventos,
    regioes,
    anos,
    loading,
    error,
    refetch: buscarEventosPublicos,
    buscarEventosComFiltros: buscarEventosPublicos,
    buscarRegioes,
    buscarAnos
  };
};