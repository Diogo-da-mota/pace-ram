
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NovoEventoData {
  titulo: string;
  data_evento: string;
  local: string;
  link_externo?: string;
  status?: string;
  regiao?: string;
  distancia?: string[];
  horario?: string;
  participantes?: string;
}

export interface EventoData extends NovoEventoData {
  id: string;
  data_evento: string;
  publicado: boolean;
  created_at?: string;
  updated_at?: string;
}

// Mapeamento de status entre português (UI) e inglês (banco)
const STATUS_MAP = {
  'Inscrições abertas': 'inscricoes_abertas',
  'Inscrições Abertas': 'inscricoes_abertas',
  'Em Andamento': 'em_andamento',
  'Inscrições encerrada': 'encerrado',
  'Encerrado': 'encerrado'
} as const;

const STATUS_REVERSE_MAP = {
  'inscricoes_abertas': 'Inscrições abertas',
  'em_andamento': 'Em Andamento',
  'encerrado': 'Inscrições encerrada'
} as const;

// Função para converter status da UI para o banco
const mapStatusToDatabase = (status?: string): string => {
  if (!status) return 'inscricoes_abertas';
  return STATUS_MAP[status as keyof typeof STATUS_MAP] || 'inscricoes_abertas';
};

// Função para converter status do banco para a UI
const mapStatusFromDatabase = (status?: string): string => {
  if (!status) return 'Inscrições abertas';
  return STATUS_REVERSE_MAP[status as keyof typeof STATUS_REVERSE_MAP] || 'Inscrições abertas';
};

export const useCalendario = () => {
  const [loading, setLoading] = useState(false);

  const criarEvento = async (dados: NovoEventoData) => {
    try {
      setLoading(true);

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Você precisa estar logado para criar eventos');
        throw new Error('Usuário não autenticado');
      }

      // Usuário já é sincronizado automaticamente pelo trigger do backend
      // Não é necessário verificar ou inserir manualmente

      const { data, error } = await supabase
        .from('eventos_calendario')
        .insert({
          titulo: dados.titulo,
          data_evento: dados.data_evento,
          local: dados.local,
          link_externo: dados.link_externo || null,
          status: mapStatusToDatabase(dados.status),
          regiao: dados.regiao || null,
          distancia: dados.distancia ? JSON.stringify(dados.distancia) : null,
          horario: dados.horario || null,
          participantes: dados.participantes || null,
          publicado: true,
          criado_por: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Evento adicionado ao calendário com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(`Erro ao adicionar evento: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const buscarEventos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('publicado', true)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      // Manter status em inglês para compatibilidade com EventoCardDashboard e processar distancia
      const eventosProcessados = data?.map(evento => ({
        ...evento,
        distancia: evento.distancia ? JSON.parse(evento.distancia) : []
      }));

      return { success: true, data: eventosProcessados };
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const editarEvento = async (id: string, dados: NovoEventoData) => {
    try {
      setLoading(true);

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Você precisa estar logado para editar eventos');
        throw new Error('Usuário não autenticado');
      }

      // Verificar se o evento existe e se o usuário tem permissão para editá-lo
      const { data: eventoExistente, error: fetchError } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !eventoExistente) {
        toast.error('Evento não encontrado');
        throw new Error('Evento não encontrado');
      }

      const { data, error } = await supabase
        .from('eventos_calendario')
        .update({
          titulo: dados.titulo,
          data_evento: dados.data_evento,
          local: dados.local,
          link_externo: dados.link_externo || null,
          status: mapStatusToDatabase(dados.status),
          regiao: dados.regiao || null,
          distancia: dados.distancia ? JSON.stringify(dados.distancia) : null,
          horario: dados.horario || null,
          participantes: dados.participantes || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Evento atualizado com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(`Erro ao atualizar evento: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const excluirEvento = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('eventos_calendario')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir evento:', error);
        throw error;
      }

      // console.log('Evento excluído com sucesso'); // Removido log de debug
      toast.success('Evento excluído com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir evento:', error);
      toast.error(`Erro ao excluir evento: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    criarEvento,
    buscarEventos,
    editarEvento,
    excluirEvento,
    mapStatusFromDatabase,
    mapStatusToDatabase
  };
};
