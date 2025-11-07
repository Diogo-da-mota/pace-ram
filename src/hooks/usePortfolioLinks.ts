import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';

export interface PortfolioLink {
  id: string;
  url: string;
  titulo?: string | null;
  descricao?: string | null;
  ativo: boolean;
  criado_em?: string | null;
  atualizado_em?: string | null;
  criado_por?: string | null;
}

export interface NovoPortfolioLink {
  url: string;
  titulo?: string | null;
  descricao?: string | null;
}

export const usePortfolioLinks = () => {
  const [activeLink, setActiveLink] = useState<PortfolioLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, session: authSession, loading: authLoading } = useAuthSession();

  const resolveAuthUser = async () => {
    // 1) Tenta pegar do contexto, que já escuta onAuthStateChange
    if (authUser) return authUser;

    // 2) Tenta pegar da sessão atual
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return session.user;
    } catch (e) {
      console.warn('Falha ao obter sessão via getSession:', e);
    }

    // 3) Fallback final: getUser
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('getUser retornou erro:', error);
      }
      return data?.user ?? null;
    } catch (e) {
      console.warn('Falha ao obter usuário via getUser:', e);
      return null;
    }
  };

  const getPortfolioLink = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('portfolio_links')
        .select('*')
        .eq('ativo', true)
        .order('atualizado_em', { ascending: false })
        .limit(1);

      if (error) throw error;

      const row = Array.isArray(data) && data.length > 0 ? (data[0] as PortfolioLink) : null;
      setActiveLink(row);
      return { success: true, data: row };
    } catch (err: any) {
      console.error('Erro ao buscar link do portfolio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createPortfolioLink = async (novo: NovoPortfolioLink) => {
    try {
      setLoading(true);
      setError(null);
      // Aguarda carregamento básico do contexto se ainda estiver iniciando
      if (authLoading) {
        console.debug('Aguardando finalização do carregamento de autenticação...');
      }

      const user = await resolveAuthUser();
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Desativa qualquer link ativo atual para manter unicidade
      await supabase
        .from('portfolio_links')
        .update({ ativo: false })
        .eq('ativo', true)
        .eq('criado_por', user.id);

      const { data, error } = await supabase
        .from('portfolio_links')
        .insert({
          url: novo.url,
          titulo: novo.titulo ?? null,
          descricao: novo.descricao ?? null,
          ativo: true,
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveLink(data as PortfolioLink);
      toast.success('Link do portfolio salvo com sucesso!');
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao criar link do portfolio:', err);
      setError(err.message);
      toast.error(`Erro ao salvar link: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioLink = async (id: string, updates: Partial<NovoPortfolioLink & { ativo: boolean }>) => {
    try {
      setLoading(true);
      setError(null);
      const user = await resolveAuthUser();
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const { data, error } = await supabase
        .from('portfolio_links')
        .update({
          url: updates.url,
          titulo: updates.titulo ?? null,
          descricao: updates.descricao ?? null,
          ativo: updates.ativo ?? true,
        })
        .eq('id', id)
        .eq('criado_por', user.id)
        .select()
        .single();

      if (error) throw error;

      const updated = data as PortfolioLink;
      setActiveLink((prev) => (prev && prev.id === id ? updated : prev));
      toast.success('Link do portfolio atualizado!');
      return { success: true, data: updated };
    } catch (err: any) {
      console.error('Erro ao atualizar link do portfolio:', err);
      setError(err.message);
      toast.error(`Erro ao atualizar link: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolioLink = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await resolveAuthUser();
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const { error } = await supabase
        .from('portfolio_links')
        .delete()
        .eq('id', id)
        .eq('criado_por', user.id);

      if (error) throw error;

      setActiveLink((prev) => (prev && prev.id === id ? null : prev));
      toast.success('Link do portfolio removido!');
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao excluir link do portfolio:', err);
      setError(err.message);
      toast.error(`Erro ao excluir link: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    activeLink,
    loading,
    error,
    getPortfolioLink,
    createPortfolioLink,
    updatePortfolioLink,
    deletePortfolioLink,
  };
};