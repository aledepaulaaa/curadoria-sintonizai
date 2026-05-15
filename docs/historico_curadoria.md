# Histórico de Desenvolvimento — Curadoria Sintonizaí

## [4.1] — 2026-05-15 — Geocorreção e Inteligência de Localização
### ✨ Funcionalidades
- **Filtro de Localização**: Novo card "Localização" no dashboard de eventos que detecta automaticamente eventos sem latitude/longitude.
- **Edição de Coordenadas (Individual)**: Adicionados campos de Latitude e Longitude no `EventoForm` para ajuste manual preciso.
- **Edição em Massa Geográfica**: O `BulkEditModal` agora permite definir coordenadas para múltiplos eventos de uma vez, facilitando o ajuste de locais recorrentes.
- **Preservação de Dados**: Uso de notação de ponto para atualizações no Firestore, garantindo que o nome do local não seja sobrescrevido ao ajustar coordenadas em lote.

## [4.0] — 2026-05-13 — Estabilidade e Intuição em Automações
### ✨ Funcionalidades
- **UX de Automação Refinada**: Melhoria nos nomes das opções de destino ("Ao clicar, levar para") para tornar o fluxo mais intuitivo (Deep Links dinâmicos vs fixos).
- **Precisão do Contador (Sync)**: Refatoração do `useNotificationStore` para garantir que o contador do sino (`naoLidas`) reflita instantaneamente as deleções e marcações de leitura em massa.
- **Limpeza de Estado Local**: Implementada atualização imediata do estado de notificações após "Marcar todas como lidas", eliminando latência visual.

## [3.9] — 2026-05-13 — Gestão Avançada de Comunidade e Notificações
### ✨ Funcionalidades
- **Exclusão em Massa (Hub da Comunidade)**: Implementado sistema de seleção múltipla para Reports e Indicações, permitindo limpeza em lote ou individual.
- **Notificações Unificadas**: O modal do sino agora agrupa Reports de Erros e Indicações de Eventos em uma única visualização organizada.
- **Marcador de Leitura Global**: Adicionada função "Marcar todas como lidas" no modal de notificações, resolvendo inconsistências no contador do sino.
- **Persistência de Status**: Transição de estados (analisado/visualizado) integrada ao Firestore para garantir sincronia entre usuários da curadoria.

## [3.8] — 2026-05-13 — Automação de Banners e Agendamento Único
### ✨ Funcionalidades
- **Sincronização de Pushes para Banners**: Agora, ao marcar "Notificar" na criação de um banner, o sistema cria automaticamente uma automação de push agendada.
- **Agendamento Único (One-time)**: Suporte a disparos em data e hora específica (`dataExecucao`), ideal para lançamentos de banners e eventos especiais.
- **Gestão de Ciclo de Vida**: Alterações ou exclusões de banners agora limpam automaticamente as automações de push vinculadas.
- **Correção de Inputs Controlados**: Estabilização dos campos de Timing e Frequência para evitar warnings de estado `undefined`.

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
