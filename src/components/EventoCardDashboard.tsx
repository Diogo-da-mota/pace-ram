import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { formatDistancesInline } from '@/utils/distanceUtils';

export interface EventoCardDashboardData {
  id: string;
  titulo: string;
  data_evento: string;
  local?: string;
  status?: 'inscricoes_abertas' | 'em_andamento' | 'encerrado';
  regiao?: string;
  distancia?: string[];
  horario?: string;
  participantes?: string;
}

interface EventoCardDashboardProps {
  evento: EventoCardDashboardData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  animationDelay?: number;
}

const EventoCardDashboard: React.FC<EventoCardDashboardProps> = ({ evento, onEdit, onDelete, animationDelay = 0 }) => {
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
          text: 'Inscrições encerrada',
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
      {/* Layout Mobile - Novo Design */}
      <Card className="sm:hidden bg-gray-800 dark:bg-gray-800 shadow-lg border border-gray-700 dark:border-gray-700 hover:shadow-xl transition-all duration-300 w-[95%] mx-auto rounded-lg overflow-hidden">
        
        {/* Linha 1: [ícone calendário + dia da semana . data] [status] */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-white text-black px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
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
          <h3 className="text-lg font-bold text-white leading-tight">
            {evento.titulo}
          </h3>
        </div>

        {/* Linha 2: [ícone local] [relógio, horário] [ícone pessoa, quantas pessoas] */}
        <div className="flex justify-between items-center px-4 py-2 space-x-4">
          {/* Local */}
          {(evento.regiao || evento.local) && (
            <div className="flex items-center space-x-2 flex-1">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-white truncate">
                {evento.regiao || evento.local}
              </span>
            </div>
          )}

          {/* Horário */}
          {evento.horario && (
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="text-sm text-white">
                {evento.horario}
              </span>
            </div>
          )}

          {/* Pessoas */}
          {evento.participantes && (
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-white">
                {evento.participantes}
              </span>
            </div>
          )}
        </div>

        {/* Linha 3: [km] [botões acessar, editar, apagar] */}
        <div className="flex justify-between items-center p-4">
          {/* Distâncias */}
          <div className="flex flex-wrap gap-2">
            {evento.distancia && evento.distancia.length > 0 && (
              formatDistancesInline(evento.distancia).map((dist, index) => (
                <span key={index} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {dist}
                </span>
              ))
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center space-x-2">
            {/* Botão Acessar */}
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1">
              <span>Acessar</span>
            </button>
            
            {/* Botão Editar */}
            <button 
              onClick={() => onEdit(evento.id)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            {/* Botão Apagar */}
            <button 
              onClick={() => onDelete(evento.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Layout Desktop - Mesmo estilo visual do mobile */}
      <Card className="hidden sm:block bg-gray-800 dark:bg-gray-800 shadow-lg border border-gray-700 dark:border-gray-700 hover:shadow-xl transition-all duration-300 w-[95%] mx-auto rounded-lg overflow-hidden">
        
        {/* Layout Desktop - Horizontal seguindo o padrão do mobile */}
        <div className="flex items-center justify-between p-4">
          {/* 1. Data com ícone calendário */}
          <div className="flex items-center space-x-2">
            <div className="bg-white text-black px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{getDiaDaSemana(evento.data_evento)} {formatarData(evento.data_evento)}</span>
            </div>
          </div>
          
          {/* 2. Título */}
          <div className="flex-1 min-w-0 px-4">
            <h3 className="text-lg font-bold text-white truncate">
              {evento.titulo}
            </h3>
          </div>
          
          {/* 3. Informações: Local, Horário, Participantes */}
          <div className="flex items-center space-x-4">
            {/* Local */}
            {(evento.regiao || evento.local) && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-white">
                  {evento.regiao || evento.local}
                </span>
              </div>
            )}
    
            {/* Horário */}
            {evento.horario && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-sm text-white">
                  {evento.horario}
                </span>
              </div>
            )}
    
            {/* Participantes */}
            {evento.participantes && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-white">{evento.participantes}</span>
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
          
          {/* 6. Botões de Ação */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Botão Acessar */}
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1">
              <span>Acessar</span>
            </button>
            
            {/* Botão Editar */}
            <button 
              onClick={() => onEdit(evento.id)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            {/* Botão Apagar */}
            <button 
              onClick={() => onDelete(evento.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventoCardDashboard;