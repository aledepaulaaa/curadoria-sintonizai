import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!serviceAccount.project_id && process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount.project_id = process.env.FIREBASE_PROJECT_ID;
  serviceAccount.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  serviceAccount.client_email = process.env.FIREBASE_CLIENT_EMAIL;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const COLLECTION = 'eventos';

const files = [
  '../../eventos_bloco_1.json',
  '../../eventos_bloco_2.json',
  '../../eventos_bloco_3.json'
];

async function run() {
  console.log('--- INICIANDO INGESTÃO DE LOTES ---');
  
  const snapAtuais = await db.collection(COLLECTION).get();
  const nomesAtuais = new Set(snapAtuais.docs.map(doc => {
    const d = doc.data();
    return `${d.nome}_${d.dataInicio?.split('T')[0]}`;
  }));

  console.log(`Eventos atuais no banco: ${nomesAtuais.size}`);

  let totalNovos = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const fileRel of files) {
    const fileAbs = path.resolve('scratch', fileRel);
    if (!fs.existsSync(fileAbs)) {
      console.warn(`Arquivo não encontrado: ${fileAbs}`);
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(fileAbs, 'utf8'));
    console.log(`Processando ${fileRel} (${raw.length} itens)`);

    for (const item of raw) {
      const dataISO = normalizarData(item.dataInicio || item.data);
      const key = `${item.nome}_${dataISO}`;

      if (nomesAtuais.has(key)) continue;

      const novoEvento = {
        nome: (item.nome || 'Evento sem nome').trim(),
        descricao: (item.descricao || '').trim(),
        dataInicio: dataISO,
        horario: (item.horario || 'Horário a confirmar').trim(),
        local: {
          nome: (item.local_nome || item.estabelecimento || 'Local não informado').trim(),
          lat: item.latitude || item.local?.lat || -23.5505,
          lng: item.longitude || item.local?.lng || -46.6333
        },
        cidade: (item.cidade || 'São Paulo').trim(),
        categoria: (item.categoria || item.tipo_evento || 'Outros').trim(),
        vibe: (item.vibe || 'Cultural').trim(),
        bombando: false,
        aoVivo: false,
        likes: 0,
        gratuito: item.Gratuito === 'Sim' || item.gratuito === true,
        preco: item.preco || (item.Gratuito === 'Sim' ? 'Grátis' : ''),
        linkIngresso: item.linkIngresso || undefined,
        endereco: item.endereco || undefined,
        fonte: item.fonte || 'Batch Import'
      };

      const ref = db.collection(COLLECTION).doc();
      batch.set(ref, novoEvento);
      batchCount++;
      totalNovos++;
      nomesAtuais.add(key); // Evita duplicados dentro do mesmo lote

      if (batchCount >= 450) {
        await batch.commit();
        console.log(`Commit de 450 itens...`);
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) await batch.commit();
  console.log(`--- SUCESSO: ${totalNovos} novos eventos adicionados! ---`);
}

function normalizarData(dStr) {
  if (!dStr || typeof dStr !== 'string') return new Date().toISOString();
  if (dStr.includes('/')) {
    const parts = dStr.split('/');
    if (parts.length === 3) {
      const [dia, mes, ano] = parts;
      const fullAno = ano.length === 2 ? `20${ano}` : ano;
      return `${fullAno}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T20:00:00Z`;
    }
  }
  return dStr;
}

run().catch(console.error);
