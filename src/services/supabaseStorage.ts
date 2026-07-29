import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abqkebrifvhjyaymbson.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_oOjI1NFmljyFBN1r0sjGbQ_77VOW5Wn';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export async function uploadImagemEvento(file: File | Blob, pathName?: string): Promise<string> {
  const fileName = pathName || `eventos/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  const { data, error } = await supabaseClient.storage
    .from('eventos-imagens')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Erro ao fazer upload da imagem no Supabase Storage:', error.message);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('eventos-imagens')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
