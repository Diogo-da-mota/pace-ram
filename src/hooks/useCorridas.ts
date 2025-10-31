
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NovaCorridaData {
  titulo: string;
  data_evento: string;
  local: string;
  imagem_principal?: string;
  link_externo?: string;
  texto_rodape?: string;
  descricao?: string;
}

export interface CorridaData extends NovaCorridaData {
  id: string;
  publicado: boolean;
  visivel_pagina_inicial?: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export const useCorridas = () => {
  const [loading, setLoading] = useState(false);

  const criarCorrida = async (dados: NovaCorridaData) => {
    try {
      setLoading(true);
      // console.log('Enviando dados para Supabase:', dados); // Removido log de debug

      const { data, error } = await supabase
        .from('corridas')
        .insert({
          titulo: dados.titulo,
          data_evento: dados.data_evento,
          local: dados.local,
          imagem_principal: dados.imagem_principal || null,
          link_externo: dados.link_externo || null,
          texto_rodape: dados.texto_rodape || null,
          descricao: dados.descricao || null,
          publicado: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar corrida:', error);
        throw error;
      }

      // console.log('Corrida criada com sucesso:', data); // Removido log de debug
      toast.success('Corrida adicionada com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao criar corrida:', error);
      toast.error(`Erro ao adicionar corrida: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarCorridas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('corridas')
        .select('*')
        .eq('publicado', true)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao buscar corridas:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const editarCorrida = async (id: string, dados: NovaCorridaData) => {
    try {
      setLoading(true);
      // console.log('Editando corrida:', id, dados); // Removido log de debug

      const { data, error } = await supabase
        .from('corridas')
        .update({
          titulo: dados.titulo,
          data_evento: dados.data_evento,
          local: dados.local,
          imagem_principal: dados.imagem_principal || null,
          link_externo: dados.link_externo || null,
          texto_rodape: dados.texto_rodape || null,
          descricao: dados.descricao || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar corrida:', error);
        throw error;
      }

      // console.log('Corrida editada com sucesso:', data); // Removido log de debug
      toast.success('Corrida atualizada com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao editar corrida:', error);
      toast.error(`Erro ao atualizar corrida: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const excluirCorrida = async (id: string) => {
    try {
      setLoading(true);
      // console.log('Excluindo corrida:', id); // Removido log de debug

      const { error } = await supabase
        .from('corridas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir corrida:', error);
        throw error;
      }

      // console.log('Corrida excluída com sucesso'); // Removido log de debug
      toast.success('Corrida excluída com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir corrida:', error);
      toast.error(`Erro ao excluir corrida: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarCorridaPorId = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('corridas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao buscar corrida:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibilidade = async (id: string) => {
    try {
      setLoading(true);
      // console.log('Alterando visibilidade da corrida:', id); // Removido log de debug

      // Primeiro busca o valor atual
      const { data: corridaAtual, error: errorBusca } = await supabase
        .from('corridas')
        .select('visivel_pagina_inicial')
        .eq('id', id)
        .single();

      if (errorBusca) {
        console.error('Erro ao buscar corrida atual:', errorBusca);
        throw errorBusca;
      }

      // Inverte o valor (trata null/undefined como true)
      const valorAtual = corridaAtual.visivel_pagina_inicial ?? true;
      const novoValor = !valorAtual;

      const { data, error } = await supabase
        .from('corridas')
        .update({ visivel_pagina_inicial: novoValor })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar visibilidade:', error);
        throw error;
      }

      // console.log('Visibilidade alterada com sucesso:', data); // Removido log de debug
      toast.success(novoValor ? 'Corrida agora está visível na página inicial!' : 'Corrida ocultada da página inicial!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao alterar visibilidade:', error);
      toast.error(`Erro ao alterar visibilidade: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    criarCorrida,
    buscarCorridas,
    editarCorrida,
    excluirCorrida,
    buscarCorridaPorId,
    toggleVisibilidade
  };
};
