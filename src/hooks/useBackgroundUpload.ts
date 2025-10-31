import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface BackgroundUploadData {
  tipo_dispositivo: 'desktop' | 'mobile';
  posicao_x?: number;
  posicao_y?: number;
  zoom?: number;
  opacidade?: number;
  ativo?: boolean;
}

export interface BackgroundConfiguracao {
  id: string;
  tipo_dispositivo: 'desktop' | 'mobile';
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

export const useBackgroundUpload = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Validações conforme PRD
  const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
  const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

  const validarArquivo = (file: File): { valido: boolean; erro?: string } => {
    // Validar tipo
    if (!TIPOS_ACEITOS.includes(file.type)) {
      return {
        valido: false,
        erro: `Tipo de arquivo não aceito. Use apenas: ${TIPOS_ACEITOS.join(', ')}`
      };
    }

    // Validar tamanho
    if (file.size > TAMANHO_MAXIMO) {
      return {
        valido: false,
        erro: `Arquivo muito grande. Tamanho máximo: 5MB`
      };
    }

    return { valido: true };
  };

  const gerarCaminhoSeguro = (userId: string, file: File): string => {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extensao = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Padrão seguro conforme PRD: imagens/backgrounds/{user_id}/{timestamp}_{uuid}.{ext}
    return `imagens/backgrounds/${userId}/${timestamp}_${uuid}.${extensao}`;
  };

  const uploadImagem = async (
    file: File, 
    dados: BackgroundUploadData
  ): Promise<{ success: boolean; data?: BackgroundConfiguracao; error?: string }> => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validar arquivo
      const validacao = validarArquivo(file);
      if (!validacao.valido) {
        setError(validacao.erro || 'Arquivo inválido');
        return { success: false, error: validacao.erro };
      }

      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Gerar caminho seguro
      const caminhoArquivo = gerarCaminhoSeguro(user.id, file);

      // Upload para o bucket "imagem-background"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imagem-background')
        .upload(caminhoArquivo, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        setError(`Erro no upload: ${uploadError.message}`);
        return { success: false, error: uploadError.message };
      }

      setUploadProgress(50);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('imagem-background')
        .getPublicUrl(caminhoArquivo);

      if (!urlData.publicUrl) {
        setError('Erro ao obter URL da imagem');
        return { success: false, error: 'Erro ao obter URL da imagem' };
      }

      setUploadProgress(75);

      // Verificar se já existe configuração para este tipo de dispositivo
      const { data: existingConfig } = await supabase
        .from('background_configuracoes')
        .select('*')
        .eq('tipo_dispositivo', dados.tipo_dispositivo)
        .eq('criado_por', user.id)
        .single();

      let resultado;

      if (existingConfig) {
        // Atualizar configuração existente
        const { data: updateData, error: updateError } = await supabase
          .from('background_configuracoes')
          .update({
            url_imagem: urlData.publicUrl,
            posicao_x: dados.posicao_x || 50,
            posicao_y: dados.posicao_y || 50,
            zoom: dados.zoom || 100,
            opacidade: dados.opacidade || 1.0,
            ativo: dados.ativo !== undefined ? dados.ativo : true,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erro ao atualizar configuração:', updateError);
          // Rollback: deletar arquivo recém enviado
          await supabase.storage.from('imagem-background').remove([caminhoArquivo]);
          setError(`Erro ao salvar configuração: ${updateError.message}`);
          return { success: false, error: updateError.message };
        }

        resultado = updateData;
      } else {
        // Criar nova configuração
        const { data: insertData, error: insertError } = await supabase
          .from('background_configuracoes')
          .insert({
            tipo_dispositivo: dados.tipo_dispositivo,
            url_imagem: urlData.publicUrl,
            posicao_x: dados.posicao_x || 50,
            posicao_y: dados.posicao_y || 50,
            zoom: dados.zoom || 100,
            opacidade: dados.opacidade || 1.0,
            ativo: dados.ativo !== undefined ? dados.ativo : true,
            criado_por: user.id
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao inserir configuração:', insertError);
          // Rollback: deletar arquivo recém enviado
          await supabase.storage.from('imagem-background').remove([caminhoArquivo]);
          setError(`Erro ao salvar configuração: ${insertError.message}`);
          return { success: false, error: insertError.message };
        }

        resultado = insertData;
      }

      setUploadProgress(100);
      return { success: true, data: resultado };

    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset progress after 2s com cleanup
      timeoutRef.current = setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const buscarConfiguracoes = async (): Promise<{ 
    success: boolean; 
    data?: BackgroundConfiguracao[]; 
    error?: string 
  }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('background_configuracoes')
        .select('*')
        .eq('criado_por', user.id)
        .order('atualizado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro inesperado ao buscar configurações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      return { success: false, error: errorMessage };
    }
  };

  const excluirConfiguracao = async (id: string): Promise<{ 
    success: boolean; 
    error?: string 
  }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar configuração para obter URL da imagem
      const { data: config, error: fetchError } = await supabase
        .from('background_configuracoes')
        .select('url_imagem')
        .eq('id', id)
        .eq('criado_por', user.id)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Extrair caminho do arquivo da URL
      const url = new URL(config.url_imagem);
      const caminhoArquivo = url.pathname.split('/storage/v1/object/public/Imagem%20Background/')[1];

      // Deletar registro do banco
      const { error: deleteError } = await supabase
        .from('background_configuracoes')
        .delete()
        .eq('id', id)
        .eq('criado_por', user.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Deletar arquivo do storage
      if (caminhoArquivo) {
        await supabase.storage
          .from('imagem-background')
          .remove([decodeURIComponent(caminhoArquivo)]);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao excluir configuração:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      return { success: false, error: errorMessage };
    }
  };

  return {
    uploadImagem,
    buscarConfiguracoes,
    excluirConfiguracao,
    loading,
    uploadProgress,
    error,
    TIPOS_ACEITOS,
    TAMANHO_MAXIMO
  };
};