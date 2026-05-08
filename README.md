# Sintonizaí — Painel de Curadoria CMS

Painel administrativo para gestão centralizada de eventos culturais do **Sintonizaí**.

## Stack Tecnológica

| Item | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Estilo | Tailwind CSS v4 |
| Animação | Framer Motion |
| Estado | Context API + Zustand |
| Backend | Firebase Admin SDK (Server Actions) |
| IA | Google Gemini API |
| Auth | Firebase Auth + Chave Mestra |
| Gráficos | Recharts |
| Export | jsPDF + xlsx |

## Funcionalidades

- **Dashboard**: KPIs em tempo real (eventos, usuários, push tokens) + gráficos de distribuição
- **Curadoria**: Formulário manual + importação em massa (JSON) com pipeline de normalização
- **Eventos**: Tabela paginada com busca, filtros e CRUD completo
- **Usuários**: Visualização de usuários cadastrados
- **Banners**: CRUD de banners de destaque com preview visual
- **Galeria**: Browser de arquivos do Firebase Storage
- **API Docs**: Documentação das Server Actions disponíveis

## Arquitetura

```
src/
├── actions/      → Server Actions (CRUD por domínio)
├── hooks/        → Custom hooks (lógica por módulo)
├── services/     → Firebase Admin/Client, Gemini
├── contexts/     → Auth + Theme (Context API)
├── types/        → Interfaces centralizadas
├── components/   → UI separada por domínio
└── utils/        → Normalização, datas
```

## Como Executar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

## Variáveis de Ambiente

Criar arquivo `.env` na raiz com:
- `FIREBASE_PROJECT_ID` — ID do projeto Firebase
- `FIREBASE_PRIVATE_KEY` — Chave privada do Service Account
- `FIREBASE_CLIENT_EMAIL` — Email do Service Account
- `NEXT_PUBLIC_FIREBASE_*` — Config do Firebase Client SDK
- `GOOGLE_CLOUD_API` — Chave da API Gemini
- `CHAVE_MASTER` — Chave secreta para cadastro de admins

## Conexão com o App Mobile

O painel se conecta ao **mesmo Firestore** (`seu-projeto-firebase`). Qualquer evento criado/editado no painel reflete automaticamente no app via `onSnapshot`. O painel é o "cérebro lógico" — o app apenas consome.
