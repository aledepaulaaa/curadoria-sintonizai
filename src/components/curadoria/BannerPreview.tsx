'use client';

import { BannerDestaque } from '@/src/types/banner';
import { Smartphone, Info } from 'lucide-react';

interface BannerPreviewProps {
  form: Partial<BannerDestaque>;
  estadoSimulado: 'em_breve' | 'disponivel' | 'ao_vivo';
}

export default function BannerPreview({ form, estadoSimulado }: BannerPreviewProps) {
  const getTextoEstado = () => {
    if (estadoSimulado === 'ao_vivo') return form.textoStatusAoVivo || 'AO VIVO';
    if (estadoSimulado === 'disponivel') return form.textoStatusDisponivel || 'DISPONÍVEL';
    return form.textoStatusEmBreve || 'EM BREVE';
  };

  const getCorEstado = () => {
    if (estadoSimulado === 'ao_vivo') return '#FF3D71';
    if (estadoSimulado === 'disponivel') return '#FF6B2C';
    return '#FFD93D';
  };

  const getMensagem = () => {
    if (estadoSimulado === 'ao_vivo') return form.textoAoVivo;
    if (estadoSimulado === 'disponivel') return form.textoDisponivel;
    return form.textoEmBreve;
  };

  return (
    <div className="sticky top-8 space-y-4">
      <div className="flex items-center gap-2 mb-2 ml-4">
        <Smartphone size={16} className="text-purple-500" />
        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Preview Mobile App</span>
      </div>

      <div className="max-w-[320px] mx-auto bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-950 shadow-2xl overflow-hidden aspect-[9/18] relative">
        {/* Simulação de Header do App */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
           <div className="w-20 h-4 bg-white/10 rounded-full" />
           <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10" />
              <div className="w-6 h-6 rounded-full bg-white/10" />
           </div>
        </div>

        <div className="p-4 pt-6 space-y-6">
           <div className="space-y-1">
              <div className="w-24 h-5 bg-white/10 rounded-full" />
              <div className="w-32 h-8 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full opacity-50" />
           </div>

           {/* O Banner em si */}
           <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden relative border border-white/10">
              {form.imagemFundo ? (
                <img src={form.imagemFundo} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase">Sem Imagem</div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/80 p-4 flex flex-col items-center justify-center text-center gap-1.5">
                 {/* Badge */}
                 <div className="px-3 py-1 rounded-full mb-1" style={{ backgroundColor: getCorEstado() }}>
                    <span className="text-[9px] font-black text-black uppercase tracking-tighter">
                       {estadoSimulado === 'ao_vivo' ? '🔴' : estadoSimulado === 'disponivel' ? '🔥' : '📅'} {getTextoEstado()}
                    </span>
                 </div>

                 <p className="text-[9px] font-bold text-white uppercase tracking-widest opacity-80 leading-tight">
                    {getMensagem() || 'Seu texto dinâmico aqui...'}
                 </p>

                 <h3 className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-1 line-clamp-2">
                    {form.titulo || 'TÍTULO DO BANNER'}
                 </h3>

                 {estadoSimulado !== 'em_breve' ? (
                   <div className="px-4 py-1.5 bg-purple-600 rounded-full mt-1">
                      <span className="text-[10px] font-bold text-white">{form.textoBotao || 'Ver Programação'}</span>
                   </div>
                 ) : (
                    <span className="text-[8px] text-white/50 italic mt-1 font-medium">Aguarde a programação ✨</span>
                 )}
              </div>
           </div>

           {/* Resto do App Simulado */}
           <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center px-2">
                 <div className="w-20 h-4 bg-white/10 rounded-full" />
                 <div className="w-12 h-6 bg-white/5 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="aspect-[4/5] bg-white/5 rounded-2xl border border-white/5" />
                 <div className="aspect-[4/5] bg-white/5 rounded-2xl border border-white/5" />
              </div>
           </div>
        </div>
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 p-6 rounded-3xl">
        <div className="flex items-start gap-3">
          <Info className="text-purple-500 shrink-0" size={18} />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            O preview exibe como o banner será renderizado no app 16:9. Use o seletor acima para testar os 3 estados visuais (Em Breve, Disponível e Ao Vivo).
          </p>
        </div>
      </div>
    </div>
  );
}
