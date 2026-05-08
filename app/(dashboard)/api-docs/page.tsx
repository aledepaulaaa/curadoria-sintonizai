export default function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Documentation</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400 text-sm mb-4">Documentação das Server Actions disponíveis neste painel.</p>
        <div className="space-y-4">
          {[
            { metodo: 'POST', rota: 'actions/eventos/criarEvento', desc: 'Cria um evento no Firestore' },
            { metodo: 'POST', rota: 'actions/eventos/criarEventosBatch', desc: 'Cria eventos em lote (batch de 500)' },
            { metodo: 'GET', rota: 'actions/eventos/listarEventos', desc: 'Lista todos os eventos ordenados por data' },
            { metodo: 'PUT', rota: 'actions/eventos/atualizarEvento', desc: 'Atualiza um evento pelo ID' },
            { metodo: 'DELETE', rota: 'actions/eventos/deletarEvento', desc: 'Deleta um evento pelo ID' },
            { metodo: 'GET', rota: 'actions/insights/buscarInsights', desc: 'Retorna KPIs e dados para gráficos' },
            { metodo: 'GET', rota: 'actions/banners/listarBanners', desc: 'Lista banners de destaque' },
            { metodo: 'POST', rota: 'actions/banners/criarBanner', desc: 'Cria banner de destaque' },
            { metodo: 'GET', rota: 'actions/usuarios/listarUsuarios', desc: 'Lista todos os usuários' },
            { metodo: 'GET', rota: 'actions/storage/listarPastaStorage', desc: 'Lista arquivos e pastas do Storage' },
          ].map((api, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                api.metodo === 'GET' ? 'bg-green-500/20 text-green-400' :
                api.metodo === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                api.metodo === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>{api.metodo}</span>
              <code className="text-sm text-zinc-300 flex-1">{api.rota}</code>
              <span className="text-xs text-zinc-500 hidden md:block">{api.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
