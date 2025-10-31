import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NovoOutroData {
  titulo: string;
  link_externo?: string;
}

export interface OutroData extends NovoOutroData {
  id: string;
  publicado: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export const useOutros = () => {
  const [loading, setLoading] = useState(false);

  const criarOutro = async (dados: NovoOutroData) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('outros_conteudos' as any)
        .insert({
          titulo: dados.titulo,
          link_externo: dados.link_externo || null,
          publicado: true,
          criado_por: null // Não exigir autenticação, igual ao calendário
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Conteúdo adicionado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(`Erro ao adicionar conteúdo: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarOutros = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('outros_conteudos' as any)
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const editarOutro = async (id: string, dados: NovoOutroData) => {
    try {
      setLoading(true);

      const { data: registroExistente, error: erroVerificacao } = await supabase
        .from('outros_conteudos' as any)
        .select('id, titulo, criado_por, publicado')
        .eq('id', id)
        .single();

      if (erroVerificacao) {
        if (erroVerificacao.code === 'PGRST116') {
          throw new Error('Registro não encontrado ou você não tem permissão para editá-lo');
        }
        throw erroVerificacao;
      }

      if (!registroExistente) {
        throw new Error('Registro não encontrado');
      }

      const { error } = await supabase
        .from('outros_conteudos' as any)
        .update({
          titulo: dados.titulo,
          link_externo: dados.link_externo || null
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
      toast.success('Conteúdo atualizado com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao editar outro conteúdo:', error);
      const mensagemErro = error.message || 'Erro desconhecido ao atualizar conteúdo';
      toast.error(`Erro ao atualizar conteúdo: ${mensagemErro}`);
      return { success: false, error: mensagemErro };
    } finally {
      setLoading(false);
    }
  };

  const excluirOutro = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('outros_conteudos' as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Conteúdo excluído com sucesso!');
      return { success: true };
    } catch (error: any) {
      toast.error(`Erro ao excluir conteúdo: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    criarOutro,
    buscarOutros,
    editarOutro,
    excluirOutro
  };
};