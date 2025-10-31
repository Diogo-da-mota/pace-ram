import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';

export interface BackgroundConfig {
  id: string;
  tipo_dispositivo: 'desktop' | 'mobile' | 'tablet';
  url_imagem: string;
  posicao_x: number;
  posicao_y: number;
  zoom: number;
  opacidade: number;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

export interface NovaBackgroundConfig {
  tipo_dispositivo: 'desktop' | 'mobile' | 'tablet';
  url_imagem: string;
  posicao_x?: number;
  posicao_y?: number;
  zoom?: number;
  opacidade?: number;
  ativo?: boolean;
}

export interface UploadBackgroundData {
  file: File;
  tipo_dispositivo: 'desktop' | 'mobile' | 'tablet';
  posicao_x?: number;
  posicao_y?: number;
  zoom?: number;
  opacidade?: number;
  ativo?: boolean;
}

export const useBackgroundConfig = () => {
  const [configs, setConfigs] = useState<BackgroundConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthSession();

  const buscarConfigs = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('background_configuracoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const buscarConfigPorTipo = useCallback(async (tipo: 'desktop' | 'mobile' | 'tablet') => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('background_configuracoes')
        .select('*')
        .eq('tipo_dispositivo', tipo)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração por tipo:', error);
      throw error;
    }
  }, [user]);

  const uploadImagem = useCallback(async (uploadData: UploadBackgroundData): Promise<BackgroundConfig> => {
    if (!user) throw new Error('Usuário não autenticado');

    setUploading(true);
    try {
      // Validar arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(uploadData.file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (uploadData.file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const uuid = crypto.randomUUID();
      const extension = uploadData.file.name.split('.').pop();
      const fileName = `${timestamp}_${uuid}.${extension}`;
      const filePath = `imagens/backgrounds/${user.id}/${fileName}`;

      // Upload para o Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('imagem-background')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('imagem-background')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) throw new Error('Erro ao obter URL da imagem');

      // Desativar configuração anterior do mesmo tipo (se existir)
      await supabase
        .from('background_configuracoes')
        .update({ ativo: false })
        .eq('tipo_dispositivo', uploadData.tipo_dispositivo)
        .eq('criado_por', user.id);

      // Salvar configuração no banco
      const configData: NovaBackgroundConfig = {
        tipo_dispositivo: uploadData.tipo_dispositivo,
        url_imagem: urlData.publicUrl,
        posicao_x: uploadData.posicao_x ?? 50,
        posicao_y: uploadData.posicao_y ?? 50,
        zoom: uploadData.zoom ?? 1.0,
        opacidade: uploadData.opacidade ?? 1.0,
        ativo: uploadData.ativo ?? true
      };

      const { data: configResult, error: configError } = await supabase
        .from('background_configuracoes')
        .insert([{
          ...configData,
          criado_por: user.id
        }])
        .select()
        .single();

      if (configError) {
        // Rollback: deletar arquivo se falhou ao salvar no banco
        await supabase.storage
          .from('imagem-background')
          .remove([filePath]);
        throw configError;
      }

      return configResult;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [user]);

  const atualizarConfig = useCallback(async (id: string, updates: Partial<NovaBackgroundConfig>): Promise<BackgroundConfig> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('background_configuracoes')
        .update(updates)
        .eq('id', id)
        .eq('criado_por', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }, [user]);

  const removerConfig = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Buscar configuração para obter URL da imagem
      const { data: config, error: fetchError } = await supabase
        .from('background_configuracoes')
        .select('url_imagem')
        .eq('id', id)
        .eq('criado_por', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Extrair caminho do arquivo da URL
      const url = new URL(config.url_imagem);
      const filePath = url.pathname.split('/storage/v1/object/public/imagem-background/')[1];

      // Deletar do banco
      const { error: deleteError } = await supabase
        .from('background_configuracoes')
        .delete()
        .eq('id', id)
        .eq('criado_por', user.id);

      if (deleteError) throw deleteError;

      // Deletar arquivo do Storage
      if (filePath) {
        await supabase.storage
          .from('imagem-background')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Erro ao remover configuração:', error);
      throw error;
    }
  }, [user]);

  const buscarConfigsPublicas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('background_configuracoes')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      throw error;
    }
  }, []);

  return {
    configs,
    loading,
    uploading,
    buscarConfigs,
    buscarConfigPorTipo,
    buscarConfigsPublicas,
    uploadImagem,
    atualizarConfig,
    removerConfig
  };
};