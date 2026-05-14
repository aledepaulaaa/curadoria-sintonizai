import { adminDb } from '@/src/services/firebaseAdmin';
import { Automacao } from '@/src/types/automacao';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { NextResponse } from 'next/server';

const expo = new Expo();

/**
 * Endpoint de Execução de Automações
 * Deve ser chamado a cada minuto por um Cloud Scheduler
 * Ex: /api/automacoes/run?secret=SUA_CHAVE_AQUI
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // Proteção simples contra chamadas externas
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Obter hora atual no fuso de São Paulo (HH:mm e YYYY-MM-DD)
    const agora = new Date();
    const formatterHora = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const formatterData = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const horaAtualStr = formatterHora.format(agora); // "22:55"
    const dataAtualStr = formatterData.format(agora).split('/').reverse().join('-'); // "2026-05-13"
    const diaSemana = agora.getDay(); // 0 (Dom) a 6 (Sab)

    console.log(`[Automation Engine] Iniciando processamento em ${dataAtualStr} ${horaAtualStr}`);

    // 2. Buscar automações ativas
    const snapshot = await adminDb.collection('automacoes')
      .where('configuracao.ativa', '==', true)
      .get();

    const automacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automacao));
    const automacoesParaExecutar = automacoes.filter(a => {
      const config = a.configuracao;
      
      // Verifica se o horário bate (ignora se for gatilho de evento imediato)
      if (config.horarioExecucao !== horaAtualStr) return false;

      // Verifica frequência
      if (config.frequencia === 'uma_vez') {
        return config.dataExecucao === dataAtualStr;
      }
      if (config.frequencia === 'semanal' && config.diasSemana) {
        return config.diasSemana.includes(diaSemana);
      }
      
      return true; // Diária ou outros casos
    });

    if (automacoesParaExecutar.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhuma automação para este horário.' });
    }

    console.log(`[Automation Engine] Processando ${automacoesParaExecutar.length} automações...`);

    const resultados = [];

    // 3. Processar cada automação
    for (const automacao of automacoesParaExecutar) {
      const { destinatarios, gatilho, condicoes, mensagem, destino } = automacao;
      let tokens: { token: string; userId: string }[] = [];

      // Identificar tokens dos destinatários
      if (destinatarios.tipo === 'especifico' && destinatarios.userId) {
        const tokenDoc = await adminDb.collection('pushTokens').doc(destinatarios.userId).get();
        if (tokenDoc.exists && tokenDoc.data()?.token) {
          tokens.push({ token: tokenDoc.data()?.token, userId: destinatarios.userId });
        }
      } else if (destinatarios.tipo === 'todos') {
        const tokenSnap = await adminDb.collection('pushTokens').get();
        tokenSnap.forEach(doc => {
          if (doc.data()?.token) {
            tokens.push({ token: doc.data()?.token, userId: doc.id });
          }
        });
      }

      if (tokens.length === 0) {
        console.log(`[Automation Engine] Nenhum token encontrado para ${automacao.nome}`);
        continue;
      }

      // Preparar mensagens (considerando recomendações se necessário)
      const messages: ExpoPushMessage[] = [];
      
      for (const item of tokens) {
        let corpoFinal = mensagem.corpo;
        let tituloFinal = mensagem.titulo;
        let pushData: any = { automacaoId: automacao.id, ...destino };

        // Lógica de Recomendação Geográfica
        if (gatilho === 'recomendacao_geografica') {
          // Busca usuário para pegar a localização
          const userDoc = await adminDb.collection('usuarios').doc(item.userId).get();
          const userLocation = userDoc.data()?.localizacao;

          if (userLocation && userLocation.latitude && userLocation.longitude) {
            // Busca eventos próximos
            const eventosSnap = await adminDb.collection('eventos')
              .where('status', '==', 'publicado')
              .limit(10)
              .get();

            let melhorEvento: any = null;
            let menorDistancia = Infinity;

            eventosSnap.forEach(eDoc => {
              const eData = eDoc.data();
              // No projeto, as coordenadas ficam em local.lat e local.lng
              if (eData.local?.lat && eData.local?.lng) {
                const dist = calcularDistancia(
                  userLocation.latitude, userLocation.longitude,
                  eData.local.lat, eData.local.lng
                );
                if (dist < menorDistancia && dist <= (condicoes.distanciaMaxKm || 50)) {
                  menorDistancia = dist;
                  melhorEvento = { id: eDoc.id, ...eData };
                }
              }
            });

            if (melhorEvento) {
              // Usar .nome em vez de .titulo conforme interface Evento
              tituloFinal = tituloFinal.replace('[nome_evento]', melhorEvento.nome);
              corpoFinal = corpoFinal.replace('[nome_evento]', melhorEvento.nome);
              pushData.eventoId = melhorEvento.id;
              pushData.tipo = 'evento';
            }
          }
        }

        if (Expo.isExpoPushToken(item.token)) {
          messages.push({
            to: item.token,
            sound: 'default',
            title: tituloFinal,
            body: corpoFinal,
            data: pushData,
          });
        }
      }

      // Enviar os Pushes
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }

      // 4. Atualizar metadados da automação
      const updateData: any = {
        ultimaExecucao: agora.toISOString(),
      };

      // Se for "uma vez", desativa após rodar
      if (automacao.configuracao.frequencia === 'uma_vez') {
        updateData['configuracao.ativa'] = false;
      }

      await adminDb.collection('automacoes').doc(automacao.id).update(updateData);
      resultados.push({ id: automacao.id, nome: automacao.nome, status: 'disparado', total: messages.length });
    }

    return NextResponse.json({ success: true, resultados });

  } catch (error: any) {
    console.error('[Automation Engine] Erro crítico:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Haversine para cálculo de distância em KM
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
