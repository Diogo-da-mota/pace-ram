import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://oowclaofuhcfdqcjmvmr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2NsYW9mdWhjZmRxY2ptdm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mzk3NjAsImV4cCI6MjA3MjMxNTc2MH0.9ETMv1iaN7LEcJOHuS26cLpp1cEO4w7BM0bPEoGugvQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface ContentItem {
  name: string;
  path: string;
  type: string;
  size?: number;
  resource_id?: string;
  url?: string;
  html_url?: string;
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
    
    // Get base URL for constructing URLs
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const baseUrl = `${protocol}://${host}`;
    
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
          resource_id: corrida.id,
          url: `${baseUrl}/api/contents/corridas/${corrida.id}`,
          html_url: `${baseUrl}/corridas/${corrida.id}`,
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
          resource_id: categoria.id,
          url: `${baseUrl}/api/contents/categorias/${categoria.id}`,
          html_url: `${baseUrl}/categorias/${categoria.id}`,
          download_url: null,
        });
      });
    }

    // Get all events (eventos)
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('id, nome, titulo, data_evento, criado_em')
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
          resource_id: evento.id,
          url: `${baseUrl}/api/contents/eventos/${evento.id}`,
          html_url: `${baseUrl}/eventos/${evento.id}`,
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
