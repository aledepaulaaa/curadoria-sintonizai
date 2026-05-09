# Mapa Arquitetural — Curadoria Sintonizaí

## Visão Geral

Painel CMS web para curadoria de eventos do Sintonizaí. Atua como fonte de verdade para a coleção `eventos` do Firestore, compartilhada com o app mobile.

## Diagrama de Fluxo

```
┌───────────────────┐
│   Painel CMS      │ ← Server Actions (Firebase Admin)
│   (Next.js 16)    │ ↔ Agente IA (Gemini 1.5 Flash)
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
- **Taxonomia Pro (3 Níveis)**: Gerenciamento independente de "Tipos de Evento", "Categorias" e "Estilos" via coleções Firestore. Sincronização em tempo real entre App, IA e Portal.
- **Edição em Massa (Bulk Edit)**: Interface integrada na listagem de eventos para alteração em lote de metadados taxonômicos, otimizando o fluxo de curadoria.
- **Upload Múltiplo (Lote)**: Galeria de mídia com suporte a upload de até 20 arquivos simultâneos, reduzindo o tempo de gestão de ativos.

## Inteligência e Automação
- **IA Agente 2.1**: O Agente Gemini utiliza *Function Calling* para persistir eventos seguindo rigorosamente a taxonomia de 3 níveis. O campo "Vibe" foi eliminado em favor de dados estruturados.
- **Curadoria Comunitária**: Notificações em tempo real para novas indicações, permitindo conversão imediata para eventos oficiais com atribuição de crédito.
- **Gestão Demográfica**: Dashboard com análise de idade média e gestão completa de perfis de usuários.

## 🚀 Arquitetura de Dados Dinâmicos
O ecossistema opera sobre metadados totalmente dinâmicos:
- **Coleções de Configuração**: `configuracoes_tipo_evento`, `configuracoes_categorias` e `configuracoes_estilos`.
- **Sincronização**: Alterações no portal refletem instantaneamente no motor de busca do App e no conhecimento contextual da IA.

## 📱 Experiência Mobile & Acessibilidade
- **Interface Touch-First**: Ações críticas (Bulk Edit, Chat Actions, Galeria) otimizadas para dispositivos touch, eliminando dependência de hover.
- **Sidebar & Paginação**: Navegação responsiva com sidebar retrátil e paginação mobile-friendly.

## Evoluções Futuras
1. Notificações push automáticas segmentadas por interesse de Estilo/Categoria.
2. Exportação avançada de relatórios (PDF/Excel) para produtores de eventos.
3. Sistema de Rollback e histórico de edições por administrador.
