'use client';

import React from 'react';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import GallerySelector from '../curadoria/GallerySelector';
import { useEventos } from '@/src/hooks/useEventos';
import { Save, Loader2, Image as ImageIcon, Link as LinkIcon, Info, MapPin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface BulkEditModalProps {
  ids: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkEditModal({ ids, isOpen, onClose }: BulkEditModalProps) {
  const { atualizarEmMassa } = useEventos();
  const [salvando, setSalvando] = React.useState(false);
  const [abrirGaleria, setAbrirGaleria] = React.useState(false);
  const [form, setForm] = React.useState({
    imagemUrl: '',
    linkIngresso: '',
    lat: '',
    lng: '',
  });

  const handleSalvar = async () => {
    if (!form.imagemUrl && !form.linkIngresso && !form.lat && !form.lng) {
      alert('Preencha ao menos um campo para atualizar!');
      return;
    }
    
    setSalvando(true);
    try {
      const data: any = {};
      if (form.imagemUrl) data.imagemUrl = form.imagemUrl;
      if (form.linkIngresso) data.linkIngresso = form.linkIngresso;
      
      // Usar notação de ponto para atualizar campos aninhados no Firestore sem sobrescrever o objeto 'local' inteiro
      if (form.lat) data['local.lat'] = Number(form.lat.replace(',', '.'));
      if (form.lng) data['local.lng'] = Number(form.lng.replace(',', '.'));

      await atualizarEmMassa(ids, data);
      alert(`${ids.length} eventos atualizados com sucesso!`);
      onClose();
    } catch (e) {
      alert('Erro ao atualizar eventos: ' + e);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={`Edição em Massa (${ids.length} eventos)`} maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex gap-3">
          <Info className="text-blue-500 shrink-0" size={20} />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            As alterações abaixo serão aplicadas a **todos** os {ids.length} eventos selecionados. 
            Campos em branco não serão alterados.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={14} className="text-purple-500" /> Nova Imagem
              </label>
              <button 
                onClick={() => setAbrirGaleria(true)}
                className="text-[10px] font-black text-purple-600 uppercase hover:underline"
              >
                Galeria
              </button>
            </div>
            <ImageUpload value={form.imagemUrl} onChange={(url) => setForm(p => ({ ...p, imagemUrl: url }))} />
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-purple-500" /> Novo Link de Ingresso
            </label>
            <input 
              value={form.linkIngresso}
              onChange={(e) => setForm(p => ({ ...p, linkIngresso: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white font-medium shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-purple-500" /> Latitude
              </label>
              <input 
                value={form.lat}
                onChange={(e) => setForm(p => ({ ...p, lat: e.target.value }))}
                placeholder="-23.5505"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white font-medium shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-purple-500" /> Longitude
              </label>
              <input 
                value={form.lng}
                onChange={(e) => setForm(p => ({ ...p, lng: e.target.value }))}
                placeholder="-46.6333"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white font-medium shadow-sm"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSalvar}
          disabled={salvando}
          className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Aplicar a {ids.length} Eventos
        </button>
      </div>
    </Modal>

    <AnimatePresence>
      {abrirGaleria && (
        <GallerySelector 
          onSelect={(url) => { setForm(p => ({ ...p, imagemUrl: url })); setAbrirGaleria(false); }}
          onClose={() => setAbrirGaleria(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
