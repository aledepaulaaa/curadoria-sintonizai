'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { useAuth } from '@/src/hooks/useAuth';
import { Eye, EyeOff, Key } from 'lucide-react';

function CadastroForm() {
  const router = useRouter();
  const { user, erro, processando, cadastrar, setErro } = useAuth();
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [chave, setChave] = React.useState('');
  const [showSenha, setShowSenha] = React.useState(false);
  const [showChave, setShowChave] = React.useState(false);

  React.useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha || !chave) { setErro('Preencha todos os campos.'); return; }
    if (senha.length < 6) { setErro('Senha deve ter no mínimo 6 caracteres.'); return; }
    await cadastrar(email, senha, chave, nome);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo_dark.png" alt="Sintonizaí" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white">Cadastro Administrativo</h1>
          <p className="text-zinc-400 text-sm mt-1">Necessário chave mestra para acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-8">
          <div>
            <label className="text-sm text-zinc-400">Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: João Silva"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Senha</label>
            <div className="relative mt-1">
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Key size={14} className="text-yellow-500" />
              Chave Mestra
            </label>
            <div className="relative mt-1">
              <input
                type={showChave ? "text" : "password"}
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:ring-2 focus:ring-yellow-500 pr-12"
                placeholder="Cole a chave secreta"
              />
              <button
                type="button"
                onClick={() => setShowChave(!showChave)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                {showChave ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button type="submit" disabled={processando || !chave.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {processando ? 'Criando...' : 'Criar Conta'}
          </button>

          <Link href="/login" className="block text-center text-sm text-purple-400 hover:underline">
            Já tem conta? Entrar
          </Link>
        </form>
      </motion.div>
    </div>
  );
}

export default function CadastroPage() {
  return <AuthProvider><CadastroForm /></AuthProvider>;
}
