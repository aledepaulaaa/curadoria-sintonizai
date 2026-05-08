'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/src/services/firebaseClient';

export default function RecuperarPage() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'enviado' | 'erro'>('idle');
  const [mensagem, setMensagem] = React.useState('');
  const [processando, setProcessando] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setMensagem('Informe seu e-mail.'); setStatus('erro'); return; }

    setProcessando(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus('enviado');
      setMensagem('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    } catch {
      setStatus('erro');
      setMensagem('Não foi possível enviar. Verifique se o e-mail está correto.');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/icone.svg" alt="Sintonizaí" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
          <p className="text-zinc-400 text-sm mt-1">Enviaremos um link para redefinição</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-8">
          {status === 'enviado' ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✉️</div>
              <p className="text-green-400 text-sm">{mensagem}</p>
              <Link href="/login" className="block text-purple-400 hover:underline text-sm">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm text-zinc-400">E-mail cadastrado</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="admin@sintonizai.com"
                />
              </div>

              {status === 'erro' && <p className="text-red-400 text-sm">{mensagem}</p>}

              <button
                type="submit" disabled={processando}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {processando ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </button>

              <Link href="/login" className="block text-center text-sm text-zinc-400 hover:underline">
                ← Voltar para o login
              </Link>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
