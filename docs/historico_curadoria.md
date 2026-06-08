# Histórico de Desenvolvimento — Curadoria Sintonizaí

## [4.5] — 2026-06-07 — Transição de Taxonomia e Formulários Multivalorados
### ✨ Funcionalidades
- **Upgrade de Formulários (`EventoForm.tsx`, `ManualCuradoria.tsx`)**: Substituição dos dropdowns select convencionais por listas visuais com botões de múltipla escolha para categorias e tipos de eventos, sincronizados com o modelo multivalorado de arrays de strings.
- **Filtros e Dependências Inteligentes (Cascading)**: O seletor de tipos de eventos filtra dinamicamente as opções com base nas categorias selecionadas pelo curador. O seletor de estilos/vibrações filtra as opções com base nos tipos de eventos selecionados.
- **Mapeamento de Preview do App**: O simulador móvel de cards foi adaptado para renderizar dinamicamente múltiplos chips de categorias, tipos e estilos/vibrações.

## [4.4] — 2026-05-19 — Edição em Massa Ampliada (Categorias)
### ✨ Funcionalidades
- **Edição de Categorias em Lote**: Adicionada a capacidade de atualizar a categoria de múltiplos eventos simultaneamente no `BulkEditModal`.
- **Dropdown Hierárquico**: Renderização premium das categorias agrupadas por grupo de interesse (`optgroups`) integrado ao hook `useCategorias`.
- **Validação de Atualização**: O processo garante flexibilidade permitindo manter a categoria atual ao atualizar outros metadados, ou atualizar apenas a categoria.

## [4.3] — 2026-05-18 — Métricas de Grades Compartilhadas
### ✨ Funcionalidades
- **Mapeamento de Importações**: Integração de acompanhamento na coleção `programacoes_compartilhadas` para coletar dados de viralidade.
- **Engajamento Social**: Exibição e contagem incremental da métrica `totalImportacoes` sempre que um usuário importa uma grade no aplicativo móvel.

## [4.2] — 2026-05-15 — Integração Google Maps
### ✨ Funcionalidades
- **LocationPicker Visual**: Implementação de mapa interativo nos formulários de evento (`EventoForm` e `BulkEditModal`).
- **Busca por Endereço**: Integração com Google Places Autocomplete para preenchimento rápido de coordenadas via busca textual.
- **Ajuste Fino**: Possibilidade de arrastar o marcador no mapa para definir Latitude e Longitude com precisão milimétrica.
- **UX Dark Mode**: Mapa estilizado para combinar com a estética premium do painel administrativo.

## [4.1] — 2026-05-15 — Geocorreção e Inteligência de Localização
### ✨ Funcionalidades
- **Filtro de Localização**: Novo card "Localização" no dashboard de eventos que detecta automaticamente eventos sem latitude/longitude.
- **Edição em Massa Geográfica**: O `BulkEditModal` permite definir coordenadas para múltiplos eventos de uma vez.
- **Preservação de Dados**: Uso de notação de ponto no Firestore (`local.lat`) para evitar sobrescrita acidental de outros dados do local.

## [4.0] — 2026-05-13 — Estabilidade e Intuição em Automações
### ✨ Funcionalidades
- **Banner Sync**: Sincronização automática entre Gestão de Banners e Automações.
- **Agendamento Único**: Suporte a disparos em datas específicas.
- **Dashboard v3.0**: Módulo de notificações unificado com badge dinâmico.
