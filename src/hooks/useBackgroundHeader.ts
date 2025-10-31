import { supabase } from '@/integrations/supabase/client';

export interface BackgroundHeaderParams {
  device_type: 'desktop' | 'mobile' | 'tablet';
  user_id?: string;
  prefer_private?: boolean;
}

export interface BackgroundHeaderData {
  id: string;
  tipo_dispositivo: string;
  url: string;
  posicao_x: number;
  posicao_y: number;
  zoom: number;
  opacidade: number;
  criado_por: string;
  criado_em: string;
}

export interface BackgroundHeaderResponse {
  status: 'ok' | 'error';
  message: string;
  data: BackgroundHeaderData | null;
}

/**
 * Busca imagem de background ativa para exibir no header do site
 * Segue regras estritas de seleção, validação e segurança
 */
export const useBackgroundHeader = () => {
  
  /**
   * Valida se uma URL é válida (http/https ou path do storage)
   */
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Verificar se é URL completa (http/https)
    try {
      new URL(url);
      return true;
    } catch {
      // Verificar se é path válido do storage (ex: imagens/backgrounds/...)
      return url.includes('/') && !url.startsWith('/') && url.length > 0;
    }
  };

  /**
   * Verifica se a URL responde com status 200
   */
  const validateUrlAccessibility = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.status === 200;
    } catch {
      return false;
    }
  };

  /**
   * Gera signed URL para imagens privadas
   */
  const generateSignedUrl = async (imagePath: string): Promise<string | null> => {
    try {
      // Detectar se é path relativo (imagem privada)
      if (!imagePath.startsWith('http')) {
        const { data, error } = await supabase.storage
          .from('imagem-background')
          .createSignedUrl(imagePath, 3600); // TTL de 3600 segundos

        if (error) {
          console.error('Erro ao gerar signed URL:', error);
          return null;
        }

        return data?.signedUrl || null;
      }
      
      return imagePath; // Já é URL pública
    } catch (error) {
      console.error('Erro ao gerar signed URL:', error);
      return null;
    }
  };

  /**
   * Busca background ativo conforme especificações
   */
  const fetchActiveBackground = async (params: BackgroundHeaderParams): Promise<BackgroundHeaderResponse> => {
    const { device_type, user_id, prefer_private = false } = params;

    try {
      // Log interno da ação (sem expor secrets)
      // console.log(`[BackgroundHeader] Buscando background para ${device_type}, user_id: ${user_id || 'público'}, prefer_private: ${prefer_private}`); // Removido log de debug

      // Query base
      let query = supabase
        .from('background_configuracoes')
        .select('*')
        .eq('ativo', true)
        .eq('tipo_dispositivo', device_type);

      // Se user_id fornecido, priorizar imagens do usuário
      if (user_id) {
        const { data: userBackgrounds, error: userError } = await query
          .eq('criado_por', user_id)
          .order('atualizado_em', { ascending: false })
          .order('criado_em', { ascending: false })
          .limit(1);

        if (userError) {
          console.error('Erro ao buscar backgrounds do usuário:', userError);
        }

        // Se encontrou background do usuário, usar ele
        if (userBackgrounds && userBackgrounds.length > 0) {
          const background = userBackgrounds[0];
          return await processBackground(background, prefer_private);
        }
      }

      // Buscar qualquer background ativo para o device_type
      const { data: publicBackgrounds, error: publicError } = await query
        .order('atualizado_em', { ascending: false })
        .order('criado_em', { ascending: false })
        .limit(1);

      if (publicError) {
        console.error('Erro ao buscar backgrounds públicos:', publicError);
        return {
          status: 'error',
          message: `Erro ao buscar imagens: ${publicError.message}`,
          data: null
        };
      }

      if (!publicBackgrounds || publicBackgrounds.length === 0) {
        return {
          status: 'error',
          message: `Nenhuma imagem ativa encontrada para ${device_type}`,
          data: null
        };
      }

      const background = publicBackgrounds[0];
      return await processBackground(background, prefer_private);

    } catch (error) {
      console.error('Erro inesperado ao buscar background:', error);
      return {
        status: 'error',
        message: 'Erro interno do sistema',
        data: null
      };
    }
  };

  /**
   * Processa o background encontrado com validações e geração de URL
   */
  const processBackground = async (background: any, prefer_private: boolean): Promise<BackgroundHeaderResponse> => {
    try {
      // Validar que url_imagem não é nulo e tem formato válido
      if (!isValidUrl(background.url_imagem)) {
        return {
          status: 'error',
          message: `URL inválida: ${background.url_imagem}`,
          data: null
        };
      }

      let finalUrl = background.url_imagem;

      // Se prefer_private = true e é path relativo, gerar signed URL
      if (prefer_private && !background.url_imagem.startsWith('http')) {
        const signedUrl = await generateSignedUrl(background.url_imagem);
        if (!signedUrl) {
          return {
            status: 'error',
            message: 'Erro ao gerar URL assinada',
            data: null
          };
        }
        finalUrl = signedUrl;
      }

      // Verificar se a URL final responde com status 200
      const isAccessible = await validateUrlAccessibility(finalUrl);
      if (!isAccessible) {
        return {
          status: 'error',
          message: `URL inválida ou inacessível: ${background.url_imagem}`,
          data: null
        };
      }

      // Log interno da ação bem-sucedida
      // console.log(`[BackgroundHeader] Background encontrado: ${background.id}, URL gerada: ${prefer_private ? 'signed' : 'public'}`); // Removido log de debug

      // Retornar dados conforme especificação
      return {
        status: 'ok',
        message: 'Imagem encontrada',
        data: {
          id: background.id,
          tipo_dispositivo: background.tipo_dispositivo,
          url: finalUrl,
          posicao_x: background.posicao_x,
          posicao_y: background.posicao_y,
          zoom: background.zoom,
          opacidade: background.opacidade,
          criado_por: background.criado_por,
          criado_em: background.criado_em
        }
      };

    } catch (error) {
      console.error('Erro ao processar background:', error);
      return {
        status: 'error',
        message: 'Erro ao processar imagem',
        data: null
      };
    }
  };

  return {
    fetchActiveBackground
  };
};