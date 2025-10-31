-- Expandir opções de ícones para redes sociais
ALTER TABLE public.redes_sociais 
DROP CONSTRAINT IF EXISTS redes_sociais_icone_check;

-- Adicionar novo constraint com mais opções de ícones
ALTER TABLE public.redes_sociais 
ADD CONSTRAINT redes_sociais_icone_check 
CHECK (icone IN (
    'instagram', 
    'whatsapp', 
    'facebook', 
    'twitter', 
    'linkedin', 
    'youtube', 
    'tiktok', 
    'discord', 
    'telegram', 
    'pinterest', 
    'snapchat',
    'link'
));