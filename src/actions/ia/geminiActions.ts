'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';
import { adminDb } from '@/src/services/firebaseAdmin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Ferramentas que a IA pode chamar
 */
const tools = [
  {
    functionDeclarations: [
      {
        name: 'buscar_eventos',
        description: 'Busca eventos no banco de dados com filtros opcionais.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Termo de busca no nome ou descrição' },
            tipo_evento: { type: 'string' },
            categoria: { type: 'string' },
            status: { type: 'string', enum: ['pendente', 'aprovado', 'arquivado'] }
          }
        }
      },
      {
        name: 'propor_ajuste_massivo',
        description: 'Propõe uma alteração em massa para um conjunto de eventos. Retorna a proposta para confirmação do usuário.',
        parameters: {
          type: 'object',
          properties: {
            ids: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs dos eventos a serem alterados' },
            campo: { type: 'string', description: 'Nome do campo a ser alterado (ex: tipo_evento, categoria, estilo)' },
            novoValor: { type: 'string', description: 'O novo valor a ser aplicado' },
            justificativa: { type: 'string', description: 'Por que este ajuste é necessário?' }
          },
          required: ['ids', 'campo', 'novoValor']
        }
      },
      {
        name: 'salvar_evento_no_firestore',
        description: 'Salva um ou mais eventos novos no banco de dados.',
        parameters: {
          type: 'object',
          properties: {
            eventos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  descricao: { type: 'string' },
                  dataInicio: { type: 'string', description: 'Formato YYYY-MM-DD' },
                  horario: { type: 'string' },
                  local: { type: 'object', properties: { nome: { type: 'string' } } },
                  endereco: { type: 'string' },
                  tipo_evento: { type: 'string' },
                  categoria: { type: 'string' },
                  estilo: { type: 'string' },
                  gratuito: { type: 'boolean' },
                  preco: { type: 'string' },
                  linkIngresso: { type: 'string' }
                },
                required: ['nome', 'dataInicio', 'local', 'tipo_evento', 'categoria']
              }
            }
          },
          required: ['eventos']
        }
      }
    ]
  }
];

export async function chatComGemini(
  mensagens: { role: 'user' | 'model', parts: { text: string }[] }[],
  imagem?: { data: string, mimeType: string }
): Promise<ActionResponse<any>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Buscar Metadados Atuais
    const [catSnap, estSnap, tipSnap] = await Promise.all([
      adminDb.collection('configuracoes_categorias').orderBy('ordem', 'asc').get(),
      adminDb.collection('configuracoes_estilos').orderBy('ordem', 'asc').get(),
      adminDb.collection('configuracoes_tipo_evento').orderBy('ordem', 'asc').get()
    ]);

    let categoriasTexto = catSnap.docs.map(d => `- ${d.data().label}`).join('\n');
    let estilosTexto = estSnap.docs.map(d => `- ${d.data().label}`).join('\n');
    let tiposTexto = tipSnap.docs.map(d => {
      const data = d.data();
      return `- [Grupo: ${data.label}]: ${(data.itens || []).join(', ')}`;
    }).join('\n');

    const instruction = `
Você é o Copiloto de Curadoria do app Sintonizaí.
Sua missão é ajudar o curador a manter o banco de dados organizado e de alta qualidade.

CAPACIDADES ESPECIAIS:
1. BUSCA: Você pode pesquisar eventos existentes usando 'buscar_eventos'. Use isso para ver quais eventos precisam de correção.
2. AJUSTE MASSIVO: Se o curador pedir para mudar algo em muitos eventos (ex: "Mude todos os 'Música' para 'Show'"), use 'propor_ajuste_massivo'.
   - O campo "estilo" no Firestore corresponde ao que o usuário chama de "Estilo Musical" ou "Ritmo".
   - O campo "tipo_evento" deve vir de um dos itens listados abaixo.

VALORES VÁLIDOS (Use EXATAMENTE estes nomes):
CATEGORIAS:
${categoriasTexto}

ESTILOS/RITMOS:
${estilosTexto}

TIPOS DE EVENTOS (Organizados por grupos):
${tiposTexto}

REGRAS:
- Ao propor ajuste massivo, sempre explique o porquê.
- Se o curador for vago (ex: "arruma os tipos"), primeiro busque os eventos ('buscar_eventos') para entender o que está errado e depois proponha o ajuste.
- SEMPRE valide se o novo valor existe nas listas acima.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: instruction,
      tools: tools as any
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    let lastMessageParts: any[] = [{ text: mensagens[mensagens.length - 1].parts[0].text }];
    if (imagem) {
      lastMessageParts.push({ inlineData: { data: imagem.data, mimeType: imagem.mimeType } });
    }

    const result = await chat.sendMessage(lastMessageParts);
    const response = await result.response;
    const calls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);

    if (calls && calls.length > 0) {
      const results = [];
      let propostaAjuste = null;

      for (const call of calls) {
        const { name, args } = call.functionCall as any;

        if (name === 'buscar_eventos') {
          const { query, tipo_evento, categoria, status } = args;
          let ref: any = adminDb.collection('eventos');
          
          if (query) {
             // Firestore doesn't support full text search well here, 
             // but we can at least filter by other fields if provided.
          }
          
          if (tipo_evento) ref = ref.where('tipo_evento', '==', tipo_evento);
          if (categoria) ref = ref.where('categoria', '==', categoria);
          if (status) ref = ref.where('status', '==', status);
          
          const snap = await ref.limit(50).get();
          const eventos = snap.docs.map((d: any) => ({ 
            id: d.id, 
            nome: d.data().nome, 
            tipo_evento: d.data().tipo_evento, 
            categoria: d.data().categoria 
          }));
          
          results.push({ name, response: { success: true, count: eventos.length, eventos } });
        }

        if (name === 'propor_ajuste_massivo') {
          const { ids, campo, novoValor, justificativa } = args;
          // Buscar dados atuais para a prévia
          const snap = await adminDb.collection('eventos').where('__name__', 'in', ids).get();
          const preview = snap.docs.map(d => ({
            id: d.id,
            nome: d.data().nome,
            antigo: d.data()[campo],
            novo: novoValor
          }));

          propostaAjuste = { eventos: preview, campo, novoValor, justificativa };
          results.push({ name, response: { success: true, message: 'Proposta gerada. Aguardando confirmação do usuário.' } });
        }

        if (name === 'salvar_evento_no_firestore') {
          const { eventos } = args;
          const batch = adminDb.batch();
          const colRef = adminDb.collection('eventos');
          eventos.forEach((ev: any) => {
            const docRef = colRef.doc();
            batch.set(docRef, { 
              ...ev, 
              status: 'pendente', 
              criadoEm: new Date().toISOString(), 
              origem: 'IA_ASSISTANT' 
            });
          });
          await batch.commit();
          results.push({ name, response: { success: true, count: eventos.length } });
        }
      }

      const finalResult = await chat.sendMessage([{ functionResponse: results[0] }] as any);
      const text = finalResult.response.text();

      return createSuccessResponse(text, { propostaAjuste } as any);
    }

    return createSuccessResponse(response.text());
  } catch (error) {
    return handleActionError(error, 'chatComGemini');
  }
}
