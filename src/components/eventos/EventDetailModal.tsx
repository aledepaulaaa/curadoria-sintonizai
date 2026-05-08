import React from 'react';
import Modal from '../common/Modal';
import { Evento } from '@/src/types/evento';
import EventoForm from '../curadoria/EventoForm';
import { useEventos } from '@/src/hooks/useEventos';
import { Calendar, Clock, MapPin, Tag, Info, Link as LinkIcon, Star, Share2 } from 'lucide-react';
import { formatarData } from '@/src/utils/dateUtils';

interface EventDetailModalProps {
  evento: Evento | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ evento, isOpen, onClose }: EventDetailModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const { atualizar } = useEventos();

  if (!evento) return null;

  const handleUpdate = async (data: any) => {
    if (evento.id) {
      await atualizar(evento.id, data);
      setIsEditing(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        setIsEditing(false);
        onClose();
      }} 
      title={isEditing ? `Editando: ${evento.nome}` : 'Detalhes do Evento'}
      maxWidth="max-w-4xl"
    >
      {isEditing ? (
        <EventoForm inicial={evento} onSubmit={handleUpdate} />
      ) : (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 shadow-inner">
            {evento.imagemUrl ? (
              <img src={evento.imagemUrl} alt={evento.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Info size={48} />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${evento.gratuito ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'}`}>
                {evento.gratuito ? 'GRATUITO' : evento.preco || 'PAGO'}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight mb-2">{evento.nome}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-500/20">
                    {evento.tipo_evento || 'Evento'}
                  </span>
                  {evento.estilo && (
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                      {evento.estilo}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Descrição</h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {evento.descricao || 'Sem descrição disponível.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-bold mb-1">
                    <Calendar size={18} className="text-purple-500" />
                    <span>Data</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatarData(evento.dataInicio)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-900 dark:text-white font-bold mb-1">
                    <Clock size={18} className="text-purple-500" />
                    <span>Horário</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{evento.horario || '—'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                 <div>
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold mb-2">
                      <MapPin size={18} className="text-purple-500" />
                      <span>Localização</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 font-semibold">{evento.local?.nome}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{evento.endereco || 'Endereço não informado'}</p>
                 </div>

                 <hr className="border-zinc-200 dark:border-zinc-800" />

                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-400">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span>{evento.likes || 0} Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-400">
                      <Share2 size={16} className="text-blue-500" />
                      <span>{evento.shares || 0} Shares</span>
                    </div>
                 </div>

                 {evento.linkIngresso && (
                    <a 
                      href={evento.linkIngresso} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-black/10"
                    >
                      <LinkIcon size={16} />
                      Ver Ingressos
                    </a>
                 )}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 border-2 border-purple-500 text-purple-600 dark:text-purple-400 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
              >
                Editar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
