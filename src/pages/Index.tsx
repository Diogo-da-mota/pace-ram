import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import RaceCard from "@/components/RaceCard";
import DiagonalTitle from "@/components/DiagonalTitle";
import RunnerLoader from "@/components/RunnerLoader";
import AnimatedParticles from "@/components/AnimatedParticles";
import CardSection from "@/components/CardSection";
import BackgroundImage from "@/components/BackgroundImage";
import { useCorridasSeparadas } from "@/hooks/useCorridasSeparadas";
import { useEventosPublicos } from "@/hooks/useEventosPublicos";
import { useRedesSociaisPublicas } from "@/hooks/useRedesSociaisPublicas";
import { useOutrosPublicos } from "@/hooks/useOutrosPublicos";
import { formatDateToBrazilian } from "@/utils/dateFormatter";
import RedeSocialCard from "@/components/RedeSocialCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState, useEffect } from "react";

// Import das imagens geradas (para fallback)
import raceExample1 from "@/assets/race-example-1.jpg";
import raceExample2 from "@/assets/race-example-2.jpg";
import raceExample3 from "@/assets/race-example-3.jpg";

import { toast } from "sonner"; // Importar toast

const Index = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { corridasRecentes, corridasEmBreve, loading: loadingCorridas, error: errorCorridas } = useCorridasSeparadas();
  const { eventos, loading: loadingEventos, error: errorEventos } = useEventosPublicos();
  const { redesSociais, loading: loadingRedesSociais, error: errorRedes } = useRedesSociaisPublicas();
  const { outros, loading: loadingOutros, error: errorOutros } = useOutrosPublicos();

  // Monitorar erros de conexão
  useEffect(() => {
    const error = errorCorridas || errorEventos || errorRedes || errorOutros;
    if (error) {
      console.error("Erro de conexão:", error);
      // Evitar spam de toasts
      const hasShownError = sessionStorage.getItem('hasShownConnectionError');
      if (!hasShownError) {
        toast.error("Erro ao conectar com o servidor. Verifique sua conexão ou configuração.", {
          duration: 5000,
          description: "Se você é o administrador, verifique as variáveis de ambiente."
        });
        sessionStorage.setItem('hasShownConnectionError', 'true');
      }
    }
  }, [errorCorridas, errorEventos, errorRedes, errorOutros]);

  // Simular loading inicial da página
  useEffect(() => {
    setIsInitialLoading(false);
  }, []);

  // Mostrar loader se ainda estiver carregando inicialmente
  if (isInitialLoading) {
    return <RunnerLoader message="Preparando sua experiência..." />;
  }

  // Verificar se alguma seção está carregando para mostrar loader único
  const isAnyLoading = loadingRedesSociais || loadingCorridas || loadingEventos || loadingOutros;
  if (isAnyLoading) {
    const loadingMessage = loadingRedesSociais ? "Carregando redes sociais..." :
                          loadingCorridas ? "Carregando corridas..." :
                          loadingEventos ? "Carregando eventos..." :
                          "Carregando conteúdos...";
    return <RunnerLoader message={loadingMessage} />;
  }

  // Fallback images para quando não há imagem definida
  const fallbackImages = [raceExample1, raceExample2, raceExample3];
  
  // Usar apenas dados reais do banco de dados
  const corridasRecentesParaExibir = corridasRecentes;
  const corridasEmBreveParaExibir = corridasEmBreve;
  const eventosParaExibir = eventos;
  const redesSociaisParaExibir = redesSociais;
  const outrosParaExibir = outros;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <BackgroundImage className="z-0" />
      
      {/* Conteúdo principal */}
      <div className="relative z-10">
        <Header />

      {/* Seção Redes Sociais */}
      <section className="section-padding bg-background relative pt-24 sm:pt-28 md:pt-20">
        <div className="container-85">
          <div className="animate-fade-in">
            <DiagonalTitle 
              leftText="Redes"
              rightText="Sociais"
              maxWidth="max-w-7xl"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-4xl mx-auto">
            {redesSociaisParaExibir.map((redeSocial, index) => (
              <div 
                key={redeSocial.id} 
                className="animate-scale-in hover:animate-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RedeSocialCard
                  redeSocial={redeSocial}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Corridas Recentes */}
      <section id="corridas-recentes" className="section-padding bg-black relative overflow-hidden">
        <div className="container-95 relative z-10">
          <div className="animate-slide-up">
            <DiagonalTitle 
              leftText="Corridas"
              rightText="Recentes"
              maxWidth="max-w-7xl"
            />
          </div>
          
          <div className="flex flex-col gap-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4 lg:gap-6 w-full px-4">
            {corridasRecentesParaExibir.map((corrida, index) => (
              <div 
                key={corrida.id}
                className="animate-fade-in hover:scale-105 transition-all duration-300 w-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RaceCard
                    title={corrida.titulo}
                    date={formatDateToBrazilian(corrida.data_evento)}
                    location={corrida.local}
                    image={corrida.imagem_principal || fallbackImages[index % fallbackImages.length]}
                    link={corrida.link_externo || "#"}
                    footerText={corrida.texto_rodape || "COMPRE AS SUAS FOTOS"}
                    status={corrida.status}
                    evento_calendario_id={corrida.evento_calendario_id}
                    isRecente={true}
                    isMobileVertical={true}
                  />
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Seção Corridas Em Breve */}
      <section id="corridas-em-breve" className="section-padding bg-background relative overflow-hidden">
        <div className="container-95 relative z-10">
          <div className="animate-slide-up">
            <DiagonalTitle 
              leftText="⏰ Em"
              rightText="Breve"
              maxWidth="max-w-7xl"
            />
          </div>
          
          <div className="flex flex-col gap-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4 lg:gap-6 w-full px-4">
            {corridasEmBreveParaExibir.map((corrida, index) => (
              <div 
                key={corrida.id}
                className="animate-fade-in hover:scale-105 transition-all duration-300 w-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RaceCard
                    title={corrida.titulo}
                    date={formatDateToBrazilian(corrida.data_evento)}
                    location={corrida.local}
                    image={corrida.imagem_principal || fallbackImages[index % fallbackImages.length]}
                    link={corrida.link_externo || "#"}
                    footerText={corrida.texto_rodape || "COMPRE AS SUAS FOTOS"}
                    status={corrida.status}
                    evento_calendario_id={corrida.evento_calendario_id}
                    isRecente={false}
                    isMobileVertical={true}
                  />
                </div>
              ))}
            </div>
        </div>
      </section>



      {/* Seção Outros */}
      <section className="section-padding bg-background relative overflow-hidden">
        
        <div className="container-85 relative z-10">
          <div className="animate-slide-up">
            <SectionTitle 
              title="Dúvidas e Links externos"
              showUnderline={true}
            />
          </div>
          
          <CardSection 
            items={outrosParaExibir} 
            animationDelayMultiplier={0.2} 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white section-padding-sm relative overflow-hidden">

        
        <div className="container-85 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="mb-4">
              
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm opacity-90">
                © 2025 PACE RAM. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
      
      {/* WhatsApp Button Flutuante */}
      <WhatsAppButton />
    </div>
  );
};

export default Index;
