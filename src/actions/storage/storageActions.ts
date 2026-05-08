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
    const [meta] = await file.getMetadata();
    
    // Gera URL assinada válida por 1 hora para visualização segura no painel
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hora
    });

    items.push({
      nome: file.name.split('/').pop() || file.name,
      caminho: file.name,
      url: url,
      tipo: 'arquivo',
      tamanho: Number(meta.size) || 0,
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

  await file.save(buffer, {
    metadata: {
      contentType: 'image/webp', // Defaulting to webp for better compression
    }
  });

  // Retorna a URL assinada para visualização imediata
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  });

  return url;
}
