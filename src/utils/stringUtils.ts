export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/[^\w-]+/g, '') // Remover caracteres não alfanuméricos exceto hífens
    .replace(/--+/g, '-') // Remover múltiplos hífens
    .replace(/^-+/, '') // Remover hífen do início
    .replace(/-+$/, ''); // Remover hífen do fim
}
