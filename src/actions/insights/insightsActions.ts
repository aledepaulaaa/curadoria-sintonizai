'use server';

import { adminDb } from '@/src/services/firebaseAdmin';
import { KpiData, ChartData } from '@/src/types/common';
import { handleActionError, createSuccessResponse, type ActionResponse } from '@/src/utils/errorHandlers';

export async function buscarInsights(): Promise<ActionResponse<{
  kpis: KpiData[];
  categorias: ChartData[];
  gratuitos: ChartData[];
  topShared: { id: string, nome: string, total: number }[];
  pushStats: {
    totalClicks: number;
    byPlatform: ChartData[];
    byDay: ChartData[];
  }
}>> {
  try {
    const [eventosSnap, usersSnap, sharesSnap, pushSnap] = await Promise.all([
      adminDb.collection('eventos').get(),
      adminDb.collection('usuarios').get(),
      adminDb.collection('metricas_compartilhamento').orderBy('total', 'desc').limit(10).get(),
      adminDb.collection('metricas_push').get()
    ]);

    const eventos = eventosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
    // Processar Top Shared
    const topShared = sharesSnap.docs.map(doc => {
      const data = doc.data();
      const evento = eventos.find(e => e.id === data.eventoId);
      return {
        id: data.eventoId,
        nome: evento ? (evento as any).nome : 'Evento Removido',
        total: data.total || 0
      };
    });

    const totalShares = sharesSnap.docs.reduce((acc, d) => acc + (d.data().total || 0), 0);
    
    // Média de Idade (precisamos disso antes dos KPIs)
    let somaIdades = 0;
    let totalComIdade = 0;
    const hoje = new Date();
    usersSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.dataNascimento) {
        const nasc = new Date(d.dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
          idade--;
        }
        if (idade > 0 && idade < 120) {
          somaIdades += idade;
          totalComIdade++;
        }
      }
    });
    const mediaIdade = totalComIdade > 0 ? Math.round(somaIdades / totalComIdade) : 0;

    if (eventos.length === 0) {
      return createSuccessResponse({
        kpis: [
          { label: 'Total Eventos', valor: 0, icone: 'Ticket' },
          { label: 'Eventos Ativos', valor: 0, icone: 'TrendingUp' },
          { label: 'Usuários', valor: usersSnap.size, icone: 'Users' },
          { label: 'Shares', valor: totalShares, icone: 'Share2' },
          { label: 'Idade Média', valor: mediaIdade, icone: 'Calendar' },
        ],
        categorias: [],
        gratuitos: [],
        topShared: [],
        pushStats: {
          totalClicks: 0,
          byPlatform: [],
          byDay: []
        }
      });
    }

    const agora = new Date().toISOString().split('T')[0];
    const ativos = (eventos as any[]).filter((e) => (e.dataInicio || '').split('T')[0] >= agora);

    // KPIs
    const kpis: KpiData[] = [
      { label: 'Total Eventos', valor: eventos.length, icone: 'Ticket' },
      { label: 'Eventos Ativos', valor: ativos.length, icone: 'TrendingUp' },
      { label: 'Usuários', valor: usersSnap.size, icone: 'Users' },
      { label: 'Shares', valor: totalShares, icone: 'Share2' },
      { label: 'Idade Média', valor: mediaIdade, icone: 'Calendar' },
    ];

    // Distribuição por categoria (Nova Taxonomia: Categoria > Tipo > Estilo)
    const catMap: Record<string, number> = {};
    let semTaxonomia = 0;

    eventos.forEach((e: any) => {
      if (e.categoria) {
        catMap[e.categoria] = (catMap[e.categoria] || 0) + 1;
      } else {
        semTaxonomia++;
        const fallback = e.tipo_evento || 'Sem Classificação';
        catMap[fallback] = (catMap[fallback] || 0) + 1;
      }
    });

    const categorias: ChartData[] = Object.entries(catMap)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor);

    // Gratuitos vs Pagos
    const gratis = eventos.filter((e: any) => e.gratuito === true).length;
    const gratuitos: ChartData[] = [
      { nome: 'Gratuito', valor: gratis, cor: '#4CAF50' },
      { nome: 'Pago', valor: eventos.length - gratis, cor: '#FF9800' },
    ];

    // Processar Métricas de Push
    const totalClicks = pushSnap.size;
    const platformMap: Record<string, number> = { ios: 0, android: 0 };
    const dayMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    pushSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.plataforma) platformMap[d.plataforma.toLowerCase()] = (platformMap[d.plataforma.toLowerCase()] || 0) + 1;
      if (d.diaSemana !== undefined) dayMap[d.diaSemana] = (dayMap[d.diaSemana] || 0) + 1;
    });

    const pushStats = {
      totalClicks,
      byPlatform: [
        { nome: 'iOS', valor: platformMap.ios || 0, cor: '#000000' },
        { nome: 'Android', valor: platformMap.android || 0, cor: '#3DDC84' }
      ],
      byDay: [
        { nome: 'Dom', valor: dayMap[0] },
        { nome: 'Seg', valor: dayMap[1] },
        { nome: 'Ter', valor: dayMap[2] },
        { nome: 'Qua', valor: dayMap[3] },
        { nome: 'Qui', valor: dayMap[4] },
        { nome: 'Sex', valor: dayMap[5] },
        { nome: 'Sáb', valor: dayMap[6] }
      ]
    };

    return createSuccessResponse({ kpis, categorias, gratuitos, topShared, pushStats });
  } catch (error) {
    return handleActionError(error, 'buscarInsights');
  }
}
