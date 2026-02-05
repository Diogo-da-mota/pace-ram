import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendaEvento } from '../components/vendas/types';

export const useVendas = () => {
  const [eventos, setEventos] = useState<VendaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      
      // Buscar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('venda_eventos')
        .select('*')
        .order('data', { ascending: false });

      if (eventosError) throw eventosError;

      // Buscar itens (vendas)
      const { data: itensData, error: itensError } = await supabase
        .from('venda_itens')
        .select('*');

      if (itensError) throw itensError;

      // Buscar despesas
      const { data: despesasData, error: despesasError } = await supabase
        .from('venda_despesas')
        .select('*');

      if (despesasError) throw despesasError;

      // Montar objeto completo
      const eventosCompletos: VendaEvento[] = eventosData.map((evento: any) => {
        const vendasDoEvento = itensData
          .filter((item: any) => item.evento_id === evento.id)
          .map((item: any) => ({
            id: item.id,
            nome: item.nome,
            tipo: item.tipo as 'socio' | 'freelancer',
            valorVendido: Number(item.valor_vendido),
            contaBancaria: Number(item.conta_bancaria),
            valorPago: Number(item.valor_pago),
            valorLiquido: Number(item.valor_liquido)
          }));

        const despesasDoEvento = despesasData
          .filter((despesa: any) => despesa.evento_id === evento.id)
          .map((despesa: any) => ({
            id: despesa.id,
            descricao: despesa.descricao,
            valor: Number(despesa.valor),
            quemPagou: despesa.quem_pagou as 'Diogo' | 'Aziel' | 'Caixa'
          }));

        return {
          id: evento.id,
          nome: evento.nome,
          data: evento.data,
          quemPagouFreelancers: evento.quem_pagou_freelancers as 'Diogo' | 'Aziel',
          vendas: vendasDoEvento,
          despesas: despesasDoEvento
        };
      });

      setEventos(eventosCompletos);
    } catch (err: any) {
      console.error('Erro ao buscar vendas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const salvarEvento = async (evento: Omit<VendaEvento, 'id'> | VendaEvento) => {
    try {
      setLoading(true);
      
      let eventoId: number;

      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Salvar ou Atualizar Evento Pai
      if ('id' in evento && evento.id) {
        // Atualizar
        const { error: updateError } = await supabase
          .from('venda_eventos')
          .update({
            nome: evento.nome,
            data: evento.data,
            quem_pagou_freelancers: evento.quemPagouFreelancers
          })
          .eq('id', evento.id);

        if (updateError) throw updateError;
        eventoId = evento.id;
      } else {
        // Criar
        const { data: novoEvento, error: createError } = await supabase
          .from('venda_eventos')
          .insert({
            nome: evento.nome,
            data: evento.data,
            quem_pagou_freelancers: evento.quemPagouFreelancers,
            criado_por: user.id
          })
          .select()
          .single();

        if (createError) throw createError;
        eventoId = novoEvento.id;
      }

      // 2. Lidar com Itens (Vendas)
      // Deletar todos e recriar
      await supabase.from('venda_itens').delete().eq('evento_id', eventoId);
      
      if (evento.vendas.length > 0) {
        const itensParaInserir = evento.vendas.map((venda: any) => ({
          evento_id: eventoId,
          nome: venda.nome,
          tipo: venda.tipo,
          valor_vendido: venda.valorVendido,
          conta_bancaria: venda.contaBancaria || 0,
          valor_pago: venda.valorPago || 0,
          valor_liquido: venda.valorLiquido || 0
        }));

        const { error: itensError } = await supabase
          .from('venda_itens')
          .insert(itensParaInserir);

        if (itensError) throw itensError;
      }

      // 3. Lidar com Despesas
      await supabase.from('venda_despesas').delete().eq('evento_id', eventoId);

      if (evento.despesas && evento.despesas.length > 0) {
        const despesasParaInserir = evento.despesas.map((despesa: any) => ({
          evento_id: eventoId,
          descricao: despesa.descricao,
          valor: despesa.valor,
          quem_pagou: despesa.quemPagou
        }));

        const { error: despesasError } = await supabase
          .from('venda_despesas')
          .insert(despesasParaInserir);

        if (despesasError) throw despesasError;
      }

      // Recarregar dados
      await fetchEventos();
      return true;

    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const excluirEvento = async (id: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('venda_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchEventos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    salvarEvento,
    excluirEvento,
    fetchEventos
  };
};
