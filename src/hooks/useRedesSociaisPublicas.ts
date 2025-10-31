import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RedeSocialPublica {
  id: string;
  titulo: string;
  link: string;
  icone: 'instagram' | 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'discord' | 'telegram' | 'pinterest' | 'snapchat' | 'link';
  titulo_secao?: string;
  created_at: string;
}

export const useRedesSociaisPublicas = () => {
  const [redesSociais, setRedesSociais] = useState<RedeSocialPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const buscarRedesSociais = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('redes_sociais')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar redes sociais:', error);
          setError(error.message);
          return;
        }

        setRedesSociais(data || []);
      } catch (err) {
        console.error('Erro inesperado ao buscar redes sociais:', err);
        setError('Erro inesperado ao carregar redes sociais');
      } finally {
        setLoading(false);
      }
    };

    // Busca inicial
    buscarRedesSociais();
    
    // Criar subscription do Realtime
    const channel = supabase
      .channel('redes-sociais-publicas-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'redes_sociais'
        },
        (payload) => {
          console.log('Mudança detectada na tabela redes_sociais:', payload);
          buscarRedesSociais(); // Recarrega dados
        }
      )
      .subscribe();
    
    // Cleanup: remover subscription quando desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    redesSociais,
    loading,
    error
  };
};