'use server';

export async function validarChaveMaster(chave: string): Promise<boolean> {
  return chave === process.env.CHAVE_MASTER;
}
