import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CorridaPublica {
  id: string;
  titulo: string;
  data_evento: string;
  local: string;
  imagem_principal?: string;
  link_externo?: string;
  texto_rodape?: string;
  descricao?: string;
  // Novos campos para sincronização de status
  status?: 'inscricoes_abertas' | 'em_andamento' | 'encerrado';
  evento_calendario_id?: string;
}

// Função para normalizar strings para comparação (remove acentos e converte para minúsculas)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

// Função para fazer matching entre corridas e eventos do calendário por título
const matchCorridasComEventos = (corridas: any[], eventos: any[]): CorridaPublica[] => {
  return corridas.map(corrida => {
    // Procurar evento correspondente por título
    const eventoCorrespondente = eventos.find(evento => 
      normalizeString(evento.titulo) === normalizeString(corrida.titulo)
    );

    if (eventoCorrespondente) {
      // Se encontrou match, usar o status do evento do calendário
      return {
        ...corrida,
        status: eventoCorrespondente.status,
        evento_calendario_id: eventoCorrespondente.id,
        texto_rodape: corrida.texto_rodape || 'COMPRE AS SUAS FOTOS'
      };
    }

    // Se não encontrou match, manter comportamento original
    return {
      ...corrida,
      status: undefined,
      evento_calendario_id: undefined,
      texto_rodape: corrida.texto_rodape || 'COMPRE AS SUAS FOTOS'
    };
  });
};

export const useCorridasSeparadas = () => {
  const [corridasRecentes, setCorridasRecentes] = useState<CorridaPublica[]>([]);
  const [corridasEmBreve, setCorridasEmBreve] = useState<CorridaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buscarCorridasSeparadas = useCallback(async (isRealTimeUpdate = false) => {
    try {
      if (!isRealTimeUpdate) {
        setLoading(true);
      }
      setError(null);
      
      // Melhorar a lógica de comparação de datas
      const agora = new Date();
      // Usar data local ao invés de UTC para evitar problemas de fuso horário
      const hoje = agora.getFullYear() + '-' + 
        String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
        String(agora.getDate()).padStart(2, '0'); // YYYY-MM-DD local
      
      console.log(`[useCorridasSeparadas] Buscando corridas e eventos - Data de referência: ${hoje}`, {
        isRealTimeUpdate,
        timestamp: agora.toISOString()
      });
      
      // Buscar corridas recentes (data <= hoje)
      const { data: corridasRecentes, error: errorCorridasRecentes } = await supabase
        .from('corridas')
        .select('*')
        .eq('publicado', true)
        .eq('visivel_pagina_inicial', true)
        .lte('data_evento', hoje);

      // Buscar corridas em breve (data > hoje)
      const { data: corridasEmBreve, error: errorCorridasEmBreve } = await supabase
        .from('corridas')
        .select('*')
        .eq('publicado', true)
        .eq('visivel_pagina_inicial', true)
        .gt('data_evento', hoje);

      // Buscar eventos recentes (data <= hoje)
      const { data: eventosRecentes, error: errorEventosRecentes } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('publicado', true)
        .lte('data_evento', hoje);

      // Buscar eventos em breve (data > hoje)
      const { data: eventosEmBreve, error: errorEventosEmBreve } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('publicado', true)
        .gt('data_evento', hoje);

      if (errorCorridasRecentes) throw errorCorridasRecentes;
      if (errorCorridasEmBreve) throw errorCorridasEmBreve;
      if (errorEventosRecentes) throw errorEventosRecentes;
      if (errorEventosEmBreve) throw errorEventosEmBreve;

      // Fazer matching entre corridas e eventos para sincronização de status
      const corridasRecentesComStatus = matchCorridasComEventos(
        corridasRecentes || [], 
        eventosRecentes || []
      );

      const corridasEmBreveComStatus = matchCorridasComEventos(
        corridasEmBreve || [], 
        eventosEmBreve || []
      );

      // Exibir APENAS corridas na home (sem eventos do calendário)
      const recentesCombinados = corridasRecentesComStatus
        .sort((a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime());

      const emBreveCombinados = corridasEmBreveComStatus
        .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());

      console.log(`[useCorridasSeparadas] Resultados apenas de corridas com sincronização de status:`, {
        recentesCount: recentesCombinados.length,
        emBreveCount: emBreveCombinados.length,
        corridasRecentesCount: corridasRecentes?.length || 0,
        corridasEmBreveCount: corridasEmBreve?.length || 0,
        corridasComStatusSincronizado: corridasEmBreveComStatus.filter(c => c.status).length,
        recentes: recentesCombinados.map(c => ({ 
          id: c.id, 
          titulo: c.titulo, 
          data_evento: c.data_evento, 
          tipo: 'corrida',
          status: c.status,
          evento_calendario_id: c.evento_calendario_id
        })),
        emBreve: emBreveCombinados.map(c => ({ 
          id: c.id, 
          titulo: c.titulo, 
          data_evento: c.data_evento, 
          tipo: 'corrida',
          status: c.status,
          evento_calendario_id: c.evento_calendario_id
        }))
      });

      setCorridasRecentes(recentesCombinados);
      setCorridasEmBreve(emBreveCombinados);
    } catch (error: any) {
      console.error('Erro ao buscar corridas separadas:', error);
      setError(error.message);
    } finally {
      if (!isRealTimeUpdate) {
        setLoading(false);
      }
    }
  }, []);

  // Função para refetch com delay (para mudanças em tempo real)
  const refetchWithDelay = useCallback((payload?: any) => {
    console.log('[useCorridasSeparadas] Mudança detectada no banco:', payload);
    
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Adicionar delay de 500ms antes de refazer a busca
    timeoutRef.current = setTimeout(() => {
      console.log('[useCorridasSeparadas] Executando refetch após delay');
      buscarCorridasSeparadas(true);
    }, 500);
  }, [buscarCorridasSeparadas]);

  // Função de refetch manual (sem delay)
  const refetchManual = useCallback(() => {
    console.log('[useCorridasSeparadas] Refetch manual solicitado');
    buscarCorridasSeparadas(false);
  }, [buscarCorridasSeparadas]);

  useEffect(() => {
    // Busca inicial
    buscarCorridasSeparadas(false);
    
    // Configurar canal de real-time para ambas as tabelas
    const channel = supabase
      .channel('corridas-separadas-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'corridas'
      }, (payload) => {
        console.log('[useCorridasSeparadas] Mudança detectada na tabela corridas:', payload);
        refetchWithDelay(payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'eventos_calendario'
      }, (payload) => {
        console.log('[useCorridasSeparadas] Mudança detectada na tabela eventos_calendario:', payload);
        refetchWithDelay(payload);
      })
      .subscribe();
    
    console.log('[useCorridasSeparadas] Canal de real-time configurado para corridas e eventos_calendario');
    
    return () => {
      console.log('[useCorridasSeparadas] Limpando recursos');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [refetchWithDelay]);

  return {
    corridasRecentes,
    corridasEmBreve,
    loading,
    error,
    refetch: refetchManual,
    refetchWithDelay
  };
};