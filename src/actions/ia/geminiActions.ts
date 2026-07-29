'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';
import { query } from '@/src/services/db';
import { verificarDuplicado } from '@/src/actions/eventos/eventosActions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Ferramentas que a IA de Curadoria pode chamar
 */
const tools = [
  {
    functionDeclarations: [
      {
        name: 'disparar_coleta_agent',
        description: 'Dispara a coleta/raspagem automática de eventos para o Agent Sintonizai buscando por região, cidade, palavra-chave ou URL no Brasil.',
        parameters: {
          type: 'object',
          properties: {
            fonte: { type: 'string', enum: ['instagram', 'sympla'], description: 'Origem da raspagem (padrão: sympla)' },
            cidade: { type: 'string', description: 'Cidade ou estado do Brasil (ex: Porto Alegre, Salvador, Rio de Janeiro)' },
            query: { type: 'string', description: 'Termo de busca, categoria ou tipo de evento (ex: teatro, show, musica)' },
            limite: { type: 'number', description: 'Quantidade de eventos desejados por região (padrão: 10)' },
            targetUrl: { type: 'string', description: 'URL direta de perfil/evento se fornecida (opcional)' }
          },
          required: ['fonte']
        }
      },
      {
        name: 'buscar_eventos',
        description: 'Busca eventos no banco de dados PostgreSQL com filtros opcionais.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Termo de busca no nome ou descrição' },
            tipo_evento: { type: 'string' },
            categoria: { type: 'string' },
            status: { type: 'string', enum: ['pendente', 'aprovado', 'rejeitado'] }
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
        description: 'Salva um ou mais eventos novos no banco de dados PostgreSQL.',
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
                  cidade: { type: 'string', description: 'Cidade/Região do Brasil' },
                  tipo_evento: { type: 'string' },
                  categoria: { type: 'string' },
                  estilo: { type: 'string' },
                  categorias: { type: 'array', items: { type: 'string' } },
                  tiposEvento: { type: 'array', items: { type: 'string' } },
                  vibracoes: { type: 'array', items: { type: 'string' } },
                  gratuito: { type: 'boolean' },
                  preco: { type: 'string' },
                  linkIngresso: { type: 'string' },
                  notaCuradoria: { type: 'string' },
                  acessibilidade: { type: 'boolean' }
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

    const lastUserMessage = mensagens[mensagens.length - 1]?.parts[0]?.text || '';

    // Detecção direta de URLs para acionamento rápido do Agent Sintonizai
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lastUserMessage.match(urlRegex);
    if (urls && urls.length > 0) {
      const targetUrl = urls[0];
      if (targetUrl.includes('instagram.com') || targetUrl.includes('sympla.com')) {
        const source = targetUrl.includes('sympla.com') ? 'sympla' : 'instagram';
        const agentUrl = process.env.AGENT_API_URL || 'http://localhost:3005';
        const agentApiKey = process.env.AGENT_API_KEY || 'sintonizai_secret_api_key_2026';

        console.log(`[Agent Trigger] Disparando scraping para ${source}: ${targetUrl} via ${agentUrl}`);

        try {
          const res = await fetch(`${agentUrl}/api/v1/agent/trigger`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': agentApiKey,
            },
            body: JSON.stringify({
              source,
              targetUrl,
              priority: 'low',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const textResponse = `🤖 **[Assistente de Curadoria]** Recebido! O processamento do link foi iniciado em segundo plano.

*   **URL:** ${targetUrl}
*   **Fila:** scraping-jobs (RabbitMQ)
*   **Job ID:** \`${data.jobId}\`

A coleta está rodando na fila em nuvem. Quando finalizar, os eventos estruturados pela IA aparecerão abaixo e na central de notificações formatados em estilo amigável de compartilhamento para sua revisão.`;

            return createSuccessResponse(textResponse, { jobEnfileirado: true, jobId: data.jobId } as any);
          }
        } catch (err: any) {
          console.error('[Agent Trigger Error]:', err);
        }
      }
    }

    const instruction = `
Você é o Copiloto de Curadoria inteligente e autônomo do app Sintonizaí. Sua missão é dialogar com o curador humano, entender suas solicitações de eventos culturais pelo Brasil e acionar as raspagens automatizadas do Agent Sintonizai.

REGRAS DE OURO DE COMPORTAMENTO E FEEDBACK:
1. BUSCA AUTÔNOMA INTELIGENTE: Quando a pessoa usuária solicitar eventos para qualquer cidade, estado ou tema no Brasil (ex: "5 eventos de música em São Paulo e 5 em Belo Horizonte"), você DEVE chamar a ferramenta "disparar_coleta_agent" para cada cidade/região solicitada. Você NÃO precisa de links manuais para fazer a busca.
2. CONFIRMAÇÃO DE SUCESSO DA FERRAMENTA:
   - Quando a ferramenta "disparar_coleta_agent" retornar { success: true }, NUNCA diga que houve erro técnico e NUNCA peça para fornecer links ou URLs.
   - Responda confirmando com clareza e entusiasmo que a solicitação foi enfileirada e que a busca automatizada já iniciou em segundo plano para cada uma das cidades/categorias.
   - Avise a equipe de curadoria que em instantes os cartões dos eventos coletados aparecerão na tela no formato de compartilhamento para revisão, edição ou aprovação.
3. LINGUAGEM INCLUSIVA E ABRANGENTE: Use sempre linguagem profissional, acolhedora e neutra quanto ao gênero (evite expressões como "fique tranquilo" ou "seja bem-vindo". Prefira "tudo pronto", "acompanhe com tranquilidade", "boas-vindas", "ótimo trabalho").
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: instruction,
      tools: tools as any,
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const chat = model.startChat({
      history: mensagens.slice(0, -1),
    });

    let lastMessageParts: any[] = [{ text: lastUserMessage }];
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
        console.log(`[Tool Call] Executando: ${name}`, args);

        if (name === 'disparar_coleta_agent') {
          const { fonte, cidade, query: queryParam, limite, targetUrl } = args;
          const agentUrl = process.env.AGENT_API_URL || 'http://localhost:3005';
          const agentApiKey = process.env.AGENT_API_KEY || 'sintonizai_secret_api_key_2026';

          try {
            const jobIds: string[] = [];
            const cidadeClean = (cidade || 'sp').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

            // 1. Disparar raspagem no Sympla
            const resSympla = await fetch(`${agentUrl}/api/v1/agent/trigger`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': agentApiKey,
              },
              body: JSON.stringify({
                source: 'sympla',
                targetUrl: targetUrl && targetUrl.includes('sympla') ? targetUrl : undefined,
                cidade,
                query: queryParam,
                limite: limite || 5,
                priority: 'low',
              }),
            });
            if (resSympla.ok) {
              const dS = await resSympla.json();
              jobIds.push(dS.jobId);
            }

            // 2. Disparar raspagem no Instagram (Fonte Primária Paralela)
            const resInsta = await fetch(`${agentUrl}/api/v1/agent/trigger`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': agentApiKey,
              },
              body: JSON.stringify({
                source: 'instagram',
                targetUrl: targetUrl && targetUrl.includes('instagram') ? targetUrl : `https://www.instagram.com/explore/tags/eventos${cidadeClean}/`,
                cidade,
                query: queryParam,
                limite: limite || 5,
                priority: 'low',
              }),
            });
            if (resInsta.ok) {
              const dI = await resInsta.json();
              jobIds.push(dI.jobId);
            }

            results.push({
              name,
              response: {
                success: true,
                jobIds,
                message: `Coletas enfileiradas nas fontes primárias (Sympla e Instagram) para ${cidade || 'Brasil'} (Termo: ${queryParam || 'Geral'}). Jobs: ${jobIds.join(', ')}`
              }
            });
          } catch (err: any) {
            results.push({ name, response: { success: false, error: err.message } });
          }
        }

        if (name === 'buscar_eventos') {
          const { query: queryStr, tipo_evento, categoria, status } = args;
          let sql = 'SELECT id, nome, tipo_evento, categoria, cidade FROM events WHERE 1=1';
          const params: any[] = [];
          let index = 1;

          if (tipo_evento) {
            sql += ` AND tipo_evento = $${index++}`;
            params.push(tipo_evento);
          }
          if (categoria) {
            sql += ` AND categoria::text = $${index++}`;
            params.push(categoria);
          }
          if (status) {
            sql += ` AND status::text = $${index++}`;
            params.push(status);
          }
          if (queryStr) {
            sql += ` AND (nome ILIKE $${index} OR descricao ILIKE $${index})`;
            params.push(`%${queryStr}%`);
            index++;
          }
          sql += ' LIMIT 50';

          const snap = await query(sql, params);
          results.push({ name, response: { success: true, count: snap.rows.length, eventos: snap.rows } });
        }

        if (name === 'propor_ajuste_massivo') {
          const { ids, campo, novoValor, justificativa } = args;
          const sql = `SELECT id, nome, "${campo}" as antigo FROM events WHERE id = ANY($1)`;
          const snap = await query(sql, [ids]);

          const preview = snap.rows.map(r => ({
            id: r.id,
            nome: r.nome,
            antigo: r.antigo,
            novo: novoValor
          }));

          propostaAjuste = { eventos: preview, campo, novoValor, justificativa };
          results.push({ name, response: { success: true, message: 'Proposta gerada. Aguardando confirmação do usuário.' } });
        }

        if (name === 'salvar_evento_no_firestore') {
          const { eventos } = args;
          let adicionados = 0;
          let duplicados = 0;

          const { criarEvento } = await import('@/src/actions/eventos/eventosActions');

          for (const ev of eventos) {
            const jaExiste = await verificarDuplicado(
              ev.nome,
              ev.dataInicio,
              ev.horario || '',
              ev.categoria,
              ev.tipo_evento,
              ev.estilo
            );

            if (!jaExiste) {
              const categoriasArray = Array.isArray(ev.categorias) ? ev.categorias : (ev.categoria ? [ev.categoria] : []);
              const tiposArray = Array.isArray(ev.tiposEvento) ? ev.tiposEvento : (ev.tipo_evento ? [ev.tipo_evento] : []);
              const vibracoesArray = Array.isArray(ev.vibracoes) ? ev.vibracoes : (ev.estilo ? ev.estilo.split(',').map((s: any) => s.trim()).filter(Boolean) : []);

              await criarEvento({
                ...ev,
                cidade: ev.cidade || 'São Paulo',
                categoria: categoriasArray[0] || 'todos',
                tipo_evento: tiposArray[0] || 'todos',
                estilo: vibracoesArray.join(', '),
                categorias: categoriasArray,
                tiposEvento: tiposArray,
                vibracoes: vibracoesArray,
                status: 'pendente',
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
