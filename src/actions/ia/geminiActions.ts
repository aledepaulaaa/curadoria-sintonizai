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
                  linkIngresso: { type: 'string' },
                  notaCuradoria: { type: 'string', description: 'Nota ou aviso importante da curadoria para o público (máx 100 caracteres)' }
                },
                required: ['nome', 'dataInicio', 'local', 'tipo_evento', 'categoria']
              }
            }
          },
          required: ['eventos']
        }
      },
      {
        name: 'extrair_info_url',
        description: 'Extrai metadados (título, descrição, imagem) de uma URL fornecida.',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'A URL do site ou rede social para extrair informações' }
          },
          required: ['url']
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

    // Buscar Metadados Atuais (Todas as Taxonomias agora são agrupadas)
    const [catSnap, estSnap, tipSnap] = await Promise.all([
      adminDb.collection('configuracoes_categorias').orderBy('ordem', 'asc').get(),
      adminDb.collection('configuracoes_estilos').orderBy('ordem', 'asc').get(),
      adminDb.collection('configuracoes_tipo_evento').orderBy('ordem', 'asc').get()
    ]);

    const formatarGrupo = (doc: any) => {
      const data = doc.data();
      return `- [Grupo: ${data.label}]: ${(data.itens || []).join(', ')}`;
    };

    let categoriasTexto = catSnap.docs.map(formatarGrupo).join('\n');
    let estilosTexto = estSnap.docs.map(formatarGrupo).join('\n');
    let tiposTexto = tipSnap.docs.map(formatarGrupo).join('\n');

    // Lista plana para validação rápida pela IA
    const todosItens = [
      ...catSnap.docs.flatMap(d => d.data().itens || []),
      ...estSnap.docs.flatMap(d => d.data().itens || []),
      ...tipSnap.docs.flatMap(d => d.data().itens || [])
    ];

    const instruction = `
Você é o Copiloto de Curadoria do app Sintonizaí.
Sua missão é ajudar o curador a manter o banco de dados organizado, validado e de altíssima qualidade.

REGRAS DE VALIDAÇÃO (CRÍTICO):
1. DATAS: Use sempre o formato DD/MM/AAAA para exibição e YYYY-MM-DD para salvar. Valide se a data é futura.
2. HORÁRIOS: Use sempre o formato HH:MM (ex: 20:00). Se for vago (ex: "oito da noite"), converta.
3. DUPLICIDADE: Antes de salvar um novo evento, use 'buscar_eventos' pelo nome. Se já existir um evento com o mesmo nome na mesma data, alerte o curador e NÃO salve duplicado.
4. TAXONOMIA (CASCATA): O evento DEVE seguir a hierarquia: Categoria > Tipo de Evento > Estilo.
   - A Categoria deve existir na lista abaixo.
   - O Tipo de Evento deve pertencer à Categoria escolhida.
   - O Estilo deve pertencer ao Tipo de Evento escolhido.
5. INTEGRIDADE DE DADOS E VALORES:
   - NÃO ADIVINHE OU ESTIME HORÁRIOS/PREÇOS: Se a fonte original indicar "Confirmar no link", "A confirmar" ou algo incerto, você DEVE manter exatamente esse texto no JSON. NUNCA tente estimar (ex: 23:59 ou 10:00) para "satisfazer" o formato.
   - Campos Obrigatórios com Incerteza: Se um campo obrigatório (como data) for totalmente desconhecido, avise o usuário. Para horários e preços, o texto "Confirmar no link" é perfeitamente aceitável e preferível a uma estimativa errada.
   - Links de Imagem: Se o link da imagem estiver quebrado ou for inacessível, deixe o campo imagemUrl vazio ("") e informe o motivo.
6. NOTA DA CURADORIA:
   - Você pode incluir um campo "notaCuradoria" (máx 100 caracteres) com avisos importantes (ex: "Chegue cedo!", "Entrada permitida apenas com RG"). 
   - SEMPRE que estiver salvando eventos (individuais ou massa), pergunte ao curador se ele deseja adicionar alguma nota de observação para os eventos antes de finalizar.

ESTRUTURA JSON ESPERADA (Exemplo):
{
  "nome": "Nome do Evento",
  "descricao": "Texto descritivo",
  "dataInicio": "YYYY-MM-DD",
  "horario": "HH:MM",
  "local": { "nome": "Nome do Local", "lat": -23.55, "lng": -46.63 },
  "categoria": "Música",
  "tipo_evento": "Show",
  "estilo": "Rock",
  "gratuito": true,
  "preco": "R$ 50,00",
  "linkIngresso": "https://...",
  "notaCuradoria": "Aviso importante aqui"
}

CAPACIDADES ESPECIAIS:
1. BUSCA: Pesquise eventos existentes usando 'buscar_eventos'.
2. AJUSTE MASSIVO: Para alterações em lote, use 'propor_ajuste_massivo'. Você deve orientar o curador sobre como organizar melhor os dados existentes baseando-se na nova taxonomia.
3. EXTRAÇÃO: Use 'extrair_info_url' para processar links externos.

VALORES VÁLIDOS (Use EXATAMENTE estes nomes de itens):
CATEGORIAS (Por Grupos):
${categoriasTexto}

ESTILOS/RITMOS (Por Grupos):
${estilosTexto}

TIPOS DE EVENTOS (Por Grupos):
${tiposTexto}

FLUXO DE TRABALHO:
- Para ajustes massivos: 1. Busque os eventos -> 2. Proponha a alteração -> 3. Aguarde confirmação (exiba status "Trabalhando...").
- Para novos eventos: 1. Valide dados -> 2. Cheque duplicidade -> 3. Salve.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
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
          const colRef = adminDb.collection('eventos');
          let adicionados = 0;
          let duplicados = 0;

          // Processamento sequencial para checar duplicidade robusta
          for (const ev of eventos) {
            // Busca básica por nome para filtrar no cliente (mais resiliente a falta de índices compostos)
            const querySnap = await colRef
              .where('nome', '==', ev.nome)
              .get();

            const diaNovo = ev.dataInicio?.split('T')[0];
            
            const jaExiste = querySnap.docs.some(doc => {
              const d = doc.data();
              const dataMatch = d.dataInicio?.split('T')[0] === diaNovo;
              const horarioMatch = d.horario === ev.horario;
              const categoriaMatch = d.categoria === ev.categoria;
              const tipoMatch = d.tipo_evento === ev.tipo_evento;
              const estiloMatch = d.estilo === ev.estilo;
              return dataMatch && horarioMatch && categoriaMatch && tipoMatch && estiloMatch;
            });

            if (!jaExiste) {
              await colRef.add({
                ...ev,
                status: 'pendente',
                criadoEm: new Date().toISOString(),
                origem: 'IA_ASSISTANT'
              });
              adicionados++;
            } else {
              duplicados++;
            }
          }

          results.push({ 
            name, 
            response: { 
              success: true, 
              count: adicionados, 
              skipped: duplicados,
              message: `${adicionados} eventos novos salvos, ${duplicados} ignorados por já existirem.` 
            } 
          });
        }

        if (name === 'extrair_info_url') {
          const { url } = args;
          try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await res.text();
            
            const getMeta = (tag: string) => {
              const regex = new RegExp(`<meta[^>]+(?:property|name)="${tag}"[^>]+content="([^"]+)"`, 'i');
              const match = html.match(regex);
              if (match) return match[1];
              // Tentar o outro formato (content antes do property)
              const regexAlt = new RegExp(`<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${tag}"`, 'i');
              const matchAlt = html.match(regexAlt);
              return matchAlt ? matchAlt[1] : null;
            };

            const info = {
              titulo: getMeta('og:title') || getMeta('twitter:title') || '',
              descricao: getMeta('og:description') || getMeta('twitter:description') || '',
              imagem: getMeta('og:image') || getMeta('twitter:image') || '',
              url: url
            };

            results.push({ name, response: { success: true, ...info } });
          } catch (e) {
            results.push({ name, response: { success: false, error: 'Não foi possível acessar a URL' } });
          }
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
