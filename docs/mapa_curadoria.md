# Mapa Curadoria Sintonizaí - v4.0

## 🧠 Inteligência & Ingestão
- **Image Editor (v1.0)**: Motor de corte (`react-easy-crop`) integrado ao upload. Força proporção 16:9 para eventos e 1:1 para perfis, garantindo integridade visual no App.
- **Gemini Chat (v3.1)**: Suporte a **formatos flexíveis** (JSONs soltos sem array). IA agora gerencia duplicidade via ferramenta, eliminando buscas redundantes.
- **Experiência Expansível**: Chat com modo **Full Screen** (`Maximize2`) e input redimensionável (`resize-y`) com fonte `mono` para edição técnica.
- **UX Mobile Premium**: Altura dinâmica `calc(100vh-240px)`, scroll interno travado, remoção de estados de hover e botões de **Cópia Rápida** em cada balão de mensagem.
- **Validação de Links Relaxada**: Motor de linking inteligente que prioriza a acessibilidade do evento (permite perfis de Instagram, Facebook e bios).
- **Controles IA Premium**: Botões de comando rápido (Quick Actions), Stop, Regenerar e Editar última mensagem, otimizados para uso mobile.
- **Nota da Curadoria**: Propriedade `notaCuradoria` (máx 100 caracteres) para avisos com destaque visual (amarelo/alerta) no App.
- **Taxonomia Hierárquica**: Gestão 3 níveis (Categoria > Tipo > Estilo) em cascata.
- **Estabilidade de Mídias**: Gestão centralizada de `storage.rules` com acesso público para a pasta `/eventos/`, eliminando quebras de imagem na galeria e previews.
- **Hub da Comunidade (v1.0)**: Central de gestão de reports e indicações. Evolução para a **v1.1** com suporte a **Batch Deletion** (Exclusão em Massa) e seleção múltipla, facilitando a limpeza de dados obsoletos.
- **Push Notification Composer**: Interface premium para envio de mensagens broadcast ou segmentadas. Inclui **User Selector inteligente** com busca em tempo real (Nome/UID) e pre-carregamento de perfis. Suporte a deep links (Evento/Perfil) e preview mobile em tempo real.
- **Notificação Visual (Sino) & Unificação (v3.9)**: Ícone de sino animado com contador dinâmico. O modal de notificações agora é unificado, exibindo **Reports de Erro** e **Indicações** simultaneamente, com função de "Marcar todas como lidas" para limpeza global do badge.
- **Seletores Inteligentes (v3.7)**: Componente `DataSelector` integrado ao fluxo de Automações e Banners, eliminando a necessidade de IDs manuais e facilitando o vínculo de dados por busca textual.
- **Banner Sync & One-time Scheduling (v3.8)**: Motor de sincronização automática entre a Gestão de Banners e o Módulo de Automações. Suporte a agendamentos de disparo único com data específica.
