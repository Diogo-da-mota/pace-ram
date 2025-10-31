import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, ExternalLink, Clock, Users } from 'lucide-react';
import { formatDistancesInline } from '@/utils/distanceUtils';

export interface EventoCardData {
  id: string;
  titulo: string;
  data_evento: string;
  local?: string;
  link_externo?: string;
  status?: 'inscricoes_abertas' | 'em_andamento' | 'encerrado';
  regiao?: string;
  distancia?: string[];
  horario?: string;
  participantes?: string;
}

interface EventoCardProps {
  evento: EventoCardData;
  animationDelay?: number;
}

const EventoCard: React.FC<EventoCardProps> = ({ evento, animationDelay = 0 }) => {
  // Função para formatar a data de ISO para dd.mm.aaaa (evitando problemas de fuso horário)
  const formatarData = (dataISO: string): string => {
    try {
      // Extrair ano, mês e dia diretamente da string ISO para evitar problemas de fuso horário
      const [ano, mes, dia] = dataISO.split('-');
      return `${dia.padStart(2, '0')}.${mes.padStart(2, '0')}.${ano}`;
    } catch (error) {
      return dataISO;
    }
  };

  // Função para obter o dia da semana
  const getDiaDaSemana = (dataISO: string): string => {
    try {
      const data = new Date(dataISO + 'T00:00:00');
      const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
      return diasSemana[data.getDay()];
    } catch (error) {
      return 'DOM';
    }
  };

  // Função para obter as configurações do badge de status
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'inscricoes_abertas':
        return {
          text: 'Aberto',
          className: 'bg-green-500 text-white',
          icon: Clock
        };
      case 'em_andamento':
        return {
          text: 'Em Andamento',
          className: 'bg-gray-500 text-white',
          icon: Clock
        };
      case 'encerrado':
        return {
          text: 'Encerrado',
          className: 'bg-red-500 text-white',
          icon: Clock
        };
      default:
        return {
          text: 'Aberto',
          className: 'bg-green-500 text-white',
          icon: Clock
        };
    }
  };

  const statusConfig = getStatusConfig(evento.status);

  return (
    <div 
      className="group animate-fade-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <a 
        href={evento.link_externo || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {/* Layout Mobile - Novo Design */}
        <Card className="sm:hidden bg-card dark:bg-card shadow-lg border border-border dark:border-border hover:shadow-xl transition-all duration-300 w-[95%] mx-auto rounded-lg overflow-hidden">
          
          {/* Linha 1: [ícone calendário + dia da semana . data] [status] */}
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white dark:bg-gray-100 text-black px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{getDiaDaSemana(evento.data_evento)} {formatarData(evento.data_evento)}</span>
              </div>
            </div>
            <div className={`${statusConfig.className} px-3 py-2 rounded-lg text-sm font-semibold`}>
              {statusConfig.text}
            </div>
          </div>

          {/* Título */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold text-card-foreground dark:text-card-foreground leading-tight">
              {evento.titulo}
            </h3>
          </div>

          {/* Linha 2: [ícone local] [relógio, horário] [ícone pessoa, quantas pessoas] */}
          <div className="flex justify-between items-center px-4 py-2 space-x-4">
            {/* Local */}
            {(evento.regiao || evento.local) && (
              <div className="flex items-center space-x-2 flex-1">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-card-foreground dark:text-card-foreground truncate">
                  {evento.regiao || evento.local}
                </span>
              </div>
            )}

            {/* Horário */}
            {evento.horario && (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="text-sm text-card-foreground dark:text-card-foreground">
                  {evento.horario}
                </span>
              </div>
            )}

            {/* Pessoas */}
            {evento.participantes && (
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-card-foreground dark:text-card-foreground">
                  {evento.participantes}
                </span>
              </div>
            )}
          </div>

          {/* Linha 3: [km] [botão acessar] */}
          <div className="flex justify-between items-center p-4">
            {/* Distâncias */}
            <div className="flex flex-wrap gap-2">
              {evento.distancia && evento.distancia.length > 0 && (
                formatDistancesInline(evento.distancia).map((dist, index) => (
                  <span key={index} className="text-red-500 px-3 py-1 text-sm font-semibold">
                    {dist}
                  </span>
                ))
              )}
            </div>

            {/* Botão Acessar */}
            <button className="bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-1">
              <span>Acessar</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </Card>

        {/* Layout Desktop - Mesmo estilo visual do mobile */}
        <Card className="hidden sm:block bg-card dark:bg-card shadow-lg border border-border dark:border-border hover:shadow-xl transition-all duration-300 w-[95%] mx-auto rounded-lg overflow-hidden">
          
          {/* Layout Desktop - Horizontal seguindo o padrão do mobile */}
          <div className="flex items-center justify-between p-4">
            {/* 1. Data com ícone calendário */}
            <div className="flex items-center space-x-2">
              <div className="bg-white dark:bg-gray-100 text-black px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{getDiaDaSemana(evento.data_evento)} {formatarData(evento.data_evento)}</span>
              </div>
            </div>
            
            {/* 2. Título */}
            <div className="flex-1 min-w-0 px-4">
              <h3 className="text-lg font-bold text-card-foreground dark:text-card-foreground truncate">
                {evento.titulo}
              </h3>
            </div>
            
            {/* 3. Informações: Local, Horário, Participantes */}
            <div className="flex items-center space-x-4">
              {/* Local */}
              {(evento.regiao || evento.local) && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-card-foreground dark:text-card-foreground">
                    {evento.regiao || evento.local}
                  </span>
                </div>
              )}

              {/* Horário */}
              {evento.horario && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-card-foreground dark:text-card-foreground">
                    {evento.horario}
                  </span>
                </div>
              )}

              {/* Participantes */}
              {evento.participantes && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-card-foreground dark:text-card-foreground">{evento.participantes}</span>
                </div>
              )}
            </div>
            
            {/* 4. Distâncias (KM) */}
            <div className="flex gap-1 mx-4">
              {evento.distancia && evento.distancia.length > 0 && (
                formatDistancesInline(evento.distancia).map((dist, index) => (
                  <span key={index} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {dist}
                  </span>
                ))
              )}
            </div>
            
            {/* 5. Status */}
            <div className={`${statusConfig.className} px-3 py-2 rounded-lg text-sm font-semibold`}>
              {statusConfig.text}
            </div>
            
            {/* 6. Botão Acessar */}
            <button className="bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 dark:hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-1 ml-4">
              <span>Acessar</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </a>
    </div>
  );
};

export default EventoCard;