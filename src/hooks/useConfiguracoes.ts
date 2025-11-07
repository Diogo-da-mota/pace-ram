import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useConfiguracoes = () => {
  const [config, setConfig] = useState({
    whatsapp_numero: '',
    whatsapp_mensagem: 'Olá! Gostaria de mais informações sobre as corridas.',
    whatsapp_ativo: false
  });
  const [loading, setLoading] = useState(false);

  const buscarConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setConfig(data);
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const salvarConfig = async (novaConfig: typeof config) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('configuracoes')
        .upsert(novaConfig);

      if (error) throw error;
      
      setConfig(novaConfig);
      toast.success('Configurações salvas!');
    } catch (error: any) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarConfig();
  }, []);

  return { config, salvarConfig, loading };
};