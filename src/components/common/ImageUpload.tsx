import React from 'react';
import { storage } from '@/src/services/firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ value, onChange, folder = 'eventos' }: ImageUploadProps) {
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErro('Apenas imagens são permitidas.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      onChange(url);
    } catch (err) {
      console.error('Erro no upload:', err);
      setErro('Falha ao enviar imagem.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-400">Imagem do Evento</label>
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all cursor-pointer">
            {carregando ? (
              <div className="flex flex-col items-center gap-2 text-purple-600">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-xs font-medium">Enviando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <div className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Clique para enviar</span>
                  <p className="text-xs text-zinc-500">PNG, JPG ou WEBP</p>
                </div>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={carregando} />
          </label>
        )}
      </div>
      
      {erro && <p className="text-xs text-red-500 font-medium">{erro}</p>}
    </div>
  );
}
