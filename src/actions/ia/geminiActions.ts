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
                  local: { type: 'object', properties: { nome: { type: 'string' }, lat: { type: 'number' }, lng: { type: 'number' } } },
                  endereco: { type: 'string' },
                  tipo_evento: { type: 'string', description: 'Tipo principal (legado)' },
                  categoria: { type: 'string', description: 'Categoria principal (legado)' },
                  estilo: { type: 'string', description: 'Estilo/vibe principal (legado)' },
                  categorias: { type: 'array', items: { type: 'string' }, description: 'Lista de categorias do evento (múltiplas permitidas)' },
                  tiposEvento: { type: 'array', items: { type: 'string' }, description: 'Lista de tipos do evento (múltiplos permitidos)' },
                  vibracoes: { type: 'array', items: { type: 'string' }, description: 'Lista de estilos/vibrações do evento (múltiplos permitidos)' },
                  gratuito: { type: 'boolean' },
                  preco: { type: 'string' },
                  linkIngresso: { type: 'string' },
                  notaCuradoria: { type: 'string', description: 'Nota ou aviso importante da curadoria para o público (máx 100 caracteres)' },
                  acessibilidade: { type: 'boolean', description: 'Se o evento possui acessibilidade para pessoas com deficiência' }
                },
                required: ['nome', 'dataInicio', 'local', 'categorias', 'tiposEvento']
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
Você é o Copiloto de Curadoria do app Sintonizaí. Sua missão é ser um assistente técnico preciso, objetivo e eficiente para o curador humano.

COMPORTAMENTO GERAL (CRÍTICO):
1. SEJA CONCISO: Responda com o mínimo de palavras necessário. Use bullet points. Não seja excessivamente cerimonioso.
2. PERGUNTE PRIMEIRO: Se o usuário enviar um bloco de JSON ou lista de eventos sem instrução clara, pergunte imediatamente: "O que deseja fazer com este bloco?" (Opções: Salvar, Validar, Buscar Duplicados).
3. OBJETIVIDADE: Se o usuário pedir algo vago, faça perguntas curtas e diretas para clarificar.
4. FEEDBACK DE FERRAMENTAS: Sempre que usar uma ferramenta, informe o resultado exato (ex: "X eventos salvos, Y duplicados ignorados"). Nunca diga que salvou se a ferramenta retornar erro.

REGRAS DE VALIDAÇÃO:
1. DATAS: DD/MM/AAAA (exibição), YYYY-MM-DD (salvamento). Valide se é futura.
2. HORÁRIOS: HH:MM ou "Confirmar no link". NUNCA ADIVINHE OU ESTIME. Se houver dúvida, mantenha "Confirmar no link".
3. DUPLICIDADE: A ferramenta 'salvar_evento_no_firestore' JÁ CHECA DUPLICATAS AUTOMATICAMENTE. Não é necessário usar 'buscar_eventos' antes de salvar novos eventos, a menos que o usuário peça explicitamente para verificar antes.
4. TAXONOMIA: Siga estritamente Categoria > Tipo > Estilo conforme as listas fornecidas.
5. ACESSIBILIDADE: Tente identificar se o evento é acessível (PCD). Se houver menção a "acessibilidade", "PCD", "rampas", "elevadores", defina como true.
6. CAPACIDADE MASSIVA: Você pode processar lotes de até 350 eventos por vez. Para lotes maiores, divida o processamento e informe o progresso (ex: "Processando 1-50 de 350...").
7. FORMATOS FLEXÍVEIS: Se receber múltiplos blocos JSON soltos (mesmo sem estar dentro de um array []), interprete-os como um lote de eventos e use 'salvar_evento_no_firestore' para processá-los todos de uma vez.

NOTA DA CURADORIA (notaCuradoria):
- Máximo 100 caracteres.
- Use para avisos vitais (troca de local, link externo, etc).
- SEMPRE pergunte se o curador quer adicionar uma nota antes de salvar lotes.

ESTRUTURA JSON ESPERADA (Exemplo):
{
  "nome": "Nome do Evento",
  "descricao": "Texto descritivo",
  "dataInicio": "YYYY-MM-DD",
  "horario": "HH:MM",
  "local": { "nome": "Nome do Local", "lat": -23.55, "lng": -46.63 },
  "categorias": ["Música"],
  "tiposEvento": ["Show"],
  "vibracoes": ["Rock"],
  "categoria": "Música",
  "tipo_evento": "Show",
  "estilo": "Rock",
  "gratuito": true,
  "preco": "R$ 50,00",
  "linkIngresso": "https://...",
  "notaCuradoria": "Aviso importante aqui",
  "acessibilidade": true
}

CAPACIDADES ESPECIAIS:
1. BUSCA: Pesquise eventos existentes usando 'buscar_eventos'.
2. AJUSTE MASSIVO: Para alterações em lote, use 'propor_ajuste_massivo'. Você deve orientar o curador sobre como organizar melhor os dados existentes baseando-se na nova taxonomia.
3. EXTRAÇÃO: Use 'extrair_info_url' para processar links externos.

VALORES VÁLIDOS (Use EXATAMENTE estes nomes de itens):
CATEGORIAS:
${categoriasTexto}

ESTILOS/RITMOS:
${estilosTexto}

TIPOS DE EVENTOS:
${tiposTexto}

FLUXO DE TRABALHO:
- Para ajustes massivos: 1. Busque os eventos -> 2. Proponha a alteração -> 3. Aguarde confirmação (exiba status "Trabalhando...").
- Para novos eventos: 1. Valide dados -> 2. Cheque duplicidade -> 3. Salve.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: instruction,
      tools: tools as any,
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    let lastMessageParts: any[] = [{ text: mensagens[mensagens.length - 1].parts[0].text }];
    if (imagem) {
      lastMessageParts.push({ inlineData: { data: imagem.data, mimeType: imagem.mimeType } });
    }

    console.log(`[Gemini Request] Enviando solicitação...`);
    const result = await chat.sendMessage(lastMessageParts);
    const response = await result.response;
    const calls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);

    if (calls && calls.length > 0) {
      const results = [];
      let propostaAjuste = null;

      for (const call of calls) {
        const { name, args } = call.functionCall as any;
        console.log(`[Tool Call] Executando: ${name}`, args);

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

              // Comparar usando campos novos ou antigos para resiliência de duplicidade
              const dCat = d.categoria || (d.categorias && d.categorias[0]) || '';
              const evCat = ev.categoria || (ev.categorias && ev.categorias[0]) || '';
              const categoriaMatch = dCat === evCat;

              const dTipo = d.tipo_evento || (d.tiposEvento && d.tiposEvento[0]) || '';
              const evTipo = ev.tipo_evento || (ev.tiposEvento && ev.tiposEvento[0]) || '';
              const tipoMatch = dTipo === evTipo;

              return dataMatch && horarioMatch && categoriaMatch && tipoMatch;
            });

            if (!jaExiste) {
              const categoriasArray = Array.isArray(ev.categorias) ? ev.categorias : (ev.categoria ? [ev.categoria] : []);
              const tiposArray = Array.isArray(ev.tiposEvento) ? ev.tiposEvento : (ev.tipo_evento ? [ev.tipo_evento] : []);
              const vibracoesArray = Array.isArray(ev.vibracoes) ? ev.vibracoes : (ev.estilo ? ev.estilo.split(',').map((s: any) => s.trim()).filter(Boolean) : []);

              await colRef.add({
                ...ev,
                categoria: categoriasArray[0] || 'todos',
                tipo_evento: tiposArray[0] || 'Outros',
                estilo: vibracoesArray.join(', '),
                categorias: categoriasArray,
                tiposEvento: tiposArray,
                vibracoes: vibracoesArray,
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

      const finalResult = await chat.sendMessage(results.map(r => ({ functionResponse: r })) as any);
      const text = finalResult.response.text();

      return createSuccessResponse(text, { propostaAjuste } as any);
    }

    return createSuccessResponse(response.text());
  } catch (error) {
    return handleActionError(error, 'chatComGemini');
  }
}
