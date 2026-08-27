# FixDesk - Frontend

> Interface web do sistema de helpdesk interno **FixDesk**, responsável pela abertura e acompanhamento de chamados de suporte para as equipes de **TI** e **Fiscal**, dashboards analíticos com controle de acesso e navegação por área autorizada, e autenticação integrada ao backend Django.

## 1. Visão Geral e Arquitetura

- **Stack Tecnológica:** React 18, React Router DOM 6, Material UI 7, Chart.js 4, TailwindCSS 3 (prefixado com `tw-`), Styled Components 5, Emotion, Axios, YAML, Biome (linter/formatter) — v5.0.3
- **Padrão Arquitetural:** Component-Based Architecture com separação por domínio de feature — pages, components e contexts isolados por responsabilidade
- **Design Patterns Principais:** Context API (compartilhamento de estado global por escopo de rota), Provider Composition (layouts específicos por rota), Compound Components (janelas de ticket com subcomponentes de chat, filtro e upload)

## 2. Módulos e Componentes Principais

- **pages/login:** Tela de autenticação — captura credenciais e chama `POST /validation/` no backend Django. Armazena `user_allowed_areas` no `localStorage` e redireciona para `/helpdesk` ou `/dashboard` conforme a área autorizada do usuário.
- **pages/helpdesk:** Página principal de abertura de chamados — obtém token CSRF via `GET /helpdesk/get-token/`, exibe as áreas ativas fornecidas pelo `AreaContext`, carrega seletores de ocorrência/problema conforme a área e submete via `POST /helpdesk/submit-ticket/`. Envolvida pelo `HelpdeskLayout` (`AreaProvider`, `OptionsProvider` e `MessageProvider`).
- **pages/history:** Histórico de chamados do usuário ("Meus Chamados") — lista e filtra dinamicamente por área, ocorrência e problema em cascata os chamados solicitados exclusivamente pelo usuário autenticado (seja técnico ou comum), converte o ID da área responsável para seu código e permite abertura do detalhe de cada ticket. O hook `useCallback` inclui `getAreaCodeById` explicitamente nas dependências e o processamento de anexos trata `data.file` com validação de existência segura. Consome o endpoint seguro `GET /helpdesk/tickets/?context=history` (v2) e endpoints legados. Envolvida pelo `TicketLayout`, que também fornece o `AreaProvider`.
- **pages/dashboard:** Painel analítico para técnicos autorizados (`TI` e `Fiscal`) — exibe gráficos de pizza e histograma por área, lista tickets do painel da área, converte o ID da área responsável para seu código, expõe gerenciamento de usuários e submissão desacoplada de notas/anexos via `TechnicalDetails` (`POST /helpdesk/ticket/<id>/technical-details/message/` e `POST /helpdesk/ticket/<id>/technical-details/file/`). O parsing de técnicos e arquivos trata com resiliência valores `undefined` em `userData?.name` e `data.file`, além de converter `techsNames` via `Object.values(techsNames.current).flat()`. A busca de chamados (`GetNewTickets`) usa o endpoint v2 `/helpdesk/tickets/?context=dashboard&area=<área>` e lê os filtros de quantidade, status e ordem do `localStorage` com chaves prefixadas por área (`quantity_TI`, `status_Fiscal`, etc.). Possui `useEffect` com dependência `[selectedArea]` para recarregar tickets reativamente ao alternar a área ativa. Envolvida pelo `TicketLayout`.

- **components/ticket/openTicketWindow:** Componente central de visualização e interação com um chamado — exibe dados, chat entre usuário e técnico (polling via `setInterval`/`setTimeout` controlado por `stopFetchingRef`), upload de arquivos adicionais e alocação de equipamentos. O polling do chat é interrompido automaticamente quando o ticket é fechado ou pausado (`status === 'close'` ou `'stop'`). Recebe a prop `ticketAREA` (campo `respective_area` do ticket, ex: `"TI"` ou `"Fiscal"`) para filtrar corretamente a lista de técnicos disponíveis para transferência — diferente de `ticketSECTOR` (categoria do chamado, ex: `"Infraestrutura"`). Consome múltiplos endpoints de `/helpdesk/` e `/dashboard/`.
- **components/ticket/ticketsOptions:** Formulário de criação de chamado com seleção dinâmica de tipo de problema por setor, alocação de equipamento e agendamento. Consome `GET /helpdesk/equipaments-for-alocate/` e `GET /helpdesk/date-equipaments-alocate/`.
- **components/ticket/filter:** Componente de filtros avançados para histórico e painéis de atendimento — consome o endpoint `GET /helpdesk/tickets/` com suporte a selects em cascata (Setor → Ocorrência → Problema) e sanitização/mapeamento defensivo.
- **components/dashboard/dashboardPie:** Gráfico de pizza por setor/área — consome `GET /dashboard/get-dash-board-pie/<sector>`.
- **components/dashboard/dashboardBar:** Histograma por intervalo de dias (semana, mês, ano, histórico) — consome `GET /dashboard/get-dash-board-bar/<sector>/<range_days>`. A inicialização do gráfico Chart.js depende da condição `countAccess.current > 0` (e não `>= 0`) para evitar que dados idênticos ao estado inicial vazio causem renderização prematura e retorno antecipado.
- **components/general/navbar:** Barra de navegação global com menu dinâmico de alternância de área para técnicos multi-área (TI / Fiscal) e ação de logout via `POST /helpdesk/exit/` com token CSRF.
- **components/utility/excludeUser:** Modal de exclusão de usuário — consome `DELETE /dashboard-ti/exclude-user/<user>`.
- **components/loading:** Indicadores de carregamento (`loading.jsx`, `loadingChat.jsx`, `robotGlimpse.jsx`).
- **context/TicketContext:** Estado global dos tickets (lista, dados, filtros, paginação, ID do ticket aberto, tema do card, `changeTech` e `changeStatus` para sincronização de mudanças de técnico e status entre páginas). Compartilhado entre `history` e `dashboard`.
- **context/OptionsContext:** Estado do formulário de abertura de chamado (campos de texto por `useRef`, estados de alerta e reset). Compartilhado na rota `/helpdesk`.
- **context/AreaContext:** Busca uma única vez as áreas ativas em `GET /helpdesk/active-areas/` ao montar o provider, expõe `activeAreas`, `loadingAreas` e `getAreaCodeById(areaId)`, e compartilha esse catálogo entre Helpdesk, Histórico e Dashboard. Em caso de falha da API, mantém os consumidores funcionais e retorna o ID original na conversão.
- **context/FilterContext:** Estado do filtro de busca avançada (parâmetros de consulta e flag de disparo).
- **context/MessageContext:** Estado das mensagens de feedback ao usuário (toasts/alertas globais).
- **context/UserManagement:** Estado de gerenciamento de usuários (flag de abertura do modal e dados do usuário selecionado).

## 3. Estrutura de Pastas

```text
frontend/
├── public/                    # Arquivos estáticos públicos (index.html, favicon)
├── src/
│   ├── App.jsx                # Definição de rotas (createBrowserRouter) e layouts por rota
│   ├── index.js               # Entrypoint React — monta o root e injeta favicon via window global
│   ├── index.css              # Estilos globais base
│   ├── constants/
│   │   └── ticketCatalog.js   # Catálogo de ocorrências e problemas por área
│   ├── images/                # Assets de imagem (logos, ícones)
│   ├── styles/                # Estilos modulares adicionais
│   ├── pages/
│   │   ├── login.jsx          # Página de autenticação
│   │   ├── helpdesk.jsx       # Página de abertura de chamados
│   │   ├── history.jsx        # Histórico de chamados do usuário
│   │   ├── dashboard.jsx      # Painel analítico para técnicos (TI / Fiscal)
│   │   └── manageUser.jsx     # Página dedicada de gerenciamento de usuários
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── dashboardBar.jsx   # Gráfico de histograma (Chart.js)
│   │   │   └── dashboardPie.jsx   # Gráfico de pizza (Chart.js)
│   │   ├── general/
│   │   │   └── navbar.jsx         # Barra de navegação e logout
│   │   ├── loading/
│   │   │   ├── loading.jsx        # Spinner de carregamento genérico
│   │   │   ├── loadingChat.jsx    # Spinner para o chat do ticket
│   │   │   └── robotGlimpse.jsx   # Animação de estado vazio
│   │   ├── table/
│   │   │   └── ListTable.jsx      # Tabela reutilizável de listagem
│   │   ├── ticket/
│   │   │   ├── filter.jsx             # Filtros avançados de busca
│   │   │   ├── openTicketWindow.jsx   # Janela de detalhe/interação do ticket
│   │   │   └── ticketsOptions.jsx     # Formulário de criação de chamado
│   │   └── utility/
│   │       ├── excludeUser.jsx    # Modal de exclusão de usuário
│   │       ├── info.jsx           # Componente de tooltip/info
│   │       └── message.jsx        # Componente de mensagem de feedback
│   ├── context/
│   │   ├── AreaContext.jsx       # Áreas ativas e conversão de ID para código
│   │   ├── FilterContext.js       # Estado global dos filtros
│   │   ├── MessageContext.js      # Estado global de mensagens/feedback
│   │   ├── OptionsContext.js      # Estado do formulário de chamado
│   │   ├── TicketContext.js       # Estado global dos tickets
│   │   └── UserManagement.js      # Estado de gerenciamento de usuários
│   └── utils/
│       ├── downloadFile.js        # Utilitário para download de arquivos
│       └── downloadFile.test.js   # Testes unitários do utilitário
├── Dockerfile                 # Dockerfile multi-stage build (Node + Nginx)
├── tailwind.config.js         # Configuração TailwindCSS (prefixo `tw-`, preflight desativado)
├── postcss.config.js          # Configuração PostCSS
└── package.json               # Dependências e scripts npm
```

## 4. Pré-requisitos e Infraestrutura

- **Runtime:** Node.js 18+ (Dev) / Node 20 (Build)
- **Build Tool:** Create React App (`react-scripts 5`) com CRACO para sobrescrever configurações do Webpack
- **Linter/Formatter:** Biome 2.5
- **Backend:** O frontend possui contêiner próprio em produção, sendo servido via Nginx (imagem alpine), que atua como proxy reverso para os endpoints da API no backend
- **Infra/DevOps:** Docker, Nginx, Docker Compose

## 5. Configuração de Variáveis de Ambiente (.env)

O frontend não utiliza variáveis de ambiente do processo (`process.env`) para configuração de API. As requisições são feitas por rotas relativas (ex: `/api/` quando tratadas via Nginx), resolvidas em produção ou pelo servidor de desenvolvimento do CRA com proxy configurado.

| Variável | Descrição | Exemplo |
|---|---|---|
| `window.REACT_APP_FAVICON_URL` | URL do favicon injetada globalmente em `index.js` |

## 6. Setup e Execução

**Instalação Local**
```bash
git clone <url-do-repositorio>
cd frontend
npm install
```

**Inicialização (Dev)**
```bash
# O servidor de desenvolvimento do CRA usa proxy para o backend em localhost:8000
npm start
```

**Execução Completa via Docker Compose**

O ambiente completo deve ser montado a partir do arquivo
`../arquitetura/docker-compose.yml`:

Crie o arquivo `../arquitetura/.env`:

```env
MYSQL_ROOT_PASSWORD=uma_senha_segura
MYSQL_PASSWORD=uma_senha_da_aplicacao
SECRET_KEY=uma-chave-secreta-do-django
```

Depois, execute a partir da pasta `arquitetura`:

```bash
cd /mnt/codes/FixDesk/frontend
npm ci

cd /mnt/codes/FixDesk/arquitetura
docker compose up -d --build
```

Execute `npm ci` antes do build do Docker para instalar exatamente as
dependências registradas no `package-lock.json`.

Esse arquivo contém credenciais e não deve ser versionado.
> O frontend rodará no contêiner `fixdesk-frontend` (Nginx, porta 80). Acesse o sistema em http://localhost.

## 7. Scripts, Testes e Qualidade

- `npm start` — Inicia o servidor de desenvolvimento CRA + CRACO na porta 3000.
- `npm run build` — Gera o artefato React otimizado para produção em `build/`.
- `npm test` — Roda a suíte de testes via CRACO + Jest (incluindo `tests/areaContext.test.jsx`, `tests/history.test.jsx`, `tests/dashboardArea.test.jsx`, `tests/ticketsOptions.test.jsx` e demais testes do frontend).
- `npx biome check src/` — Executa lint e verificação de formatação com Biome.
- `npx biome format --write src/` — Aplica formatação automática com Biome.

## 8. Documentação da API e Contratos

O frontend consome a API do backend Django via rotas relativas. A camada HTTP utiliza tanto `fetch` nativo (em componentes legados) quanto **Axios** (instância centralizada em `api.js`) — a migração para Axios está em andamento. Não há SDK de terceiros para o backend.

Consulte a seção **8. Documentação da API e Contratos** do [README do Backend](../backend/README.md) para o mapeamento completo de rotas, métodos HTTP e payloads esperados.

## 9. CI/CD e Deploy

- **Build:** Realizado através de um build multi-stage no `Dockerfile` (`node:20-alpine` para gerar os artefatos estáticos e `nginx:1.27-alpine` para os hospedar).
- **Containerização:** O frontend possui um contêiner próprio orquestrado via Docker Compose (`fixdesk-frontend`).
- **Deploy:** O deploy é realizado via Docker Compose (arquivo `arquitetura/docker-compose.yml`), interligando MySQL, backend e frontend em uma rede isolada. O Nginx expõe a porta 80 e encaminha as requisições ao backend.

## 10. Troubleshooting e FAQ

- **Problema:** `npm start` falha com erro de porta já em uso.
  **Solução:** Altere a porta padrão definindo `PORT=3001 npm start` ou encerre o processo que ocupa a porta 3000.

- **Problema:** Requisições da SPA retornam 404 em desenvolvimento.
  **Solução:** Configure o proxy no `package.json` adicionando `"proxy": "http://localhost:8000"` para redirecionar chamadas de API ao backend Django em desenvolvimento.

- **Problema:** Conflito de estilos entre TailwindCSS e os estilos existentes.
  **Solução:** O TailwindCSS está configurado com prefixo `tw-` e com `preflight: false` para não interferir nos estilos globais existentes. Use sempre o prefixo `tw-` ao aplicar classes Tailwind (ex: `tw-flex`, `tw-mt-4`).

- **Problema:** Build falha com erro `Cannot find module '@craco/craco'` ou `react-scripts: not found`.
  **Solução:** Execute `cd /mnt/codes/FixDesk/frontend && npm ci` antes de iniciar o build do Docker. O script `start` e os testes dependem dessas dependências.

- **Problema:** Arquivos estáticos (imagens, logos) não carregam após o build.
  **Solução:** Confirme que os assets em `src/images/` estão sendo importados via `import` estático no código — o CRA transforma esses imports em URLs com hash para cache busting. Não referencie arquivos de `src/` diretamente via string de caminho.
