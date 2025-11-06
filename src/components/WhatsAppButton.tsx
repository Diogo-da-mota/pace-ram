import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '@/integrations/supabase/client';

const WhatsAppButton = () => {
  console.log('WhatsAppButton componente carregado');
  const [config, setConfig] = useState({ whatsapp_numero: '', whatsapp_mensagem: '', whatsapp_ativo: false });

  useEffect(() => {
    const buscarConfig = async () => {
      console.log('Buscando configurações do WhatsApp...');
      try {
        const { data, error } = await supabase.from('configuracoes').select('*').single();
        console.log('Dados recebidos:', data);
        console.log('Erro ao buscar:', error);
        if (data) {
          setConfig(data);
        } else {
          // Configuração padrão para teste
          console.log('Usando configuração padrão de teste');
          setConfig({
            whatsapp_numero: '5511999999999',
            whatsapp_mensagem: 'Olá! Gostaria de mais informações.',
            whatsapp_ativo: true
          });
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
        // Configuração padrão para teste em caso de erro
        setConfig({
          whatsapp_numero: '5511999999999',
          whatsapp_mensagem: 'Olá! Gostaria de mais informações.',
          whatsapp_ativo: true
        });
      }
    };
    buscarConfig();
  }, []);

  if (!config.whatsapp_ativo || !config.whatsapp_numero) return null;

  const handleClick = () => {
    const raw = config.whatsapp_numero.replace(/\D/g, '');
    const numero = raw.length === 11 ? `55${raw}` : raw;
    const mensagem = encodeURIComponent(config.whatsapp_mensagem);
    window.open(`https://wa.me/${numero}?text=${mensagem}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition-all hover:scale-110"
      aria-label="Falar no WhatsApp"
    >
      <FaWhatsapp size={32} />
    </button>
  );
};

export default WhatsAppButton;