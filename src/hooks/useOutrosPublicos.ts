import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OutroPublico {
  id: string;
  titulo: string;
  link_externo: string;
  criado_em: string;
}

export const useOutrosPublicos = () => {
  const [outros, setOutros] = useState<OutroPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarOutrosPublicos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('outros_conteudos' as any)
        .select('id, titulo, link_externo, criado_em')
        .eq('publicado', true)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      setOutros((data as any) || []);
    } catch (error: any) {
      console.error('Erro ao buscar outros conteúdos públicos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca inicial
    buscarOutrosPublicos();
    
    // Criar subscription do Realtime
    const channel = supabase
      .channel('outros-publicos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'outros_conteudos'
        },
        (payload) => {
          console.log('Mudança detectada na tabela outros_conteudos:', payload);
          buscarOutrosPublicos(); // Recarrega dados
        }
      )
      .subscribe();
    
    // Cleanup: remover subscription quando desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    outros,
    loading,
    error,
    refetch: buscarOutrosPublicos
  };
};