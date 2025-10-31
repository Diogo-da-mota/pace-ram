import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundPublico {
  id: string;
  tipo_dispositivo: 'desktop' | 'mobile';
  url_imagem: string;
  posicao_x: number;
  posicao_y: number;
  zoom: number;
  opacidade: number;
}

interface CachedBackgroundData {
  desktop: BackgroundPublico | null;
  mobile: BackgroundPublico | null;
  timestamp: number;
}

const CACHE_KEY = 'background-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedData = (): CachedBackgroundData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedBackgroundData = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Erro ao ler cache de background:', error);
  }
  return null;
};

const setCachedData = (desktop: BackgroundPublico | null, mobile: BackgroundPublico | null) => {
  try {
    const cacheData: CachedBackgroundData = {
      desktop,
      mobile,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Erro ao salvar cache de background:', error);
  }
};

export const useBackgroundPublico = () => {
  const [backgroundDesktop, setBackgroundDesktop] = useState<BackgroundPublico | null>(null);
  const [backgroundMobile, setBackgroundMobile] = useState<BackgroundPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchBackgrounds = async (forceRefresh = false) => {
    try {
      // Se não é refresh forçado e já buscou, não buscar novamente
      if (!forceRefresh && hasFetched.current) {
        return;
      }

      setLoading(true);
      setError(null);

      // Tentar usar cache primeiro
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setBackgroundDesktop(cachedData.desktop);
          setBackgroundMobile(cachedData.mobile);
          setLoading(false);
          hasFetched.current = true;
          return;
        }
      }

      const { data, error: fetchError } = await supabase
        .from('background_configuracoes')
        .select('*')
        .eq('ativo', true)
        .order('atualizado_em', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Separar backgrounds por tipo de dispositivo
      const desktop = data?.find(bg => bg.tipo_dispositivo === 'desktop') || null;
      const mobile = data?.find(bg => bg.tipo_dispositivo === 'mobile') || null;

      setBackgroundDesktop(desktop);
      setBackgroundMobile(mobile);
      
      // Salvar no cache
      setCachedData(desktop, mobile);
      hasFetched.current = true;
    } catch (err) {
      console.error('Erro ao buscar backgrounds:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  return {
    backgroundDesktop,
    backgroundMobile,
    loading,
    error,
    refetch: () => fetchBackgrounds(true)
  };
};