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
│   Firestore       │ ← coleção "eventos" (713+ itens)
│   (sintonizai-    │ ← coleção "banners_destaque"
│    app-prod)      │ ← coleção "usuarios" (preferências)
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

## Segurança

- Auth: Firebase Auth (email/senha)
- Cadastro: Requer `CHAVE_MASTER` para criação de conta
- Server Actions: Executam no servidor com Firebase Admin SDK
- Variáveis sensíveis: Apenas no `.env` (não expostas ao client)

## Ecossistema Dinâmico

- **Filtros Dinâmicos (Pro)**: Gerenciamento total de grupos de filtros, rótulos e itens via coleção `configuracoes_filtros`. Suporte a reordenamento, edição de nomes e criação de novos grupos que sincronizam instantaneamente com o motor de busca do App.
- **Métricas de Engajamento**: Dashboards em tempo real com "Top 10 Eventos Mais Compartilhados" e agregador de viralidade.
- **Deep Linking**: Configuração universal (`assetlinks.json`) para abertura direta de eventos compartilhados nos domínios `.com.br` e `.app.br`.

## Inteligência e Automação
- **IA Curadoria Ativa**: O Chat com Gemini foi convertido em um **Agente Funcional**. Através de *Function Calling*, a IA pode persistir eventos diretamente no Firestore usando o Firebase Admin SDK, garantindo padronização de dados (campo `estilo`) e produtividade em escala.

## Evoluções Futuras

1. Sistema de "Rollback" para eventos deletados acidentalmente.
2. Notificações push automáticas ao publicar eventos de alta relevância (Segmentação por interesse).
3. Exportação avançada de relatórios (PDF/Excel) para produtores de eventos.
