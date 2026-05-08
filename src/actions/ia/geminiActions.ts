'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `
Você é o Assistente de Curadoria do app Sintonizaí.
Sua função é ajudar curadores de eventos a:
1. Formatar dados brutos em JSON compatível com o app.
2. Sugerir categorias, vibes e hashtags para eventos.
3. Melhorar descrições para torná-las mais atraentes.
4. Validar se um evento parece real ou spam.

Sempre responda de forma profissional e prestativa. 
Se for solicitado para gerar um JSON de evento, use esta estrutura:
{
  "nome": "string",
  "descricao": "string",
  "dataInicio": "YYYY-MM-DD",
  "horario": "string",
  "local": { "nome": "string" },
  "endereco": "string",
  "tipo_evento": "Show|Festival|Teatro|Exposição|Cinema|Sarau|Feira|Workshop|Stand-up|Infantil|Outros",
  "gratuito": boolean,
  "preco": "string",
  "linkIngresso": "string",
  "imagemUrl": "string"
}
`;

export async function chatComGemini(mensagens: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<ActionResponse<string>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    const lastMessage = mensagens[mensagens.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return createSuccessResponse(text);
  } catch (error) {
    return handleActionError(error, 'chatComGemini');
  }
}
