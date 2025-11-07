
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCorridas, NovaCorridaData, CorridaData } from "@/hooks/useCorridas";
import { useCalendario, NovoEventoData, EventoData } from "@/hooks/useCalendario";
import { useRedesSociais, NovaRedeSocialData, RedeSocialData } from "@/hooks/useRedesSociais";
import { useOutros, NovoOutroData, OutroData } from "@/hooks/useOutros";
import { useUrlPreview } from "@/hooks/useUrlPreview";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import RacePreview from "@/components/RacePreview";

import CorridaCard from "@/components/CorridaCard";
import EditCorridaModal from "@/components/EditCorridaModal";
import EventoCardDashboard from "@/components/EventoCardDashboard";
import EditEventoModal from "@/components/EditEventoModal";
import RedeSocialCard from "@/components/RedeSocialCard";
import EditRedeSocialModal from "@/components/EditRedeSocialModal";
import OutroCard from "@/components/OutroCard";
import EditOutroModal from "@/components/EditOutroModal";
import { ExternalLinkForm } from "@/components/admin/ExternalLinkForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube, 
  FaTiktok, 
  FaDiscord, 
  FaTelegram, 
  FaPinterest, 
  FaSnapchat 
} from 'react-icons/fa';
import { ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { session, signOut } = useAuthSession();
  const isMobile = useIsMobile();

  // Opções de distância para eventos
  const distanciaOptions: MultiSelectOption[] = [
    { value: 'caminhada', label: 'Caminhada' },
    { value: '3k', label: '3K' },
    { value: '5k', label: '5K' },
    { value: '6k', label: '6K' },
    { value: '7k', label: '7K' },
    { value: '8k', label: '8K' },
    { value: '10k', label: '10K' },
    { value: '15k', label: '15K' },
    { value: '21k', label: '21K (Meia Maratona)' },
    { value: '42k', label: '42K (Maratona)' }
  ];
  const location = useLocation();
  const activeTab = location.pathname.replace('/dashboard-', '') || 'corridas';
  const { loading: loadingCorrida, criarCorrida, editarCorrida, excluirCorrida, buscarCorridas, toggleVisibilidade, separarPorData } = useCorridas();
  const { loading: loadingEvento, criarEvento, editarEvento, excluirEvento, buscarEventos } = useCalendario();
  const { loading: loadingRedeSocial, criarRedeSocial, editarRedeSocial, excluirRedeSocial, buscarRedesSociais } = useRedesSociais();
  const { loading: loadingOutro, criarOutro, editarOutro, excluirOutro, buscarOutros } = useOutros();

  // Estados para o formulário de corridas
  const [corridaData, setCorridaData] = useState<NovaCorridaData>({
    titulo: '',
    data_evento: '',
    local: '',
    imagem_principal: '',
    link_externo: '',
    texto_rodape: '',
    descricao: ''
  });

  // Estado para controlar se o título foi editado manualmente
  const [tituloEditadoManualmente, setTituloEditadoManualmente] = useState(false);

  // Estados para listagem e edição de corridas
  const [corridas, setCorridas] = useState<CorridaData[]>([]);
  const [corridaEditando, setCorridaEditando] = useState<CorridaData | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [carregandoCorridas, setCarregandoCorridas] = useState(false);

  // Estados para listagem e edição de eventos
  const [eventos, setEventos] = useState<EventoData[]>([]);
  const [eventoEditando, setEventoEditando] = useState<EventoData | null>(null);
  const [modalEditarEventoAberto, setModalEditarEventoAberto] = useState(false);
  const [carregandoEventos, setCarregandoEventos] = useState(false);

  // Estados para redes sociais
  const [redeSocialData, setRedeSocialData] = useState<NovaRedeSocialData>({
    titulo: '',
    link: '',
    icone: 'link',
    titulo_secao: ''
  });
  const [redesSociais, setRedesSociais] = useState<RedeSocialData[]>([]);
  const [redeSocialEditando, setRedeSocialEditando] = useState<RedeSocialData | null>(null);
  const [modalEditarRedeSocialAberto, setModalEditarRedeSocialAberto] = useState(false);
  const [carregandoRedesSociais, setCarregandoRedesSociais] = useState(false);

  // Estados para outros conteúdos
  const [outroData, setOutroData] = useState<NovoOutroData>({
    titulo: '',
    link_externo: ''
  });
  const [outros, setOutros] = useState<OutroData[]>([]);
  const [outroEditando, setOutroEditando] = useState<OutroData | null>(null);
  const [modalEditarOutroAberto, setModalEditarOutroAberto] = useState(false);
  const [carregandoOutros, setCarregandoOutros] = useState(false);

  // Estados para configurações
  const { config: configFromHook, salvarConfig, loading: loadingConfig } = useConfiguracoes();
  const [configData, setConfigData] = useState({
    whatsapp_numero: '',
    whatsapp_mensagem: 'Olá! Gostaria de mais informações sobre as corridas.',
    whatsapp_ativo: false
  });

  // Atualizar configData quando os dados do hook mudarem
  useEffect(() => {
    if (configFromHook) {
      setConfigData(configFromHook);
    }
  }, [configFromHook]);

  const handleSalvarConfig = async () => {
    await salvarConfig(configData);
  };

  // Hook para preview de URL
  const { metadata: urlMetadata, loading: urlLoading, error: urlError } = useUrlPreview(corridaData.link_externo);

  // Verificação de autenticação agora é feita pelo ProtectedRoute

  // Redirecionar para aba válida quando em mobile e aba background estiver ativa
  useEffect(() => {
    if (isMobile && activeTab === "background") {
      navigate("/dashboard-corridas");
    }
  }, [isMobile, activeTab, navigate]);

  // Carregar corridas, eventos, redes sociais e outros conteúdos ao montar o componente
  useEffect(() => {
    carregarCorridas();
    carregarEventos();
    carregarRedesSociais();
    carregarOutros();
  }, []);

  const carregarCorridas = async () => {
    setCarregandoCorridas(true);
    try {
      const resultado = await buscarCorridas();
      if (resultado.success) {
        setCorridas(resultado.data || []);
      } else {
        console.error('Erro ao carregar corridas:', resultado.error);
        setCorridas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar corridas:', error);
      setCorridas([]);
    } finally {
      setCarregandoCorridas(false);
    }
  };

  const carregarEventos = async () => {
    setCarregandoEventos(true);
    try {
      const resultado = await buscarEventos();
      if (resultado.success) {
        // Ordenar eventos por data_evento em ordem crescente (mais antigo primeiro)
        const eventosOrdenados = (resultado.data || []).sort((a, b) => {
          const dataA = new Date(a.data_evento);
          const dataB = new Date(b.data_evento);
          return dataA.getTime() - dataB.getTime();
        });
        setEventos(eventosOrdenados);
      } else {
        console.error('Erro ao carregar eventos:', resultado.error);
        setEventos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEventos([]);
    } finally {
      setCarregandoEventos(false);
    }
  };

  const carregarRedesSociais = async () => {
    setCarregandoRedesSociais(true);
    try {
      const resultado = await buscarRedesSociais();
      
      if (resultado.success) {
        setRedesSociais(resultado.data || []);
      } else {
        console.error('❌ [Dashboard] Erro ao carregar redes sociais:', resultado.error);
        setRedesSociais([]);
      }
    } catch (error) {
      setRedesSociais([]);
    } finally {
      setCarregandoRedesSociais(false);
    }
  };

  const carregarOutros = async () => {
    setCarregandoOutros(true);
    try {
      const resultado = await buscarOutros();
      if (resultado.success) {
        setOutros(resultado.data || []);
      } else {
        console.error('Erro ao carregar outros conteúdos:', resultado.error);
        setOutros([]);
      }
    } catch (error) {
      console.error('Erro ao carregar outros conteúdos:', error);
      setOutros([]);
    } finally {
      setCarregandoOutros(false);
    }
  };

  // Auto-preencher campos com metadados da URL
  useEffect(() => {
    // Auto-preencher título apenas se não foi editado manualmente e está vazio
    if (urlMetadata && !tituloEditadoManualmente && !corridaData.titulo) {
      setCorridaData((prev) => ({
        ...prev,
        titulo: urlMetadata?.title || prev.titulo || '',
      }));
    }
    
    // Auto-preencher imagem se estiver vazia
    if (urlMetadata && !corridaData.imagem_principal && urlMetadata.image) {
      setCorridaData(prev => ({ ...prev, imagem_principal: urlMetadata.image }));
    }
  }, [urlMetadata, corridaData.titulo, corridaData.imagem_principal, tituloEditadoManualmente]);

  // Estados para o formulário de eventos
  const [eventoData, setEventoData] = useState<NovoEventoData>({
    titulo: '',
    data_evento: '',
    local: '',
    link_externo: '',
    status: 'Inscrições Abertas',
    distancia: [],
    horario: '',
    participantes: ''
  });

  const handleOutroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outroData.titulo) {
      return;
    }

    const resultado = await criarOutro(outroData);
    
    if (resultado.success) {
      setOutroData({
        titulo: '',
        link_externo: ''
      });
      carregarOutros();
    }
  };

  const handleEditarOutro = (outro: OutroData) => {
    setOutroEditando(outro);
    setModalEditarOutroAberto(true);
  };

  const handleSalvarEdicaoOutro = async (id: string, dados: NovoOutroData) => {
    const resultado = await editarOutro(id, dados);
    if (resultado.success) {
      setModalEditarOutroAberto(false);
      setOutroEditando(null);
      carregarOutros();
    }
  };

  const handleExcluirOutro = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      const resultado = await excluirOutro(id);
      if (resultado.success) {
        carregarOutros();
      }
    }
  };

  const handleRedeSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Formulário de rede social enviado:', redeSocialData); // Removido log de debug

    if (!redeSocialData.titulo || !redeSocialData.link) {
      // console.log('Campos obrigatórios não preenchidos'); // Removido log de debug
      return;
    }

    const resultado = await criarRedeSocial(redeSocialData);
    
    if (resultado.success) {
      // Limpar formulário
      setRedeSocialData({
        titulo: '',
        link: '',
        icone: 'link',
        titulo_secao: ''
      });
      
      // Recarregar lista de redes sociais
      carregarRedesSociais();
    }
  };

  const handleCorridaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Formulário de corrida enviado:', corridaData); // Removido log de debug

    if (!corridaData.titulo || !corridaData.data_evento || !corridaData.local) {
      // console.log('Campos obrigatórios não preenchidos'); // Removido log de debug
      return;
    }

    const resultado = await criarCorrida(corridaData);
    
    if (resultado.success) {
      // Limpar formulário
      setCorridaData({
        titulo: '',
        data_evento: '',
        local: '',
        imagem_principal: '',
        link_externo: '',
        texto_rodape: '',
        descricao: ''
      });
      // Resetar estado de edição manual
      setTituloEditadoManualmente(false);
      
      // Recarregar lista de corridas
      carregarCorridas();
    }
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Formulário de evento enviado:', eventoData); // Removido log de debug

    if (!eventoData.titulo || !eventoData.data_evento || !eventoData.local) {
      // console.log('Campos obrigatórios não preenchidos'); // Removido log de debug
      return;
    }

    const resultado = await criarEvento(eventoData);
    
    if (resultado.success) {
      // Limpar formulário
      setEventoData({
        titulo: '',
        data_evento: '',
        local: '',
        link_externo: '',
        status: 'Inscrições Abertas',
        distancia: [],
        horario: '',
        participantes: ''
      });
      
      // Recarregar lista de eventos
      carregarEventos();
    }
  };

  // Funções para gerenciar corridas
  const handleEditarCorrida = (corrida: CorridaData) => {
    setCorridaEditando(corrida);
    setModalEditarAberto(true);
  };
  
  const handleSalvarEdicao = async (id: string, dados: any) => {
    const resultado = await editarCorrida(id, dados);
    if (resultado.success) {
      setModalEditarAberto(false);
      setCorridaEditando(null);
      carregarCorridas();
    }
  };
  
  const handleExcluirCorrida = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta corrida?')) {
      const resultado = await excluirCorrida(id);
      if (resultado.success) {
        carregarCorridas();
      }
    }
  };

  const handleToggleVisibilidade = async (id: string) => {
    const resultado = await toggleVisibilidade(id);
    if (resultado.success) {
      carregarCorridas();
    }
  };

  // Funções para gerenciar eventos
  const handleEditarEvento = (eventoId: string) => {
    const eventoCompleto = eventos.find(evento => evento.id === eventoId);
    if (eventoCompleto) {
      setEventoEditando(eventoCompleto);
      setModalEditarEventoAberto(true);
    }
  };
  
  const handleSalvarEdicaoEvento = async (id: string, dados: any) => {
    const resultado = await editarEvento(id, dados);
    if (resultado.success) {
      setModalEditarEventoAberto(false);
      setEventoEditando(null);
      carregarEventos();
    }
  };
  
  const handleExcluirEvento = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      const resultado = await excluirEvento(id);
      if (resultado.success) {
        carregarEventos();
      }
    }
  };

  // Funções para gerenciar redes sociais
  const handleEditarRedeSocial = (redeSocial: RedeSocialData) => {
    setRedeSocialEditando(redeSocial);
    setModalEditarRedeSocialAberto(true);
  };
  
  const handleExcluirRedeSocial = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta rede social?')) {
      const resultado = await excluirRedeSocial(id);
      if (resultado.success) {
        carregarRedesSociais();
      }
    }
  };

  const getIconPreview = () => {
    switch (redeSocialData.icone) {
      case 'instagram':
        return <FaInstagram className="h-8 w-8 text-pink-500" />;
      case 'whatsapp':
        return <FaWhatsapp className="h-8 w-8 text-green-500" />;
      case 'facebook':
        return <FaFacebook className="h-8 w-8 text-blue-600" />;
      case 'twitter':
        return <FaTwitter className="h-8 w-8 text-blue-400" />;
      case 'linkedin':
        return <FaLinkedin className="h-8 w-8 text-blue-700" />;
      case 'youtube':
        return <FaYoutube className="h-8 w-8 text-red-600" />;
      case 'tiktok':
        return <FaTiktok className="h-8 w-8 text-black" />;
      case 'discord':
        return <FaDiscord className="h-8 w-8 text-indigo-500" />;
      case 'telegram':
        return <FaTelegram className="h-8 w-8 text-blue-500" />;
      case 'pinterest':
        return <FaPinterest className="h-8 w-8 text-red-500" />;
      case 'snapchat':
        return <FaSnapchat className="h-8 w-8 text-yellow-400" />;
      case 'link':
      default:
        return <ExternalLink className="h-8 w-8 text-blue-500" />;
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="w-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/0677547b-3e24-403f-9162-45f6deb0cf93.png" 
              alt="PACE RAM Logo" 
              className="h-8 w-auto"
            />
            
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
              <a href="/" target="_blank" rel="noopener noreferrer">Ver Site</a>
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 p-6">
        <Tabs value={activeTab} className="space-y-6">
          {/* Navegação - Mobile (duas linhas): 3 + 3 */}
          <div className="md:hidden space-y-2 mb-6 max-w-4xl mx-auto">
            {/* Primeira linha: Corridas, Calendário, Outros */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/dashboard-corridas"
                className={`${activeTab === 'corridas' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}
              >
                Corridas
              </Link>
              <Link
                to="/dashboard-calendario"
                className={`${activeTab === 'calendario' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}
              >
                Calendário
              </Link>
              <Link
                to="/dashboard-outros"
                className={`${activeTab === 'outros' ? 'active' : ''} w-full text-center py-2 px-2 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}
              >
                Outros
              </Link>
            </div>

            {/* Segunda linha: Redes Sociais, Portfolio, Configurações */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/dashboard-redes-sociais"
                className={`${activeTab === 'redes-sociais' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}
              >
                Redes Sociais
              </Link>
              <Link
                to="/dashboard-portfolio"
                className={`${activeTab === 'portfolio' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}
              >
                Portfolio
              </Link>
              <Link
                to="/dashboard-configuracoes"
                className={`${activeTab === 'configuracoes' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-wite shadow-sm`}
              >
                Configurações
              </Link>
            </div>
          </div>

          {/* Navegação - Desktop (linha única com 6 colunas) */}
          <div className="hidden md:grid w-full grid-cols-6 gap-2 mb-6 max-w-4xl mx-auto">
            <Link to="/dashboard-corridas" className={`${activeTab === 'corridas' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Corridas</Link>
            <Link to="/dashboard-calendario" className={`${activeTab === 'calendario' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Calendário</Link>
            <Link to="/dashboard-redes-sociais" className={`${activeTab === 'redes-sociais' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Redes Sociais</Link>
            <Link to="/dashboard-outros" className={`${activeTab === 'outros' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Outros</Link>
            <Link to="/dashboard-portfolio" className={`${activeTab === 'portfolio' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Portfolio</Link>
            <Link to="/dashboard-configuracoes" className={`${activeTab === 'configuracoes' ? 'active' : ''} w-full text-center py-2 px-3 rounded-md border border-border bg-black text-foreground hover:bg-black shadow-sm`}>Configurações</Link>
          </div>

          <TabsContent value="corridas" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Formulário */}
              <Card className="p-6 bg-card shadow-lg border border-border lg:col-span-3">
                <h2 className="text-2xl font-bold text-foreground mb-6">Adicionar Nova Corrida</h2>
                
                <form onSubmit={handleCorridaSubmit} className="space-y-6">
                  {/* Primeira linha: Nome do Evento, Data, Local */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Nome do Evento - 6 colunas */}
                    <div className="space-y-2 md:col-span-6">
                      <Label htmlFor="event-name" className="text-foreground font-medium text-xs">
                        Nome do Evento *
                      </Label>
                      <Input
                        id="event-name"
                        placeholder="Ex: Maratona de São Paulo 2024"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.titulo}
                        onChange={(e) => {
                          setCorridaData({...corridaData, titulo: e.target.value});
                          setTituloEditadoManualmente(true);
                        }}
                        required
                      />
                      {!tituloEditadoManualmente && corridaData.titulo && urlMetadata?.title === corridaData.titulo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ✨ Título preenchido automaticamente do link
                        </p>
                      )}
                      {tituloEditadoManualmente && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✏️ Título editado manualmente
                        </p>
                      )}
                    </div>

                    {/* Data - 2 colunas */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="event-date" className="text-foreground font-medium text-xs">
                        Data *
                      </Label>
                      <Input
                        id="event-date"
                        type="date"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.data_evento}
                        onChange={(e) => setCorridaData({...corridaData, data_evento: e.target.value})}
                        required
                      />
                    </div>

                    {/* Local - 4 colunas */}
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="event-location" className="text-foreground font-medium text-xs">
                        Local *
                      </Label>
                      <Input
                        id="event-location"
                        placeholder="Ex: São Paulo, SP"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.local}
                        onChange={(e) => setCorridaData({...corridaData, local: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Segunda linha: Link do Evento, URL da Imagem, Texto do Rodapé */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Link do Evento - 4 colunas */}
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="event-link" className="text-foreground font-medium text-xs">
                        Link do Evento
                      </Label>
                      <Input
                        id="event-link"
                        type="url"
                        placeholder="https://..."
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.link_externo}
                        onChange={(e) => setCorridaData({...corridaData, link_externo: e.target.value})}
                      />
                      {urlError && (
                        <p className="text-xs text-destructive mt-1">{urlError}</p>
                      )}
                    </div>

                    {/* URL da Imagem - 4 colunas */}
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="event-image" className="text-foreground font-medium text-xs">
                        URL da Imagem
                      </Label>
                      <Input
                        id="event-image"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.imagem_principal}
                        onChange={(e) => setCorridaData({...corridaData, imagem_principal: e.target.value})}
                      />
                      {urlLoading && corridaData.link_externo && (
                        <p className="text-xs text-muted-foreground mt-1">🔍 Buscando imagem automaticamente...</p>
                      )}
                    </div>

                    {/* Texto do Rodapé - 4 colunas */}
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="footer-text" className="text-foreground font-medium text-xs">
                        Texto do Rodapé
                      </Label>
                      <Input
                        id="footer-text"
                        placeholder="Ex: Compre as suas fotos"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                        value={corridaData.texto_rodape}
                        onChange={(e) => setCorridaData({...corridaData, texto_rodape: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-button shadow-card hover:shadow-hover"
                    disabled={loadingCorrida}
                  >
                    {loadingCorrida ? 'Salvando...' : 'Adicionar Corrida'}
                  </Button>
                </form>
              </Card>

              {/* Preview */}
              <Card className="p-4 bg-card shadow-lg border border-border lg:col-span-2">
                <RacePreview
                  title={corridaData.titulo}
                  date={corridaData.data_evento}
                  location={corridaData.local}
                  image={corridaData.imagem_principal}
                  footerText={corridaData.texto_rodape}
                  link={corridaData.link_externo}
                  loading={urlLoading}
                  error={urlError}
                  showPlaceholder={true}
                />
              </Card>
            </div>
            
            {/* Seção de Corridas Criadas */}
            {/* Aplicar separação por data */}
            {(() => {
              const { recentes, emBreve } = separarPorData(corridas);
              
              return (
                <>
                  {/* Seção Corridas Recentes */}
                  <Card className="p-6 bg-card shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Corridas Recentes</h2>
                    <p className="text-muted-foreground mb-6">
                      Corridas que já aconteceram
                    </p>
                    
                    {carregandoCorridas ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-muted-foreground">Carregando...</div>
                      </div>
                    ) : recentes.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">Nenhuma corrida recente</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recentes.map((corrida) => (
                          <CorridaCard 
                            key={corrida.id} 
                            corrida={corrida} 
                            onEdit={handleEditarCorrida} 
                            onDelete={handleExcluirCorrida} 
                            onToggleVisibilidade={handleToggleVisibilidade} 
                          /> 
                        ))}
                      </div>
                    )}
                  </Card>
      
                  {/* Seção Corridas Em Breve */}
                  <Card className="p-6 bg-card shadow-lg border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">⏰ Corridas Em Breve</h2>
                    <p className="text-muted-foreground mb-6">
                      Corridas futuras
                    </p>
                    
                    {carregandoCorridas ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-muted-foreground">Carregando...</div>
                      </div>
                    ) : emBreve.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">Nenhuma corrida futura</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {emBreve.map((corrida) => (
                          <CorridaCard 
                            key={corrida.id} 
                            corrida={corrida} 
                            onEdit={handleEditarCorrida} 
                            onDelete={handleExcluirCorrida} 
                            onToggleVisibilidade={handleToggleVisibilidade} 
                          /> 
                        ))}
                      </div>
                    )}
                  </Card>
                </>
              );
            })()}

          </TabsContent>

          <TabsContent value="calendario" className="animate-fade-in">
            <Card className="p-6 bg-card shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Adicionar Evento ao Calendário</h2>
              
              <form onSubmit={handleEventoSubmit} className="space-y-6">
                {/* Linha única com todos os campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Data - 1.5 colunas (aumento de 20%) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calendar-date" className="text-foreground font-medium text-xs">
                      Data *
                    </Label>
                    <Input
                      id="calendar-date"
                      type="date"
                      lang="pt-BR"
                      className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={eventoData.data_evento}
                      onChange={(e) => setEventoData({...eventoData, data_evento: e.target.value})}
                      required
                    />
                  </div>

                  {/* Horário - 1 coluna (manter) */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="calendar-time" className="text-foreground font-medium text-xs">
                      Horário
                    </Label>
                    <Input
                      id="calendar-time"
                      type="time"
                      className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={eventoData.horario}
                      onChange={(e) => setEventoData({...eventoData, horario: e.target.value})}
                      placeholder="06:00"
                    />
                  </div>

                  {/* Nome do Evento - 6 colunas (receber espaço extra) */}
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="calendar-name" className="text-foreground font-medium text-xs">
                      Nome do Evento *
                    </Label>
                    <Input
                      id="calendar-name"
                      placeholder="Ex: Corrida da Primavera"
                      className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={eventoData.titulo}
                      onChange={(e) => setEventoData({...eventoData, titulo: e.target.value})}
                      required
                    />
                  </div>

                  {/* Local - 2 colunas (manter) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calendar-location" className="text-foreground font-medium text-xs">
                      Local *
                    </Label>
                    <Input
                        id="event-location"
                        placeholder="Ex: Parque Central"
                        className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={eventoData.local}
                      onChange={(e) => setEventoData({...eventoData, local: e.target.value})}
                      maxLength={20}
                      required
                    />
                  </div>

                  {/* Distância - 1 coluna (diminuir bastante) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calendar-distance" className="text-foreground font-medium text-xs">
                      Distância
                    </Label>
                    <MultiSelect
                      options={distanciaOptions}
                      value={eventoData.distancia || []}
                      onChange={(value) => setEventoData({...eventoData, distancia: value})}
                      placeholder="dist."
                      className="bg-input border-border text-xs"
                    />
                  </div>

                  {/* Quantidade de participantes - 1 coluna (ajustar ao texto) */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="calendar-participants" className="text-foreground font-medium text-xs">
                      participantes
                    </Label>
                    <Input
                      id="calendar-participants"
                      type="number"
                      min="0"
                      placeholder="100"
                      className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={eventoData.participantes}
                      onChange={(e) => setEventoData({...eventoData, participantes: e.target.value})}
                    />
                  </div>
                </div>

                {/* Linha horizontal com Link e Status */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="space-y-2 md:col-span-9">
                    <Label htmlFor="calendar-link" className="text-foreground font-medium">
                      Link
                    </Label>
                    <Input
                      id="calendar-link"
                      type="url"
                      placeholder="https://..."
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      value={eventoData.link_externo}
                      onChange={(e) => setEventoData({...eventoData, link_externo: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="calendar-status" className="text-foreground font-medium">
                      Status
                    </Label>
                    <Select 
                      value={eventoData.status} 
                      onValueChange={(value) => setEventoData({...eventoData, status: value})}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-card-foreground shadow-lg z-50">
                        <SelectItem className="hover:bg-muted focus:bg-muted" value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                        <SelectItem className="hover:bg-muted focus:bg-muted" value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem className="hover:bg-muted focus:bg-muted" value="Encerrado">Inscrições encerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-button shadow-card hover:shadow-hover"
                  disabled={loadingEvento}
                >
                  {loadingEvento ? 'Salvando...' : 'Adicionar ao Calendário'}
                </Button>
              </form>
            </Card>
            
            {/* Seção de Eventos Criados */}
            <Card className="p-6 bg-card shadow-card border border-border">
              <h2 className="text-2xl font-bold text-card-foreground mb-6">Eventos Criados</h2>
              <p className="text-muted-foreground mb-6">
                Gerencie seus eventos existentes - edite ou exclua conforme necessário
              </p>
              
              {carregandoEventos ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-muted-foreground">Carregando eventos...</div>
                </div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-lg mb-2">Nenhum evento criado ainda</div>
                  <div className="text-muted-foreground">Crie seu primeiro evento usando o formulário acima</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventos.map((evento, index) => (
                    <EventoCardDashboard
                      key={evento.id}
                      evento={{
                        ...evento,
                        status: evento.status as 'inscricoes_abertas' | 'em_andamento' | 'encerrado' | undefined
                      }}
                      onEdit={handleEditarEvento}
                      onDelete={handleExcluirEvento}
                      animationDelay={index * 0.1}
                      mobileCompactClosedLabel={isMobile}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="redes-sociais" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <Card className="p-6 bg-card shadow-card border border-border">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Adicionar Nova Rede Social</h2>
                
                <form onSubmit={handleRedeSocialSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="social-title" className="text-foreground font-medium">
                        Título *
                      </Label>
                      <Input
                        id="social-title"
                        placeholder="Ex: Instagram Oficial"
                        className="bg-input border-border"
                        value={redeSocialData.titulo}
                        onChange={(e) => setRedeSocialData({...redeSocialData, titulo: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="social-link" className="text-foreground font-medium">
                        Link *
                      </Label>
                      <Input
                        id="social-link"
                        type="url"
                        placeholder="https://..."
                        className="bg-input border-border"
                        value={redeSocialData.link}
                        onChange={(e) => setRedeSocialData({...redeSocialData, link: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="social-section-title" className="text-foreground font-medium">
                        Título da Seção
                      </Label>
                      <Input
                        id="social-section-title"
                        placeholder="Ex: Siga-nos nas redes sociais"
                        className="bg-input border-border"
                        value={redeSocialData.titulo_secao || ''}
                        onChange={(e) => setRedeSocialData({...redeSocialData, titulo_secao: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Este título aparecerá acima dos ícones de redes sociais na página inicial
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="social-icon" className="text-foreground font-medium">
                        Ícone *
                      </Label>
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { value: 'instagram', icon: FaInstagram, color: 'text-pink-500', label: 'Instagram' },
                            { value: 'whatsapp', icon: FaWhatsapp, color: 'text-green-500', label: 'WhatsApp' },
                            { value: 'facebook', icon: FaFacebook, color: 'text-blue-600', label: 'Facebook' },
                            { value: 'twitter', icon: FaTwitter, color: 'text-blue-400', label: 'Twitter' },
                            { value: 'linkedin', icon: FaLinkedin, color: 'text-blue-700', label: 'LinkedIn' },
                            { value: 'youtube', icon: FaYoutube, color: 'text-red-600', label: 'YouTube' },
                            { value: 'tiktok', icon: FaTiktok, color: 'text-white', label: 'TikTok' },
                            { value: 'discord', icon: FaDiscord, color: 'text-indigo-500', label: 'Discord' },
                            { value: 'telegram', icon: FaTelegram, color: 'text-blue-500', label: 'Telegram' },
                            { value: 'pinterest', icon: FaPinterest, color: 'text-red-500', label: 'Pinterest' },
                            { value: 'snapchat', icon: FaSnapchat, color: 'text-yellow-400', label: 'Snapchat' },
                            { value: 'link', icon: ExternalLink, color: 'text-blue-500', label: 'Link' }
                          ].map((iconOption) => {
                            const IconComponent = iconOption.icon;
                            const isSelected = redeSocialData.icone === iconOption.value;
                            return (
                              <button
                                key={iconOption.value}
                                type="button"
                                onClick={() => setRedeSocialData({...redeSocialData, icone: iconOption.value as any})}
                                className={`
                                  flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                                  hover:scale-105 hover:shadow-md
                                  ${
                                    isSelected 
                                      ? 'border-primary bg-primary/10 shadow-md' 
                                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/30'
                                  }
                                `}
                                title={iconOption.label}
                              >
                                <IconComponent className={`h-6 w-6 ${iconOption.color} mb-1`} />
                                <span className={`text-xs font-medium ${
                                  isSelected ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                  {iconOption.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-button shadow-card hover:shadow-hover"
                    disabled={loadingRedeSocial}
                  >
                    {loadingRedeSocial ? 'Salvando...' : 'Adicionar Rede Social'}
                  </Button>
                </form>
              </Card>

              {/* Preview */}
              <Card className="p-6 bg-card shadow-card border border-border">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Preview</h2>
                <div className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex justify-center items-center h-16">
                      {getIconPreview()}
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-white">
                        {redeSocialData.titulo || 'Título da rede social'}
                      </h4>
                      <p className="text-sm text-blue-400 mt-1">
                        {redeSocialData.link || 'Link da rede social'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Seção de Redes Sociais Criadas */}
            <Card className="p-6 bg-card shadow-card border border-border">
              <h2 className="text-2xl font-bold text-card-foreground mb-6">Redes Sociais Criadas</h2>
              <p className="text-muted-foreground mb-6">
                Gerencie suas redes sociais existentes - edite ou exclua conforme necessário
              </p>
              
              {carregandoRedesSociais ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-muted-foreground">Carregando redes sociais...</div>
                </div>
              ) : redesSociais.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-lg mb-2">Nenhuma rede social criada ainda</div>
                  <div className="text-muted-foreground">Crie sua primeira rede social usando o formulário acima</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {redesSociais.map((redeSocial) => (
                    <RedeSocialCard
                      key={redeSocial.id}
                      redeSocial={redeSocial}
                      onEdit={handleEditarRedeSocial}
                      onDelete={handleExcluirRedeSocial}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="outros" className="animate-fade-in">
            <div className="space-y-6">
              {/* Formulário de Criação */}
              <Card className="p-6 bg-card shadow-card border border-border">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Adicionar Novo Conteúdo</h2>
                <p className="text-muted-foreground mb-6">
                  Adicione links e conteúdos diversos para organizar suas informações
                </p>
                
                <form onSubmit={handleOutroSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="outro-titulo" className="text-card-foreground font-medium">
                        Título *
                      </Label>
                      <Input
                        id="outro-titulo"
                        placeholder="Ex: Artigo interessante, Ferramenta útil..."
                        className="bg-input border-border"
                        value={outroData.titulo}
                        onChange={(e) => setOutroData({...outroData, titulo: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outro-link" className="text-card-foreground font-medium">
                        Link Externo
                      </Label>
                      <Input
                        id="outro-link"
                        type="url"
                        placeholder="https://..."
                        className="bg-input border-border"
                        value={outroData.link_externo}
                        onChange={(e) => setOutroData({...outroData, link_externo: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-button shadow-card hover:shadow-hover"
                    disabled={loadingOutro}
                  >
                    {loadingOutro ? 'Salvando...' : 'Adicionar Conteúdo'}
                  </Button>
                </form>
              </Card>

              {/* DúvidasLink externos */}
              <Card className="p-6 bg-card shadow-card border border-border">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Conteúdos Criados</h2>
                <p className="text-muted-foreground mb-6">
                  Gerencie seus conteúdos existentes - edite ou exclua conforme necessário
                </p>
                
                {carregandoOutros ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-lg text-muted-foreground">Carregando conteúdos...</div>
                  </div>
                ) : outros.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground text-lg mb-2">Nenhum conteúdo criado ainda</div>
                    <div className="text-muted-foreground">Crie seu primeiro conteúdo usando o formulário acima</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outros.map((outro, index) => (
                      <OutroCard
                        key={outro.id}
                        outro={outro}
                        onEditar={handleEditarOutro}
                        onExcluir={handleExcluirOutro}
                        animationDelay={index * 0.1}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <ExternalLinkForm />
            </div>
          </TabsContent>

          <TabsContent value="configuracoes" className="animate-fade-in">
            <Card className="p-6 bg-card shadow-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Configurações</h2>
              
              {/* Seção WhatsApp */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Botão WhatsApp Flutuante</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp_numero">Número do WhatsApp</Label>
                    <Input
                      id="whatsapp_numero"
                      placeholder="(00) 00000-0000"
                      className="bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={configData.whatsapp_numero}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        const part1 = digits.slice(0, 2);
                        const part2 = digits.slice(2, 7);
                        const part3 = digits.slice(7, 11);
                        const formatted = `${part1 ? `(${part1}` : ''}${part1.length === 2 ? ') ' : ''}${part2}${part3 ? `-${part3}` : ''}`;
                        setConfigData({ ...configData, whatsapp_numero: formatted });
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Formato: DDD + número (ex: (62) 99999-9999)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp_mensagem">Mensagem Padrão</Label>
                    <textarea
                      id="whatsapp_mensagem"
                      rows={3}
                      className="w-full p-2 rounded border bg-input border-border text-foreground text-xs placeholder:text-muted-foreground"
                      value={configData.whatsapp_mensagem}
                      onChange={(e) => setConfigData({...configData, whatsapp_mensagem: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="whatsapp_ativo"
                      checked={configData.whatsapp_ativo}
                      onChange={(e) => setConfigData({...configData, whatsapp_ativo: e.target.checked})}
                    />
                    <Label htmlFor="whatsapp_ativo">Ativar botão flutuante na página inicial</Label>
                  </div>

                  <Button onClick={handleSalvarConfig} disabled={loadingConfig}>
                    {loadingConfig ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Modal de Edição de Corrida */}
         <EditCorridaModal
           corrida={corridaEditando}
           isOpen={modalEditarAberto}
           onSave={handleSalvarEdicao}
           onClose={() => {
             setModalEditarAberto(false);
             setCorridaEditando(null);
           }}
           loading={loadingCorrida}
         />
         
        {/* Modal de Edição de Evento */}
         <EditEventoModal
           evento={eventoEditando}
           isOpen={modalEditarEventoAberto}
           onSave={handleSalvarEdicaoEvento}
           onClose={() => {
             setModalEditarEventoAberto(false);
             setEventoEditando(null);
           }}
           loading={loadingEvento}
         />
         
        {/* Modal de Edição de Rede Social */}
         <EditRedeSocialModal
           redeSocial={redeSocialEditando}
           isOpen={modalEditarRedeSocialAberto}
           onClose={() => {
             setModalEditarRedeSocialAberto(false);
             setRedeSocialEditando(null);
             carregarRedesSociais(); // Recarregar a lista após edição
           }}
         />
         
        {/* Modal de Edição de Outro Conteúdo */}
         <EditOutroModal
           outro={outroEditando}
           isOpen={modalEditarOutroAberto}
           onSave={handleSalvarEdicaoOutro}
           onClose={() => {
             setModalEditarOutroAberto(false);
             setOutroEditando(null);
           }}
           loading={loadingOutro}
         />
      </div>
    </div>
  );
};

export default Dashboard;

