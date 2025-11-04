import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supabase configuration
const SUPABASE_URL = "https://oowclaofuhcfdqcjmvmr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2NsYW9mdWhjZmRxY2ptdm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mzk3NjAsImV4cCI6MjA3MjMxNTc2MH0.9ETMv1iaN7LEcJOHuS26cLpp1cEO4w7BM0bPEoGugvQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface ContentItem {
  name: string;
  path: string;
  type: string;
  size?: number;
  sha?: string;
  url?: string;
  html_url?: string;
  git_url?: string;
  download_url?: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const contents: ContentItem[] = [];
    
    // Get all published races (corridas)
    const { data: corridas, error: corridasError } = await supabase
      .from('corridas')
      .select('id, titulo, data_evento, local, descricao, imagem_principal, link_externo, criado_em')
      .eq('publicado', true)
      .order('data_evento', { ascending: false });

    if (corridasError) {
      console.error('Error fetching corridas:', corridasError);
    } else if (corridas) {
      corridas.forEach((corrida) => {
        contents.push({
          name: corrida.titulo,
          path: `corridas/${corrida.id}`,
          type: 'race',
          size: JSON.stringify(corrida).length,
          sha: corrida.id,
          url: `${req.headers.host || ''}/api/contents/corridas/${corrida.id}`,
          html_url: `${req.headers.origin || ''}/corridas/${corrida.id}`,
          git_url: null,
          download_url: corrida.imagem_principal,
        });
      });
    }

    // Get all categories (categorias)
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('id, nome, descricao, cor_hex, ativo')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (categoriasError) {
      console.error('Error fetching categorias:', categoriasError);
    } else if (categorias) {
      categorias.forEach((categoria) => {
        contents.push({
          name: categoria.nome,
          path: `categorias/${categoria.id}`,
          type: 'category',
          size: JSON.stringify(categoria).length,
          sha: categoria.id,
          url: `${req.headers.host || ''}/api/contents/categorias/${categoria.id}`,
          html_url: `${req.headers.origin || ''}/categorias/${categoria.id}`,
          git_url: null,
          download_url: null,
        });
      });
    }

    // Get all events (eventos)
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .eq('publicado', true)
      .order('data_evento', { ascending: false });

    if (eventosError) {
      console.error('Error fetching eventos:', eventosError);
    } else if (eventos) {
      eventos.forEach((evento) => {
        contents.push({
          name: evento.nome || evento.titulo || 'Evento',
          path: `eventos/${evento.id}`,
          type: 'event',
          size: JSON.stringify(evento).length,
          sha: evento.id,
          url: `${req.headers.host || ''}/api/contents/eventos/${evento.id}`,
          html_url: `${req.headers.origin || ''}/eventos/${evento.id}`,
          git_url: null,
          download_url: null,
        });
      });
    }

    // Return the contents in GitHub API format
    return res.status(200).json(contents);
  } catch (error) {
    console.error('Error in contents API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
