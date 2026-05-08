import React from 'react';
import Modal from '../common/Modal';
import { Usuario } from '@/src/types/usuario';
import { atualizarUsuario } from '@/src/actions/usuarios/usuariosActions';
import { User, Mail, Phone, MapPin, Sparkles, Calendar, Save, Loader2 } from 'lucide-react';

interface UserDetailModalProps {
  user: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose, onUpdate }: UserDetailModalProps) {
  const [form, setForm] = React.useState<Partial<Usuario>>({});
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await atualizarUsuario(user.id, form);
      onUpdate();
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all";
  const labelCls = "text-sm font-bold text-zinc-700 dark:text-zinc-400 mb-1 block";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Usuário" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
           <div className="w-20 h-20 bg-purple-100 dark:bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-500/20">
              <User size={40} />
           </div>
           <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">{user.nome || 'Sem Nome'}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome</label>
            <div className="relative">
               <User className="absolute left-4 top-3.5 text-zinc-400" size={18} />
               <input 
                value={form.nome || ''} 
                onChange={(e) => setForm({...form, nome: e.target.value})} 
                className={`${inputCls} pl-12`} 
                placeholder="Nome do usuário" 
               />
            </div>
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <div className="relative">
               <Phone className="absolute left-4 top-3.5 text-zinc-400" size={18} />
               <input 
                value={form.telefone || ''} 
                onChange={(e) => setForm({...form, telefone: e.target.value})} 
                className={`${inputCls} pl-12`} 
                placeholder="(00) 00000-0000" 
               />
            </div>
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <div className="relative">
               <Mail className="absolute left-4 top-3.5 text-zinc-400" size={18} />
               <input 
                value={form.email || ''} 
                readOnly
                className={`${inputCls} pl-12 opacity-60 cursor-not-allowed`} 
               />
            </div>
          </div>
          <div>
            <label className={labelCls}>Vibe / Perfil</label>
            <div className="relative">
               <Sparkles className="absolute left-4 top-3.5 text-zinc-400" size={18} />
               <input 
                value={form.vibe || ''} 
                onChange={(e) => setForm({...form, vibe: e.target.value})} 
                className={`${inputCls} pl-12`} 
                placeholder="Ex: Cultural, Agitado..." 
               />
            </div>
          </div>
          <div>
            <label className={labelCls}>Data de Nascimento</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-3.5 text-zinc-400" size={18} />
               <input 
                type="date"
                value={form.dataNascimento || ''} 
                onChange={(e) => setForm({...form, dataNascimento: e.target.value})} 
                className={`${inputCls} pl-12`} 
               />
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
           <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <MapPin size={14} />
              <span>Localização & Endereço</span>
           </div>
           <div className="space-y-1">
              <p className="text-sm text-zinc-900 dark:text-white font-bold">
                 {user.localizacao?.enderecoCompleto || 'Endereço não cadastrado'}
              </p>
              {user.localizacao?.cidade && (
                <p className="text-xs text-zinc-500">{user.localizacao.cidade}</p>
              )}
           </div>

           <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/50 grid grid-cols-2 gap-4">
              {user.criadoEm && (
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                   <Calendar size={12} />
                   <span>Cadastro: {new Date(user.criadoEm).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                 <User size={12} />
                 <span>UID: {user.id.substring(0, 12)}...</span>
              </div>
           </div>
        </div>

        <button 
          type="submit" 
          disabled={salvando}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
        >
          {salvando ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </Modal>
  );
}
