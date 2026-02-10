-- Adiciona campo JSONB para armazenar metadados Open Graph do link
-- Permite cache server-side dos dados de preview
ALTER TABLE public.portfolio_links
ADD COLUMN IF NOT EXISTS og_data JSONB DEFAULT NULL;

COMMENT ON COLUMN public.portfolio_links.og_data IS
  'Cache dos metadados Open Graph (title, description, image, favicon, siteName)';
