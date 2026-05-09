'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';
import { adminDb } from '@/src/services/firebaseAdmin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `
Você é o Assistente de Curadoria do app Sintonizaí.
Sua função é transformar informações brutas em eventos estruturados de alta qualidade.

REGRAS CRÍTICAS DE DADOS:
1. "tipo_evento": Escolha o mais adequado: Show, Festival, Teatro, Exposição, Cinema, Sarau, Feira, Workshop, Stand-up, Infantil, Outros.
2. "estilo": OBRIGATÓRIO. Se o usuário esquecer, você DEVE analisar a descrição, sugerir um estilo (ex: Samba, Rock, MPB, Eletrônico) e perguntar: "Notei que faltou o estilo, sugeri 'Samba' com base no nome/descrição. Podemos seguir assim?".
3. "gratuito": boolean. Se o preço for R$ 0 ou contiver "Grátis", marque como true.
4. "dataInicio": Use o formato ISO YYYY-MM-DD.

PROATIVIDADE E INTERAÇÃO:
- Se faltar qualquer propriedade essencial (nome, dataInicio, local, tipo_evento, estilo), NÃO chame a ferramenta 'salvar_evento_no_firestore' imediatamente. Em vez disso, peça ao usuário para completar a informação ou confirme sua sugestão.
- Sempre que salvar, avise que os eventos entraram como "Pendentes" para revisão final na Dashboard.

FERRAMENTAS DISPONÍVEIS:
- Use 'salvar_evento_no_firestore' somente quando tiver todos os campos obrigatórios validados com o usuário.
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

export async function chatComGemini(
  mensagens: { role: 'user' | 'model', parts: { text: string }[] }[],
  imagem?: { data: string, mimeType: string }
): Promise<ActionResponse<string>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Buscar filtros atuais para injetar na instrução
    const filtrosSnap = await adminDb.collection('configuracoes_filtros').get();
    let filtrosTexto = '';
    filtrosSnap.forEach(doc => {
      const data = doc.data();
      filtrosTexto += `- ${data.label}: ${data.itens?.join(', ')}\n`;
    });

    const instruction = `
Você é o Assistente de Curadoria do app Sintonizaí.
Sua função é transformar informações brutas (texto ou imagens) em eventos estruturados.

FILTROS ATUAIS DO SISTEMA (USE APENAS ESTES):
${filtrosTexto || 'Nenhum filtro configurado no banco.'}

REGRAS CRÍTICAS DE DADOS:
1. "tipo_evento": Deve ser uma das categorias listadas acima.
2. "estilo": OBRIGATÓRIO. Use os ritmos/estilos listados acima.
3. "gratuito": boolean.
4. "dataInicio": Formato ISO YYYY-MM-DD.

SE O USUÁRIO ENVIAR UMA IMAGEM:
- Analise o texto na imagem (print de rede social, cartaz, etc).
- Extraia Nome, Data, Local e Descrição.
- Se a imagem for de um evento recorrente sem data específica, peça a data ao usuário.

FERRAMENTAS DISPONÍVEIS:
- Use 'salvar_evento_no_firestore' somente quando tiver todos os campos obrigatórios validados.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: instruction,
      tools: tools as any
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    // Se houver imagem, a última mensagem deve incluir a parte da imagem
    let lastMessageParts: any[] = [{ text: mensagens[mensagens.length - 1].parts[0].text }];
    
    if (imagem) {
      lastMessageParts.push({
        inlineData: {
          data: imagem.data,
          mimeType: imagem.mimeType
        }
      });
    }

    const result = await chat.sendMessage(lastMessageParts);
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
                status: 'pendente',
                criadoEm: new Date().toISOString(),
                origem: 'IA_ASSISTANT_VISION'
              });
            }
            
            await batch.commit();
            results.push({ name: call.functionCall.name, response: { success: true, count: eventos.length } });
          } catch (e: any) {
            results.push({ name: call.functionCall.name, response: { success: false, error: e.message } });
          }
        }
      }

      const finalResult = await chat.sendMessage([{ functionResponse: results[0] }] as any);
      return createSuccessResponse(finalResult.response.text());
    }

    return createSuccessResponse(response.text());
  } catch (error) {
    return handleActionError(error, 'chatComGemini');
  }
}
