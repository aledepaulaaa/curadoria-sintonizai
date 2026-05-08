'use server';

import { adminStorage } from '@/src/services/firebaseAdmin';
import type { StorageItem } from '@/src/types/common';

export async function listarPastaStorage(prefix: string = ''): Promise<StorageItem[]> {
  const bucket = adminStorage.bucket();
  const [files, , apiResponse] = await bucket.getFiles({
    prefix: prefix || undefined,
    delimiter: '/',
    autoPaginate: false,
  });

  const items: StorageItem[] = [];

  // Subpastas
  const prefixes = (apiResponse as any)?.prefixes || [];
  for (const p of prefixes) {
    items.push({ nome: p.replace(prefix, '').replace('/', ''), caminho: p, tipo: 'pasta' });
  }

  // Arquivos
  for (const file of files) {
    if (file.name === prefix || file.name.endsWith('/')) continue;
    
    // Tenta tornar público para ter acesso garantido
    try { await file.makePublic(); } catch (e) {}

    // Formato de URL do Firebase Storage (mais compatível com Apps Mobile)
    const encodedPath = encodeURIComponent(file.name);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;

    items.push({
      nome: file.name.split('/').pop() || file.name,
      caminho: file.name,
      url: url,
      tipo: 'arquivo',
      tamanho: Number((await file.getMetadata())[0].size) || 0,
    });
  }

  return items;
}

export async function deletarArquivoStorage(caminho: string): Promise<void> {
  const bucket = adminStorage.bucket();
  await bucket.file(caminho).delete();
}

export async function deletarArquivosBatch(caminhos: string[]): Promise<void> {
  const bucket = adminStorage.bucket();
  const promises = caminhos.map(c => bucket.file(c).delete());
  await Promise.all(promises);
}

export async function uploadArquivoStorage(base64: string, nome: string, prefix: string = ''): Promise<string> {
  const bucket = adminStorage.bucket();
  const buffer = Buffer.from(base64.split(',')[1], 'base64');
  const caminho = prefix ? `${prefix}${nome}` : nome;
  const file = bucket.file(caminho);

  // Detecta content-type básico pela extensão
  const ext = nome.split('.').pop()?.toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  await file.save(buffer, {
    metadata: { contentType }
  });

  try {
    await file.makePublic();
  } catch (e) {
    console.error('[Storage] Erro ao tornar público:', e);
  }

  // URL padrão Firebase (alt=media) - Funciona para arquivos públicos ou com token
  const encodedPath = encodeURIComponent(caminho);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;
}
