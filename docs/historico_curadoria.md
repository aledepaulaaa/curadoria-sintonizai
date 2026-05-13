# Histórico de Desenvolvimento — Curadoria Sintonizaí

## [3.7] — 2026-05-13 — Seletores Inteligentes e UX de Automação
### ✨ Funcionalidades
- **Seletores de Dados (Busca Ativa)**: Implementado componente `DataSelector` que permite buscar usuários e eventos em tempo real diretamente no formulário de automação.
- **Vínculo por Nome**: Não é mais necessário colar IDs manuais; a curadoria agora seleciona usuários e eventos buscando pelo nome com preview de foto/email.
- **Otimização de Performance**: Implementado debounce nas buscas do Firestore para garantir fluidez e baixo consumo de cota.

## [3.6] — 2026-05-13 — Módulo de Automações (Régua de Engajamento)
### ✨ Funcionalidades
- **Gestão de Automações**: Nova interface para criação de réguas de comunicação "estilo iFood".
- **Gatilhos Inteligentes**: Suporte a gatilhos comportamentais (usuário inativo, ingresso acabando) e temporais (periódicos).
- **Formulário Dinâmico**: Interface que adapta campos baseada no tipo de automação selecionada.
- **Preview de Push**: Visualização em tempo real da notificação configurada.
- **Configuração de Frequência**: Agendamento de disparos diários, semanais ou únicos.
