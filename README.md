# FixDesk

> Sistema de helpdesk interno para gestão de chamados de suporte, autenticação corporativa via LDAP, dashboards analíticos para a equipe de TI e Setor Fiscal e notificações automatizadas por e-mail. Monorepo contendo backend Django e frontend React servido como SPA estática.

## 1. Visão Geral e Arquitetura

- **Stack Tecnológica:** Python 3.11+ / Django 4.2 / Django REST Framework (DRF) (backend), React 18 / Material UI 7 / Chart.js 4 / TailwindCSS 3 (prefixado com `tw-`) / Axios (frontend), MySQL 8 (banco de dados), Gunicorn 22 (WSGI), DBUtils 3.1 (connection pooling), Docker Compose (orquestração)
- **Padrão Arquitetural:** MTV (Model–Template–View) no backend com camada de serviços desacoplada (Service Layer) para lógica de negócio e tarefas em background; Component-Based Architecture com separação por feature no frontend
- **Design Patterns Principais:** Service Layer (separação views ↔ regras de negócio), Singleton (PoolManager — pool de conexões thread-safe), Middleware Chain (CSRF, permissão e monitoramento de queries), Thread Manager (tarefas periódicas em daemon thread), Data Classes / TypedDicts (mapeamento de dados tipados), Context API + Provider Composition (estado global React), Compound Components (janelas de ticket)

## 2. Módulos e Componentes Principais

### Backend (Django)

- **fixdesk (core):** Módulo raiz — `settings.py`, roteamento principal, autenticação LDAP (`validation`), controle centralizado de permissões multi-área (`fixdesk.permissions`), renovação dinâmica de sessão/cookies (`SessionExtensionMiddleware`), middlewares customizados (`CustomCsrfMiddleware`, `CsrfRedirectMiddleware`) e WSGI entrypoint.
- **helpdesk:** Ciclo de vida dos chamados (`SupportTicket`), upload/download de arquivos (`TicketFile`), histórico, chat entre usuário e técnico, alocação de equipamentos e geração de PDF. As áreas responsáveis são catalogadas pela entidade `Area` (`TI` e `Fiscal` inicialmente), relacionada a `SupportTicket.respective_area` por ForeignKey protegida. A abertura aceita apenas áreas ativas, listadas por `GET /helpdesk/active-areas/`, além do endpoint seguro de filtragem por query params (`GET /helpdesk/tickets/`). Integra envio de e-mails transacionais via SMTP.
- **dashboards:** Painéis analíticos para técnicos autorizados (`TI` e `Fiscal`) — gráficos de pizza (por setor/área), histogramas (por intervalo de dias), listagem de tickets com filtros avançados por área autorizada, upload de arquivos e gerenciamento de usuários.
- **database_pool:** Gerenciamento de pool de conexões com o banco de dados MySQL. Implementa pooling via `DBUtils.PersistentDB` com Singleton thread-safe (`PoolManager`), health check periódico (`DatabaseHealthCheck`), middleware de monitoramento de queries (`DatabasePoolMonitoringMiddleware`) e endpoints REST para status, saúde e reset do pool. Configurável via variáveis de ambiente (`DB_POOL_*`).
- **services:** Camada de negócio e processos em background. Contém:
  - `ticket_service.py` — Service Layer com operações de domínio sobre tickets: troca de técnico responsável, inserção de notas técnicas (`add_technical_detail_message`) e anexos técnicos (`add_technical_detail_file`), controle de status (abrir/fechar/aguardar) e atualização de chat.
  - `ticket_files_processor.py` — processamento e validação de arquivos anexados a chamados (detecção de tipo via magic bytes, conversão de imagens, mapeamento MIME → categoria).
  - `email_sender.py` — varredura e envio em lote de e-mails de notificação para mensagens não visualizadas após 3 horas, com remoção batch de registros processados.
  - `thread_manager.py` — `ThreadManager` (executor de tarefas periódicas em daemon thread).
  - `database_utils.py` — context manager para conexões MySQL diretas (fora do ORM Django), usado por serviços que acessam tabelas legadas.
  - `machines_service.py` — serviço para consulta de modelo de máquinas por endereço MAC, extraído da view para manter separação de responsabilidades.
- **classes:** Tipos, DTOs e exceções do domínio — `UserHelpDesk`, `UserList`, dataclasses de mapeamento (`ChatLogEntryConversation`, `ChatLogEntryFile`, `StatusMap`, `HistogramData`), exceções customizadas (`AuthenticationError`, `CreateClassError`).

### Frontend (React)

- **pages/login:** Autenticação — captura credenciais e chama `POST /validation/`. Redireciona conforme perfil e áreas autorizadas.
- **pages/helpdesk:** Abertura de chamados — obtém token CSRF, exibe formulário dinâmico com áreas ativas e seletores de ocorrência/problema alinhados à área (TI ou Fiscal) e submete via `POST /helpdesk/submit-ticket/`. Requisições via instância Axios centralizada (`services/api.js`).
- **pages/history:** Histórico de chamados ("Meus Chamados") — lista exclusivamente os chamados solicitados pelo usuário autenticado (técnico ou comum por PID/username), filtra dinamicamente por área, ocorrência e problema, converte o ID da área responsável para seu código e abre o detalhe de cada ticket usando o endpoint `GET /helpdesk/tickets/?context=history`.
- **pages/dashboard:** Painel analítico para técnicos (`TI` e `Fiscal`) — gráficos, listagem de tickets via `/helpdesk/tickets/?context=dashboard&area=<área>` (com filtros de localStorage prefixados por área: `quantity_TI`, `status_Fiscal`, etc.), gerenciamento de usuários e recarregamento reativo ao alternar área ativa.
- **components/ticket:** Janela de detalhe/interação (`openTicketWindow`), formulário de criação (`ticketsOptions`), filtros avançados com suporte a cascata ocorrência ↔ problema (`filter` — migrado para `api.js` e `utils/errorLogger.js`).
- **components/dashboard:** Gráficos de pizza (`dashboardPie`) por setor/área e histograma (`dashboardBar`) via Chart.js — consome `GET /dashboard/get-dash-board-bar/<sector>/<range_days>`. A inicialização do gráfico é controlada por `countAccess.current > 0` para evitar retorno antecipado na primeira carga.
- **components/general/navbar:** Barra de navegação global com menu dinâmico de troca de dashboard para técnicos com perfil multi-área (TI / Fiscal).
- **context:** Estado global por escopo — `AreaContext` (áreas ativas e conversão de ID para código), `TicketContext`, `OptionsContext`, `FilterContext`, `MessageContext`, `UserManagement`.
- **services/api.js:** Instância Axios centralizada com `baseURL` relativa e interceptors de erro padronizados — ponto único de acesso HTTP da aplicação.
- **utils/errorLogger.js:** Utilitário de log de erros desacoplado — centraliza o registro de exceções de chamadas HTTP.

## 3. Estrutura de Pastas

```text
FixDesk/
├── backend/                   # Backend Django
│   ├── manage.py              # Entrypoint do Django
│   ├── requirements.txt       # Dependências Python
│   ├── .env                   # Variáveis de ambiente (não versionado)
│   ├── .env.pool.example      # Exemplo de configuração do pool de conexões
│   ├── build/                 # Build do frontend React (servido via Django)
│   ├── classes/               # Tipos, DTOs e exceções do domínio
│   ├── dashboards/            # App Django — Dashboards analíticos TI e Fiscal
│   ├── database_pool/         # App Django — Pool de conexões e monitoramento
│   ├── files/                 # Assets estáticos (logos, imagens)
│   ├── fixdesk/               # App Django — Core / Configuração
│   ├── helpdesk/              # App Django — Gestão de chamados
│   ├── services/              # App Django — Serviços e camada de negócio
│   │   ├── database_utils.py
│   │   ├── machines_service.py
│   │   ├── ticket_service.py
│   │   ├── ticket_files_processor.py
│   │   └── tests/
│   └── templates/             # Templates HTML de fallback para CI e testes
├── frontend/                  # Frontend React
│   ├── public/                # Arquivos estáticos públicos
│   ├── src/
│   │   ├── App.jsx            # Rotas e layouts
│   │   ├── pages/             # Páginas (login, helpdesk, history, dashboard)
│   │   ├── components/        # Componentes por domínio (ticket, dashboard, general, utility)
│   │   ├── context/           # Context API (Area, Ticket, Options, Filter, Message, UserManagement)
│   │   ├── services/
│   │   │   └── api.js         # Instância Axios centralizada
│   │   └── utils/             # Utilitários (downloadFile, errorLogger)
│   ├── tailwind.config.js     # TailwindCSS (prefixo `tw-`, preflight off)
│   └── package.json           # Dependências e scripts npm
├── arquitetura/               # Orquestração local via Docker Compose
│   └── docker-compose.yml      # MySQL e backend Django (inclui o build do frontend)
├── linux_start.sh             # Script de build + start (Linux)
├── start_project.ps1          # Script de build + start (Windows/PowerShell)
├── biome.json                 # Configuração do Biome (linter/formatter)
└── .gitignore
```

## 4. Pré-requisitos e Infraestrutura

- **Runtime Backend:** Python 3.11+
- **Runtime Frontend:** Node.js 18+ / npm 9+
- **Servidor WSGI:** Gunicorn 22
- **Banco de Dados:** MySQL 8+ (charset `utf8mb4`)
- **LDAP:** Servidor Active Directory para autenticação (protocolo LDAP via `ldap3`)
- **SMTP:** Servidor de e-mail para notificações (porta 25, TLS)
- **Build Tool Frontend:** Create React App (`react-scripts 5`) com CRACO
- **Linter/Formatter:** Biome 2.5
- **Infra/DevOps:** Docker e Docker Compose

### Autenticação, Grupos Django e Matriz de Acesso

O sistema utiliza a biblioteca `ldap3` para validar credenciais no Active Directory e sincronizar permissões via grupos no Django Auth:

- **Grupos do Sistema:**
  - `Helpdesk_User`: Perfil básico para colaboradores solicitantes de chamados (qualquer setor).
  - `Helpdesk_Technician_TI`: Perfil técnico para atendimento de chamados e visualização do dashboard da área de TI.
  - `Helpdesk_Technician_Fiscal`: Perfil técnico para atendimento de chamados e visualização do dashboard da área Fiscal.
  - `Helpdesk_Leader_TI`: Perfil de gestão da equipe de TI.

- **Acesso Técnico Multi-Grupo (Multi-Area Technical Access):**
  - O provisionamento mapeia os grupos corporativos LDAP para os grupos correspondentes no Django.
  - Um técnico pode pertencer simultaneamente aos grupos `Helpdesk_Technician_TI` e `Helpdesk_Technician_Fiscal` (atribuição multi-grupo), permitindo visualizar, gerenciar e atender chamados de ambas as áreas (`TI` e `Fiscal`).
  - O módulo `fixdesk.permissions` centraliza a lógica de autorização (`get_user_allowed_areas`, `is_technician`, `is_technician_for_area`, `user_can_access_ticket`, `user_can_manage_ticket`). Operações e atribuições cross-area são invalidadas no nível de serviço.

- **Matriz de Permissões de Acesso:**

| Perfil / Grupo | Abertura de Chamados | Acesso aos Próprios Chamados | Gerenciar Chamados TI | Gerenciar Chamados Fiscal | Dashboard TI | Dashboard Fiscal |
|---|---|---|---|---|---|---|
| `Helpdesk_User` | Sim (TI / Fiscal) | Sim | Não | Não | Não | Não |
| `Helpdesk_Technician_TI` | Sim (TI / Fiscal) | Sim | Sim | Não | Sim | Não |
| `Helpdesk_Technician_Fiscal` | Sim (TI / Fiscal) | Sim | Não | Sim | Não | Sim |
| Técnico Dual (`TI` + `Fiscal`) | Sim (TI / Fiscal) | Sim | Sim | Sim | Sim | Sim |
| `Helpdesk_Leader_TI` | Sim (TI / Fiscal) | Sim | Sim | Não | Sim | Não |

## 5. Configuração de Variáveis de Ambiente (.env)

As variáveis de ambiente são configuradas no arquivo `backend/.env`. O frontend não utiliza variáveis de processo — as requisições são feitas por rotas relativas resolvidas pelo Nginx.

| Variável | Descrição | Exemplo |
|---|---|---|
| SERVER1 | IP do servidor LDAP/Active Directory | `10.1.1.18` |
| DOMAIN_NAME_HELPDESK | Nome do domínio LDAP para autenticação | `nt-lupatech` |
| LDAP_BASE | Base DN para buscas LDAP | `ou=Brasil,dc=nt-lupatech,dc=com,dc=br` |
| TECH_USER | CN do grupo de usuários comuns no LDAP | `CN=CH - User` |
| TECH_TECH_TI | CN do grupo de técnicos TI no LDAP | `CN=CH - Technician_TI` |
| TECH_TECH_FISCAL | CN do grupo de técnicos Fiscal no LDAP | `CN=CH - Technician_Fiscal` |
| DJANGO_GROUP_USER | Nome do grupo Django para usuários | `Helpdesk_User` |
| DJANGO_GROUP_TECH | Nome do grupo Django para técnicos TI | `Helpdesk_Technician_TI` |
| DJANGO_GROUP_TECH_FISCAL | Nome do grupo Django para técnicos Fiscal | `Helpdesk_Technician_Fiscal` |
| VALID_TYPES | Lista de MIME types permitidos para upload | `[image/png, image/jpeg, ...]` |
| SERVER_SMTP | Host do servidor SMTP | `lupatech-com-br.mail.protection.outlook.com` |
| SMPT_PORT | Porta do servidor SMTP | `25` |
| MAIL_FIXDESK | Endereço de e-mail remetente do sistema | `fixdesk@lupatech.com.br` |
| DB_NAME | Nome do banco de dados MySQL | `techmindDB` |
| DB_USER | Usuário administrativo do banco | `mach` |
| USER_DB | Usuário da aplicação no banco | `fixdesk_user` |
| USER_PWD_DB | Senha do usuário da aplicação no banco | `***` |
| DB_PASSWORD | Senha do usuário administrativo do banco | `***` |
| DB_HOST | Host do banco de dados MySQL | `10.1.1.73` |
| DB_PORT | Porta do banco de dados MySQL | `3306` |
| DEBUG | Habilita o modo de depuração do Django (`true` / `false`) | `true` |
| COMPOSE_PROJECT_NAME | Nome do projeto Docker Compose | `fixdesk` |
| DB_POOL_MIN | Mínimo de conexões idle no pool | `2` |
| DB_POOL_MAX | Máximo de conexões no pool | `5` |
| DB_POOL_MAX_OVERFLOW | Conexões extras temporárias além do máximo | `10` |
| DB_POOL_IDLE_TIME | Tempo máximo (s) de idle antes de reciclar conexão | `3600` |
| DB_POOL_RECYCLE | Tempo (s) de reciclagem de conexões | `3600` |
| DB_POOL_PRE_PING | Verifica se a conexão está ativa antes de usar | `true` |
| DB_POOL_ECHO | Loga todas as queries SQL (apenas debug) | `false` |
| DB_POOL_HEALTH_CHECK_INTERVAL | Intervalo (s) de verificação de saúde do pool | `300` |

> Consulte o arquivo `backend/.env.pool.example` para recomendações de valores por ambiente (dev, staging, produção, alta concorrência).

## 6. Setup e Execução

### Início Rápido (Scripts Automatizados)

O `.venv` é um ambiente virtual Python (uma pasta, e não um arquivo). No Linux/macOS,
crie e ative esse ambiente na raiz do projeto antes de executar o script:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

No Windows, usando PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

Com o ambiente ativado, execute o script correspondente ao seu sistema:

```bash
# Linux — builda o frontend, copia para backend/build/ e inicia o Django
./linux_start.sh

# Windows (PowerShell) — mesmo fluxo
.\start_project.ps1
```

Se o PowerShell bloquear a ativação do ambiente, execute uma vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Setup Manual — Backend

Caso não use os scripts automatizados, o ambiente virtual pode ser criado dentro de
`backend/`:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Copie o .env.example para .env e preencha as variáveis
cp .env.example .env

# (Opcional) Configure o pool de conexões
# Copie as variáveis DB_POOL_* de .env.pool.example para o .env

# Aplique as migrações
python manage.py migrate

# Dev
python manage.py runserver 0.0.0.0:8000

# Produção
gunicorn fixdesk.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Setup Manual — Frontend

```bash
cd frontend
npm install

# Dev (proxy para backend em localhost:8000)
npm start

# Build para produção (artefato copiado para backend/build/)
npm run build
cp -r build/* ../backend/build/
```

### Setup via Docker Compose

O ambiente completo deve ser montado usando o Compose disponível em
`arquitetura/docker-compose.yml`. Na primeira execução, crie o arquivo
`arquitetura/.env` com as três variáveis obrigatórias:

```env
# arquitetura/.env
MYSQL_ROOT_PASSWORD=uma_senha_segura
MYSQL_PASSWORD=uma_senha_da_aplicacao
SECRET_KEY=uma-chave-secreta-do-django
```

Depois, execute o Compose a partir da pasta `arquitetura`:

```bash
cd /mnt/codes/FixDesk/arquitetura
docker compose up -d --build
```

As dependências e o build do frontend são instalados e executados
automaticamente no estágio Node do `backend/Dockerfile`.

O arquivo `.env` contém credenciais e já está ignorado pelo Git. Não o
versione nem compartilhe suas senhas.

O Django/Gunicorn ficará disponível em http://localhost:8000 e servirá tanto a
SPA React quanto a API. Para acompanhar os logs ou desligar o ambiente:

```bash
docker compose logs -f
docker compose down
```

## 7. Scripts, Testes e Qualidade

### Backend

- `python manage.py runserver` — Servidor de desenvolvimento Django.
- `python manage.py migrate` — Aplica migrações pendentes.
- `python manage.py create_fiscal_group` — Cria o grupo Django `Helpdesk_Technician_Fiscal` de forma idempotente via CLI.
- `python manage.py collectstatic` — Coleta arquivos estáticos para produção.
- `python manage.py pool_monitor` — Monitora o status do pool de conexões via CLI.
- `PYTHONPATH=. pytest` — Roda a suíte de testes via Pytest. O `ThreadManager` é automaticamente desabilitado durante os testes via detecção no `ServicesConfig.ready()`.
- `PYTHONPATH=. pytest --cov` — Testes com relatório de cobertura.

### Frontend

- `npm start` — Servidor de desenvolvimento CRA + CRACO na porta 3000.
- `npm run build` — Build otimizado para produção.
- `npm test` — Testes via CRACO + Jest.
- `npx biome check src/` — Lint e verificação de formatação.
- `npx biome format --write src/` — Formatação automática.

## 8. Documentação da API e Contratos

O frontend consome a API do backend Django via rotas relativas. A camada HTTP utiliza **Axios** (instância centralizada em `services/api.js`) — a migração de chamadas `fetch` nativas para Axios está em andamento. Não há SDK de terceiros para o backend.

### Rotas — fixdesk (core)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Página de login (SPA React) |
| GET | `/login/` | Alias da página de login |
| POST | `/validation/` | Autenticação LDAP — retorna dados do usuário e permissões em JSON |
| GET | `/admin/` | Painel administrativo Django |

### Rotas — helpdesk

| Método | Rota | Descrição |
|---|---|---|
| GET | `/helpdesk/` | Página principal de chamados (redireciona para `/login/` via `@login_required` para anônimos) |
| GET | `/helpdesk/get-token/` | Obtém novo token CSRF |
| GET | `/helpdesk/active-areas/` | Lista áreas ativas para abertura de chamados; requer autenticação |
| POST | `/helpdesk/submit-ticket/` | Cria um novo chamado |
| GET | `/helpdesk/history/` | Histórico de chamados ("Meus Chamados") |
| GET | `/helpdesk/tickets/` | Endpoint v2 seguro de busca/filtragem de chamados via query string (`context`, `area`, `occurrence`, `problem`, `status`, `order`, `limit`, `search`). No contexto `history`, restringe a consulta aos chamados do solicitante autenticado (PID/username) |
| GET | `/helpdesk/get-ticket/<qty>/<usr>/<status>/<order>` | Lista tickets paginados e filtrados (legado) |
| POST | `/helpdesk/exit/` | Logout do usuário (requer token CSRF) |
| GET | `/helpdesk/ticket/<id>` | Detalhes de um chamado |
| POST | `/helpdesk/ticket/<id>/technical-details/message/` | Adiciona nota técnica (restrito à equipe TI) |
| POST | `/helpdesk/ticket/<id>/technical-details/file/` | Upload de arquivo anexo técnico (restrito à equipe TI) |
| POST | `/helpdesk/update-chat/<id>` | Atualiza o chat de um chamado |
| GET | `/helpdesk/get-ticket-filter/<url>/<sector>/<occurrence>/<order>/<user>/<qty>/<status>/<search>` | Busca avançada de tickets (legado posicional) |
| GET | `/helpdesk/equipaments-for-alocate/<location>` | Lista equipamentos para alocação |
| GET | `/helpdesk/date-equipaments-alocate/<mac>` | Data de alocação do equipamento |
| POST | `/helpdesk/change-last-viewer/<id>` | Atualiza último visualizador |
| GET | `/helpdesk/get-image/<mac>` | Imagem do equipamento |

### Rotas — dashboards

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard/<area>/` ou `/dashboard-ti/` | Página principal do dashboard da área autorizada (`TI` ou `Fiscal`) |
| GET | `/dashboard/get-info/` ou `/dashboard-ti/get-info/` | Informações gerais e lista de técnicos por área |
| GET | `/dashboard/get-dash-board-pie/<sector>` | Gráfico de pizza por setor/área |
| GET | `/dashboard-ti/get-ticket-ti/<qty>/<status>/<order>` | Tickets do painel TI |
| GET | `/dashboard/get-dash-board-bar/<sector>/<range_days>` | Histograma por setor e intervalo de tempo (`week`, `month`, `year`, `all`) |
| POST | `/dashboard-ti/upload-new-files/<id>` | Upload de arquivos em um chamado |
| GET | `/dashboard-ti/details/<id>` | Detalhes e chat (visão técnico) |
| GET | `/dashboard-ti/get-users-fixdesk/` | Lista usuários do sistema com paginação (parâmetros `page`, `page_size`, `search`, `filter`) |
| DELETE | `/dashboard-ti/exclude-user/<user>` | Remove um usuário (HTTP DELETE) |

### Rotas — database_pool (monitoramento)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/database-pool/status/?db=<alias>` | Status do pool de conexões para um banco específico |
| GET | `/api/database-pool/health/` | Health check geral de todos os bancos monitorados |
| POST | `/api/database-pool/reset/` | Reseta o pool de conexões (body: `{"db": "<alias>"}`) |

## 9. CI/CD e Deploy

- **Containerização:** Docker Compose (`arquitetura/docker-compose.yml`) orquestrando MySQL e backend Django/Gunicorn.
- **Imagem Docker:** build multi-stage com `node:20-alpine` para compilar o React e `python:3.12-slim` para executar o Django.
- **Deploy:** O build do React é copiado para `backend/build/`, coletado pelo Django e servido pelo próprio backend na porta 8000.

## 10. Troubleshooting e FAQ

- **Problema:** Erro `ldap3.core.exceptions.LDAPBindError` ao tentar login.
  **Solução:** Verifique se o servidor LDAP (`SERVER1`) está acessível na rede e se as credenciais do domínio (`DOMAIN_NAME_HELPDESK`) estão corretas no `.env`.

- **Problema:** `mysqlclient` falha ao instalar no Linux.
  **Solução:** Instale as dependências de sistema: `sudo apt install python3-dev default-libmysqlclient-dev build-essential`.

- **Problema:** `ThreadManager` inicia durante os testes, causando efeitos colaterais.
  **Solução:** O `ServicesConfig.ready()` em `services/apps.py` detecta automaticamente execuções de teste (`pytest` em `sys.modules` ou `test` em `sys.argv`) e não inicia a thread. Execute os testes com `PYTHONPATH=. pytest`.

- **Problema:** Erro 403 CSRF ao submeter formulários.
  **Solução:** Verifique se a origem está listada em `CSRF_TRUSTED_ORIGINS` no `settings.py`. Os middlewares customizados redirecionam para `/login` em caso de falha CSRF.

- **Problema:** Arquivos estáticos do frontend não são servidos em produção.
  **Solução:** Recompile a imagem com `docker compose build --no-cache backend`; o Dockerfile compila o React, copia o resultado para `backend/build/` e executa `collectstatic`.

- **Problema:** `npm start` falha com erro de porta já em uso.
  **Solução:** Altere a porta com `PORT=3001 npm start` ou encerre o processo que ocupa a porta 3000.

- **Problema:** Conflito de estilos entre TailwindCSS e estilos existentes.
  **Solução:** O TailwindCSS está configurado com prefixo `tw-` e `preflight: false`. Use sempre `tw-` ao aplicar classes Tailwind.

- **Problema:** Build falha com `Cannot find module '@craco/craco'` ou `react-scripts: not found`.
  **Solução:** A partir da raiz do projeto, execute `cd /mnt/codes/FixDesk/frontend && npm ci` e depois refaça o build do Docker.

- **Problema:** Arquivos estáticos (imagens, logos) não carregam após o build.
  **Solução:** Importe assets via `import` estático no código — o CRA transforma em URLs com hash para cache busting.

- **Problema:** `DBUtils` não instalado — erro `ImportError` ao inicializar o pool.
  **Solução:** Execute `pip install DBUtils==3.1.0` ou verifique se `requirements.txt` está atualizado. O pool será desabilitado graciosamente se a lib não estiver disponível.

- **Problema:** Warning `⚠️ Muitas queries detectadas` nos logs.
  **Solução:** O `DatabasePoolMonitoringMiddleware` alerta quando uma request executa mais de 10 queries SQL. Use `select_related()` ou `prefetch_related()` nas querysets para reduzir o número de queries (N+1 problem).
