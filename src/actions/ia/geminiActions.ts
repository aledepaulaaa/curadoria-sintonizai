'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';
import { adminDb } from '@/src/services/firebaseAdmin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `
Você é o Assistente de Curadoria do app Sintonizaí.
Sua função é ajudar curadores de eventos a gerenciar a base de dados.

DIRETRIZES DE DADOS:
1. "tipo_evento": Deve ser um dos: Show, Festival, Teatro, Exposição, Cinema, Sarau, Feira, Workshop, Stand-up, Infantil, Outros.
2. "estilo": OBRIGATÓRIO. Defina o gênero predominante (ex: Samba, Rock, MPB, Eletrônico, Comédia, Clássico).
3. "gratuito": boolean (true se o preço for R$ 0 ou "Grátis").

FERRAMENTAS DISPONÍVEIS:
- Se o usuário pedir para "cadastrar", "salvar", "incluir" ou "adicionar" um lote de eventos ou um evento específico, você DEVE usar a ferramenta 'salvar_evento_no_firestore'.
- Não apenas confirme que salvou; chame a ferramenta de verdade.

Sempre responda de forma profissional e prestativa.
`;

/**
 * Ferramenta que a IA pode chamar para salvar no banco
 */
const tools = [
  {
    functionDeclarations: [
      {
        name: 'salvar_evento_no_firestore',
        description: 'Salva um ou mais eventos no banco de dados Firestore do Sintonizaí.',
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
                  local: { 
                    type: 'object', 
                    properties: { nome: { type: 'string' } }
                  },
                  endereco: { type: 'string' },
                  tipo_evento: { type: 'string' },
                  estilo: { type: 'string', description: 'Gênero/Estilo musical ou cultural' },
                  gratuito: { type: 'boolean' },
                  preco: { type: 'string' },
                  linkIngresso: { type: 'string' },
                  imagemUrl: { type: 'string' }
                },
                required: ['nome', 'dataInicio', 'local', 'tipo_evento', 'estilo']
              }
            }
          },
          required: ['eventos']
        }
      }
    ]
  }
];

export async function chatComGemini(mensagens: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<ActionResponse<string>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools as any
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    const lastMessage = mensagens[mensagens.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;

    // Verificar se a IA quer chamar uma ferramenta
    const calls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);

    if (calls && calls.length > 0) {
      const results = [];
      
      for (const call of calls) {
        if (call.functionCall?.name === 'salvar_evento_no_firestore') {
          const { eventos } = call.functionCall.args as any;
          
          try {
            const batch = adminDb.batch();
            const colRef = adminDb.collection('eventos');
            
            for (const evento of eventos) {
              const docRef = colRef.doc();
              batch.set(docRef, {
                ...evento,
                status: 'pendente', // Por segurança, entra como pendente para revisão humana se desejar
                criadoEm: new Date().toISOString(),
                origem: 'IA_ASSISTANT'
              });
            }
            
            await batch.commit();
            results.push({ name: call.functionCall.name, response: { success: true, count: eventos.length } });
          } catch (e: any) {
            results.push({ name: call.functionCall.name, response: { success: false, error: e.message } });
          }
        }
      }

      // Enviar os resultados das ferramentas de volta para a IA gerar a resposta final
      const finalResult = await chat.sendMessage([{ functionResponse: results[0] }] as any);
      return createSuccessResponse(finalResult.response.text());
    }

    return createSuccessResponse(response.text());
  } catch (error) {
    return handleActionError(error, 'chatComGemini');
  }
}
