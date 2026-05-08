# Histórico de Desenvolvimento — Curadoria Sintonizaí

## [1.6] — 2026-05-08 — IA Ativa e Padronização de Dados
### ✨ Funcionalidades
- **IA Agente (Active Agent):** O chat com Gemini agora utiliza *Function Calling* para invocar a ferramenta `salvar_evento_no_firestore`. A IA pode cadastrar eventos em lote de forma autônoma e segura.
- **Padronização Cultural:** Campo `estilo` adicionado ao schema de eventos, permitindo que a IA classifique cada sugestão (ex: MPB, Samba, Sertanejo) para alimentar o motor de recomendação do App.

### 🛠️ Melhorias Técnicas
- **Firebase Admin Integration:** Configuração robusta para que a IA execute operações privilegiadas no servidor.
- **System Instructions:** Refinamento dos comandos da IA para garantir que todos os campos obrigatórios (incluindo o novo `estilo`) sejam preenchidos em cada sugestão.

---

## [1.5] — 2026-05-08 — Curação Pro e Estabilização de Ecossistema
### ✨ Funcionalidades
- **Tabelas Inteligentes (CMS):** Implementada ordenação por coluna e filtros avançados em tempo real para eventos e usuários.
- **Deep Search CMS:** Tags de "Tipo" e nomes de "Local" agora são clicáveis para filtragem instantânea na tabela.
- **Gestão de Filtros Pro:** Possibilidade de renomear grupos de filtros, editar rótulos e criar novos grupos dinamicamente que refletem instantaneamente no App.
- **Analytics de Engajamento:** Dashboard "Top 10 Compartilhados" para monitorar o alcance orgânico.

### 🛠️ Melhorias Técnicas
- **Blindagem do App:** Sanitização defensiva no `useEventStore.ts` para evitar crashes por dados sujos no Firestore.
- **Background Filtering (Mobile):** Integração do `InteractionManager` no motor de filtros para 60fps na UI.
- **Security Rules:** Atualização completa das permissões do Firestore para acesso público às configurações de curadoria.
- **Firebase Config:** Criação de `firestore.rules` e `firebase.json` para facilitar o deployment contínuo.

---

## 2026-05-08 — v1.4 — Ecossistema Dinâmico e Engajamento

### Filtros e Sincronização Mobile
- **Filtros Dinâmicos**: Migração de categorias, ritmos e vibes de constantes "hardcoded" para a coleção `configuracoes/filtros` no Firestore. O CMS agora possui uma interface (via `useFiltros`) para gerenciar estes valores que refletem instantaneamente no App Mobile.
- **useEventStore (Mobile)**: Implementada lógica de carregamento assíncrono de filtros (`carregarFiltros`) no boot do aplicativo para garantir que o usuário sempre veja as opções de filtragem mais recentes definidas pela curadoria.

### Deep Linking e Compartilhamento
- **Android App Links**: Configuração expandida do `app.json` com `intentFilters` para os domínios `sintonizai.com.br` e `sintonizai.app.br`, garantindo que links compartilhados abram diretamente no evento correspondente.
- **Sharing Metrics**: Implementado rastreamento de engajamento no App. Cada compartilhamento ("Me Sintonizei" ou "Tô Chegando") dispara um registro na coleção `metricas_compartilhamento`, permitindo ao admin visualizar quais eventos geram mais interesse viral.

### Curadoria Manual 2.0
- **Gallery Selector**: Criado componente modal `GallerySelector` que permite escolher imagens diretamente do Firebase Storage durante a criação ou edição de um evento, eliminando a necessidade de copiar/colar URLs manualmente.
- **Mobile Preview**: Otimização do simulador de card no formulário de curadoria manual para refletir fielmente o design do app mobile em tempo real.

### Notificações Push
- **Permissão Contextual**: Refinamento do fluxo de permissão no Android. O toggle no perfil agora dispara o pedido de sistema real (`requestPermissionsAsync`) e persiste o estado de ativação no perfil do usuário no Firestore.

## 2026-05-08 — v1.3 — Estabilização Final e CRUD Avançado

### Tema e Visibilidade (Modo Claro/Escuro)
- **CSS Globais**: Reestruturação total do `globals.css` para garantir contraste perfeito em modo claro. Textos agora utilizam cinzas profundos (`zinc-900`) e fundos brancos puros, eliminando o efeito de "letras sumindo".
- **ThemeContext**: Sincronização forçada da classe `.dark` em ambos `html` e `body` para garantir que componentes externos (como modais e bibliotecas de terceiros) herdem o tema corretamente.

### Gestão de Eventos## [2026-05-08] - Ingestão em Massa e Otimização do CMS
- **Ingestão de Dados**: Processamento dos 3 blocos de JSON (762 itens no total) com deduplicação. Adicionados 340 novos eventos.
- **Sincronização de Filtros**: Reconciliação total das categorias, ritmos e vibes entre o Mobile App e o CMS.
- **Gestão de Lote**: Criação do `ImportManager` com preview de dados antes da importação.
- **Pagination**: Implementada seletor dinâmico de itens por página (20, 50, 100, 250, 500) em Eventos e Usuários para maior flexibilidade na gestão.
de edição integrado.
- **ImageUpload**: Novo componente para upload direto de arquivos locais (PNG/JPG/WEBP) para o Firebase Storage com preview em tempo real e barra de progresso.
- **Firebase Storage Fix**: Resolvido erro de `getFiles is not a function` através do uso correto do método `.bucket()` no SDK administrativo.

### Dashboard e Métricas Reais
- **Compartilhamentos**: Substituído KPI irrelevante de "Push Tokens" por "Total de Compartilhamentos", agregando a métrica real de engajamento dos eventos.
- **Iconografia**: Adicionado suporte para o ícone `Share2` no sistema de KPIs.

### Curadoria com IA
- **Gemini IA Tab**: Criada estrutura base para automação de curadoria via IA. As abas foram refatoradas para suportar o novo fluxo de trabalho e manter consistência visual com o restante do painel.

## 2026-05-07 — v1.0 — Fundação Completa

### Infraestrutura
- Projeto Next.js 16 com App Router + Turbopack
- Tailwind CSS v4 mantido, Framer Motion para animações
- Firebase Admin SDK configurado via variáveis de ambiente
- Firebase Client SDK para autenticação browser-side

### Arquitetura Implementada
- **Clean Code**: Componentes máximo 200 linhas, sem lógica na UI
- **SOLID**: Server Actions separadas por domínio (`actions/eventos/`, `actions/banners/`, etc.)
- **DRY**: Types centralizados em `src/types/`, hooks isolados por módulo
- **Context API + Zustand**: AuthContext e ThemeContext para estado global

### Páginas Criadas
- `/login` — Login com Firebase Auth
- `/cadastro` — Cadastro com validação de Chave Mestra
- `/dashboard` — KPIs (total eventos, ativos, usuários, push tokens) + gráficos
- `/curadoria` — Formulário manual + importação em massa JSON
- `/eventos` — Tabela paginada com busca e CRUD
- `/usuarios` — Listagem de usuários
- `/anuncios` — CRUD de banners de destaque
- `/galeria` — Browser de Firebase Storage
- `/api-docs` — Documentação das Server Actions

### Pipeline de Normalização
- `normalizeEvento.ts`: Unifica schemas dos 3 blocos JSON
  - Normalização de keys (PascalCase → camelCase)
  - Correção de datas BR (DD/MM/YYYY → ISO)
  - Limpeza de caracteres inválidos
  - Mapeamento de categorias

## 2026-05-08 — v1.2 — Estabilização e Profissionalização
- Identificados 4 problemas nos filtros do app (`useEventStore.ts`)
- Filtros `tipo_evento` usam `.includes()` em strings → categorias com espaço/acento não casam
- Mapeamento estilo↔categoria usa `if/else if` sequencial
- Taxonomia do Firestore (22+ tipos) não bate com os chips hardcoded do app
- **Resolução planejada para após painel completo**

### Build
- ✅ `npm run build` — 0 erros, 10 rotas compiladas
- TypeScript OK, páginas estáticas geradas com sucesso

### Iconografia e Identidade Visual
- **Lucide React**: Substituição total de emojis por ícones vetoriais consistentes em todo o painel (Sidebar, Header, Dashboard, Login).
- **Design Premium**: Implementação de micro-interações e estados ativos com gradientes dinâmicos e transparências (glassmorphism).

### Tratamento de Erros e UX
- **ActionResponse**: Padronização do retorno de Server Actions para evitar vazamento de erros técnicos no console do navegador.
- **Global Error Handling**: Criado utilitário `handleActionError` para mapear erros comuns (Firestore, Auth) em mensagens amigáveis.
- **Empty States**: Implementado componente `EmptyState` com ícone `Ghost` para lidar elegantemente com coleções vazias ou buscas sem resultados.

### Estado Global e Layout
- **Zustand (`useUIStore`)**: Implementado gerenciamento de estado global para controle da Sidebar.
- **Collapsible Sidebar**: Adicionada funcionalidade de recolher o menu lateral em telas grandes para otimizar a área de trabalho.
- **Mobile Toggle**: Sincronização entre o menu hambúrguer e o estado colapsado para consistência visual entre dispositivos.

### Correções Críticas de Backend
- **Firebase Admin SDK**: Fix definitivo do erro de `Invalid PEM formatted message` através de parser robusto que trata caracteres de escape e aspas do `.env`.
- **Server Protection**: Adicionado `server-only` e correta declaração `'use server'` em todas as ações para garantir que o SDK administrativo nunca seja incluído no bundle do cliente.
- **Layout Shift**: Correção de erros de renderização do Recharts (Negative height/width) utilizando estado de montagem condicional (`mounted`).

## 2026-05-08 — v1.1 — Correções e Recuperação de Senha

### Ajustes de UI/UX
- Criada página `/recuperar` com integração `sendPasswordResetEmail` do Firebase.
- Corrigidas todas as referências de logos quebradas (trocado `icon_dark.png` por `icone.svg` e `logo_dark.png`).
- Favicon atualizado para `icone.svg`.
- Removido warning de `scroll-behavior: smooth` com `data-scroll-behavior="smooth"`.

### Responsividade
- Otimizado para telas pequenas (suporte até 320px) com ajustes de padding e layouts flexíveis.
- Sidebar mobile-first com overlay e animações.
- Tabelas com scroll horizontal para preservar legibilidade em dispositivos móveis.

### Gestão de Perfil
- Adicionado campo "Nome Completo" no cadastro de administradores.
- Implementada atualização automática do `displayName` no Firebase Auth durante o registro.
- Header agora reflete o nome do administrador logado e utiliza sua inicial no avatar.

### Segurança e UI de Acesso
- Adicionado botão de alternar visibilidade ("olho") nos campos de senha (Login e Cadastro) e Chave Mestra.
- O botão "Criar Conta" agora permanece desativado até que o campo da Chave Mestra seja preenchido, evitando envios acidentais.

### Infraestrutura e Dashboard
- Implementada inicialização robusta do Firebase Admin SDK com tratamento avançado de `privateKey` (PEM format).
- Corrigido erro de dimensionamento do Recharts no Dashboard adicionando containers estáveis e margens de compensação.
- Unificação das instâncias do Firebase Admin para evitar "Too many apps" error.
