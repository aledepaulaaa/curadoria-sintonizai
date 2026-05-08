'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import type { BannerDestaque } from '@/src/types/banner';

const COLLECTION = 'banners_destaque';

export async function listarBanners(): Promise<BannerDestaque[]> {
  const snap = await adminDb.collection(COLLECTION).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BannerDestaque));
}

export async function criarBanner(banner: Omit<BannerDestaque, 'id'>): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add(banner);
  return ref.id;
}

export async function atualizarBanner(id: string, dados: Partial<BannerDestaque>): Promise<void> {
  const { id: _, ...rest } = dados as BannerDestaque;
  await adminDb.collection(COLLECTION).doc(id).update(rest);
}

export async function deletarBanner(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
