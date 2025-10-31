import { useState, useEffect } from 'react';
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
  visivel_pagina_inicial?: boolean;
}

export const useCorridasPublicas = () => {
  const [corridas, setCorridas] = useState<CorridaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarCorridasPublicas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('corridas')
        .select('*')
        .eq('publicado', true)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      setCorridas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar corridas públicas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca inicial
    buscarCorridasPublicas();
    
    // Criar subscription do Realtime
    const channel = supabase
      .channel('corridas-publicas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'corridas'
        },
        (payload) => {
          console.log('Mudança detectada na tabela corridas:', payload);
          buscarCorridasPublicas(); // Recarrega dados
        }
      )
      .subscribe();
    
    // Cleanup: remover subscription quando desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    corridas,
    loading,
    error,
    refetch: buscarCorridasPublicas
  };
};