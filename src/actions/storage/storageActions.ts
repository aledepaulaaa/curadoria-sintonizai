'use server';

import { supabase } from '@/src/services/supabaseClient';
import type { StorageItem } from '@/src/types/common';
import sharp from 'sharp';

const BUCKET_NAME = 'imagens_eventos';

/**
 * Lista arquivos e pastas sob um determinado prefixo no Supabase Storage.
 */
export async function listarPastaStorage(prefix: string = ''): Promise<StorageItem[]> {
  // Remove barras no início ou no fim para listar corretamente
  const cleanPrefix = prefix.replace(/^\/|\/$/g, '');

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(cleanPrefix, {
      limit: 100,
      offset: 0,
    });

  if (error) {
    console.error('[Storage] Erro ao listar arquivos do Supabase:', error.message);
    throw error;
  }

  const items: StorageItem[] = [];

  for (const item of data || []) {
    // No Supabase, pastas virtuais costumam vir sem id ou metadata nulo
    const isFolder = !item.id || !item.metadata || Object.keys(item.metadata).length === 0;

    // Reconstrói o caminho completo a partir do prefixo limpo
    const caminho = cleanPrefix
      ? `${cleanPrefix}/${item.name}${isFolder ? '/' : ''}`
      : `${item.name}${isFolder ? '/' : ''}`;

    if (isFolder) {
      items.push({
        nome: item.name,
        caminho: caminho,
        tipo: 'pasta',
      });
    } else {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(caminho);

      items.push({
        nome: item.name,
        caminho: caminho,
        url: urlData?.publicUrl,
        tipo: 'arquivo',
        tamanho: item.metadata?.size || 0,
      });
    }
  }

  return items;
}

/**
 * Deleta um arquivo específico do Supabase Storage.
 */
export async function deletarArquivoStorage(caminho: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([caminho]);

  if (error) {
    console.error('[Storage] Erro ao deletar arquivo:', error.message);
    throw error;
  }
}

/**
 * Deleta múltiplos arquivos em lote (batch) do Supabase Storage.
 */
export async function deletarArquivosBatch(caminhos: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(caminhos);

  if (error) {
    console.error('[Storage] Erro ao deletar lote de arquivos:', error.message);
    throw error;
  }
}

/**
 * Faz upload de imagem em base64 para o Supabase Storage com compressão automática via sharp.
 * Redimensiona para largura máxima de 1000px e converte para WebP (qualidade 75) para economizar espaço.
 */
export async function uploadArquivoStorage(
  base64: string,
  nome: string,
  prefix: string = ''
): Promise<string> {
  const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const inputBuffer = Buffer.from(rawBase64, 'base64');

  let compressedBuffer = inputBuffer;
  let finalNome = nome;
  let contentType = 'image/webp';

  try {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    let pipeline = image;
    // Redimensiona se for maior que 1000px de largura
    if (metadata.width && metadata.width > 1000) {
      pipeline = pipeline.resize({ width: 1000, withoutEnlargement: true });
    }

    // Converte para webp com qualidade 75
    compressedBuffer = await pipeline.webp({ quality: 75 }).toBuffer();

    // Altera a extensão do nome do arquivo para .webp
    const baseName = nome.substring(0, nome.lastIndexOf('.')) || nome;
    finalNome = `${baseName}.webp`;
  } catch (error: any) {
    console.error('[Storage] Erro ao comprimir imagem com sharp. Usando original:', error?.message || error);
    const ext = nome.split('.').pop()?.toLowerCase();
    contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  }

  // Garante que o prefixo tenha barra no final se presente
  const cleanPrefix = prefix ? (prefix.endsWith('/') ? prefix : `${prefix}/`) : '';
  const caminho = `${cleanPrefix}${finalNome}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(caminho, compressedBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('[Storage] Erro ao fazer upload para o Supabase:', uploadError.message);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(caminho);

  return urlData.publicUrl;
}
