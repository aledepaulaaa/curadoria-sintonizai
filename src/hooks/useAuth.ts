'use client';

import React from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/src/services/firebaseClient';
import { validarChaveMaster } from '@/src/actions/auth/authActions';
import { useAuthContext } from '@/src/contexts/AuthContext';

export function useAuth() {
  const { user, loading, logout } = useAuthContext();
  const [erro, setErro] = React.useState('');
  const [processando, setProcessando] = React.useState(false);

  const login = React.useCallback(async (email: string, senha: string) => {
    setErro('');
    setProcessando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setProcessando(false);
    }
  }, []);

  const cadastrar = React.useCallback(async (email: string, senha: string, chave: string, nome: string) => {
    setErro('');
    setProcessando(true);
    try {
      const valida = await validarChaveMaster(chave);
      if (!valida) { setErro('Chave mestra inválida.'); return; }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Atualiza o perfil com o nome
      await updateProfile(userCredential.user, {
        displayName: nome
      });
      
    } catch {
      setErro('Erro ao criar conta. Verifique os dados.');
    } finally {
      setProcessando(false);
    }
  }, []);

  return { user, loading, erro, processando, login, cadastrar, logout, setErro };
}
