import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NovaRedeSocialData {
  titulo: string;
  link: string;
  icone: 'instagram' | 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'discord' | 'telegram' | 'pinterest' | 'snapchat' | 'link';
  titulo_secao?: string;
}

export interface RedeSocialData extends NovaRedeSocialData {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export const useRedesSociais = () => {
  const [loading, setLoading] = useState(false);

  const criarRedeSocial = async (dados: NovaRedeSocialData) => {
    try {
      setLoading(true);

      // Obter o usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Você precisa estar logado para criar redes sociais');
        throw new Error('Usuário não autenticado');
      }

      // Garantir que o campo usuario_id seja preenchido com o ID do usuário autenticado
      const dadosComUsuario = {
        titulo: dados.titulo,
        link: dados.link,
        icone: dados.icone,
        titulo_secao: dados.titulo_secao,
        usuario_id: user.id
      };

      const { data, error } = await supabase
        .from('redes_sociais')
        .insert(dadosComUsuario)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Rede social adicionada com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(`Erro ao adicionar rede social: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarRedesSociais = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('redes_sociais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const editarRedeSocial = async (id: string, dados: NovaRedeSocialData) => {
    try {
      setLoading(true);

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Você precisa estar logado para editar redes sociais');
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a rede social existe e se o usuário tem permissão para editá-la
      const { data: redeSocialExistente, error: fetchError } = await supabase
        .from('redes_sociais')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !redeSocialExistente) {
        toast.error('Rede social não encontrada');
        throw new Error('Rede social não encontrada');
      }

      const { data, error } = await supabase
        .from('redes_sociais')
        .update({
          titulo: dados.titulo,
          link: dados.link,
          icone: dados.icone,
          titulo_secao: dados.titulo_secao,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Rede social atualizada com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(`Erro ao atualizar rede social: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const excluirRedeSocial = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('redes_sociais')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      toast.success('Rede social excluída com sucesso!');
      return { success: true };
    } catch (error: any) {
      toast.error(`Erro ao excluir rede social: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarRedeSocialPorId = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('redes_sociais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    criarRedeSocial,
    buscarRedesSociais,
    editarRedeSocial,
    excluirRedeSocial,
    buscarRedeSocialPorId
  };
};