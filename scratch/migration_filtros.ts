import { adminDb } from '../src/services/firebaseAdmin';
import { slugify } from '../src/utils/stringUtils';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log('Ambiente:', process.env.FIREBASE_PROJECT_ID ? 'Configurado' : 'FALTANDO VARIÁVEIS');

async function migrate() {
  console.log('--- Iniciando Migração de Metadados ---');

  const collections = [
    { old: 'configuracoes_filtros', new: 'configuracoes_tipo_evento', label: 'Tipos de Evento' },
    { old: 'configuracoes_categorias', new: 'configuracoes_categorias', label: 'Categorias' },
    { old: 'configuracoes_estilos', new: 'configuracoes_estilos', label: 'Estilos' }
  ];

  for (const col of collections) {
    console.log(`\nProcessando ${col.label}...`);
    const snapshot = await adminDb.collection(col.old).get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const label = data.label || data.nome || doc.id;
      const newId = slugify(label);
      
      // Se for a mesma coleção, deletamos o ID antigo se for diferente do novo
      if (col.old === col.new && doc.id !== newId) {
        await adminDb.collection(col.new).doc(newId).set({
          ...data,
          id: newId,
          ultimaAtualizacao: new Date().toISOString()
        });
        await adminDb.collection(col.old).doc(doc.id).delete();
        console.log(`  [Mapeado] ${doc.id} -> ${newId}`);
      } else {
        // Se for coleção diferente, apenas movemos
        await adminDb.collection(col.new).doc(newId).set({
          ...data,
          id: newId,
          ultimaAtualizacao: new Date().toISOString()
        });
        console.log(`  [Migrado] ${doc.id} -> ${newId} (${col.new})`);
      }
    }
  }

  console.log('\n--- Migração Concluída com Sucesso ---');
}

// Para rodar via npx tsx ou similar
migrate().catch(console.error);
