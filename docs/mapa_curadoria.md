# Mapa Curadoria Sintonizaí - v2.8

## 🧠 Inteligência & Ingestão
- **Gemini Chat (v3.0)**: Upgrade para `gemini-3-flash-preview`. Copiloto de alta performance para processamento em massa (até 350 eventos/lote). Proibição de estimativas e checagem de duplicidade rigorosa.
- **Controles IA Premium**: Botões de comando rápido (Quick Actions), Stop, Regenerar e Editar última mensagem, otimizados para uso mobile.
- **Nota da Curadoria**: Propriedade `notaCuradoria` (máx 100 caracteres) para avisos com destaque visual (amarelo/alerta) no App.
- **Taxonomia Hierárquica**: Gestão 3 níveis (Categoria > Tipo > Estilo) em cascata.
- **Estabilidade de Mídias**: Gestão centralizada de `storage.rules` com acesso público para a pasta `/eventos/`, eliminando quebras de imagem na galeria e previews.
 a coleção `eventos` do Firestore, compartilhada com o app mobile.

## Diagrama de Fluxo

```
┌───────────────────┐
│   Painel CMS      │ ← Server Actions (Firebase Admin)
│   (Next.js 16)    │ ↔ Agente IA (Gemini 3 Flash)
└────────┬──────────┘
         │ CRUD & Function Calling
         ▼
┌───────────────────┐
│   Firestore       │ ← coleção "eventos" (762+ itens)
│   (sintonizai-    │ ← coleção "banners_destaque"
│    app-prod)      │ ← coleção "usuarios" (perfis e créditos)
│                   │ ← coleção "indicacoes" (sugestões comunidade)
└────────┬──────────┘
         │ onSnapshot (real-time)
         ▼
┌───────────────────┐
│   App Mobile      │ ← React Native / Expo
│   (app-eventos)   │ ← UI Netflix Style
└───────────────────┘
```

## Estrutura de Pastas

- `app/(auth)/` — Login, Cadastro (fora do dashboard)
- `app/(dashboard)/` — Dashboard, Curadoria, Eventos, Usuários, Banners, Galeria, API Docs
- `src/actions/` — Server Actions por domínio com `ActionResponse` padronizado
- `src/hooks/` — Custom hooks por módulo (useAuth, useEventos, useInsights, useFiltros)
- `src/services/` — Firebase Admin (server-only), Firebase Client, Gemini
- `src/contexts/` — AuthContext, ThemeContext
- `src/store/` — Zustand Stores (`useUIStore` para layout global)
- `src/types/` — Interfaces centralizadas (Evento, Usuario, Banner, Common)
- `src/utils/` — normalizeEvento, errorHandlers, dateUtils
- `src/components/` — Componentes UI por domínio (layout, dashboard, curadoria)
- `src/components/common/` — Componentes globais (`EmptyState`, `ErrorBoundary`, `Modal`, `ConfirmModal`, `ImageUpload`)
- `src/components/eventos/` — Componentes específicos de eventos (`EventDetailModal`)
- `src/components/curadoria/` — Componentes de fluxo (`IndicationsModal`, `UserSelector`)

## Segurança

- Auth: Firebase Auth (email/senha)
- Cadastro: Requer `CHAVE_MASTER` para criação de conta
- Server Actions: Executam no servidor com Firebase Admin SDK
- Variáveis sensíveis: Apenas no `.env` (não expostas ao client)

## Ecossistema Dinâmico
- [x] **Integridade de Dados**: Implementada trava de duplicidade (Nome + Data + Horário) na criação manual e via IA.
- [x] **Filtros Avançados**: Adicionada filtragem por coluna com popovers (Nome, Local, Tipo, Data, Status).
- [x] **Taxonomia Hierárquica**: Implementação total de 3 níveis (**Categoria > Tipo > Estilo**) com seletores em cascata no modo manual e validação estrita no modo IA.
- [x] **Auditoria de Qualidade**: Sistema de selos visuais e filtros de integridade (Taxonomia, Imagem, Conteúdo) na listagem de eventos.
- [x] **Dashboard 2.0**: Gráficos e KPIs que reportam falhas de taxonomia e distribuição real por categoria.

## Inteligência e Automação
- **IA Agente 2.3**: O Agente Gemini possui agora lógica de contingência para falhas de imagem (ignora erro e avisa o usuário) e segue rigorosamente a taxonomia em cascata.
- **Auxílio ao Curador**: Modal "Exemplo JSON" integrado ao chat para padronização imediata do input de dados.
- **Filtros de Auditoria**: Novos KPIs no painel de eventos permitem identificar em segundos itens sem classificação completa.

## 🚀 Arquitetura de Dados Dinâmicos
O ecossistema opera sobre metadados totalmente dinâmicos:
- **Coleções de Configuração**: `configuracoes_tipo_evento`, `configuracoes_categorias` e `configuracoes_estilos`.
- **Cascata de Dados**: Lógica de dependência onde a Categoria selecionada filtra os Tipos disponíveis, que por sua vez filtram os Estilos.

## 📱 Experiência Mobile & Acessibilidade
- **Interface Touch-First**: Ações críticas (Bulk Edit, Chat Actions, Galeria) otimizadas para dispositivos touch, eliminando dependência de hover.
- **Sidebar & Paginação**: Navegação responsiva com sidebar retrátil e paginação mobile-friendly.

## Evoluções Concluídas
- [x] **Taxonomia Hierárquica 2.0**: Sincronização absoluta entre App, Portal e IA via metadados dinâmicos e seletores em cascata.
- [x] **IA Agentic v3**: Implementação de `gemini-3-flash-preview` com controles de regeneração, edição e stop.
- [x] **Mass Actions**: Capacidade de processar e salvar lotes massivos de até 350 eventos com um único comando IA.

## Evoluções Futuras
1. Notificações push automáticas segmentadas por interesse de Estilo/Categoria.
2. Exportação avançada de relatórios (PDF/Excel) para produtores de eventos.
3. Sistema de Rollback e histórico de edições por administrador.
