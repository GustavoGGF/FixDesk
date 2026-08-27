# FixDesk - Backend

> Backend do sistema de helpdesk interno **FixDesk**, responsável pela autenticação LDAP, gestão de chamados de suporte (tickets) para as equipes de **TI** e **Fiscal**, dashboards analíticos com controle de acesso por área e envio automatizado de notificações por e-mail.

## 1. Visão Geral e Arquitetura

- **Stack Tecnológica:** Python 3.11+, Django 4.2, Django REST Framework (DRF), MySQL (via `mysqlclient` / `mysql-connector-python`), Gunicorn 22, DBUtils 3.1 (connection pooling)
- **Padrão Arquitetural:** MTV (Model–Template–View) do Django, com camada de serviços desacoplada (Service Layer) para lógica de negócio e tarefas em background
- **Design Patterns Principais:** Service Layer (separação views ↔ regras de negócio), Singleton (PoolManager — pool de conexões thread-safe), Middleware Chain (middlewares customizados de CSRF, permissão, extensão de sessão e monitoramento de queries), Thread Manager (execução periódica de tarefas), Data Classes / TypedDicts para mapeamento de dados tipados

## 2. Módulos e Componentes Principais

- **fixdesk (core):** Módulo raiz do Django — contém `settings.py`, roteamento principal (`urls.py`), view de autenticação LDAP (`validation`), centralização de controle de permissões multi-área (`fixdesk.permissions`), renovação dinâmica de sessão (`SessionExtensionMiddleware`), middlewares customizados (`CustomCsrfMiddleware`, `CsrfRedirectMiddleware`) e o WSGI entrypoint.
- **helpdesk:** Módulo de domínio principal — gerencia o ciclo de vida dos chamados de suporte (`SupportTicket`), upload/download de arquivos anexos (`TicketFile`), histórico, chat entre usuário e técnico, alocação de equipamentos e geração de PDF. As áreas responsáveis são catalogadas pela entidade `Area` (`TI` e `Fiscal` inicialmente), e `SupportTicket.respective_area` mantém uma ForeignKey protegida para esse catálogo. A abertura aceita o ID ou código de uma área ativa, e o endpoint `GET /helpdesk/active-areas/` lista as opções disponíveis. Também contém o comando `create_fiscal_group` e o endpoint seguro de filtragem `GET /helpdesk/tickets/`. Integra envio de e-mails transacionais via SMTP.
- **dashboards:** Módulo de painéis analíticos para técnicos autorizados (`TI` e `Fiscal`) — fornece dados de gráficos de pizza (por setor/área), histogramas (por intervalo de dias), listagem de tickets filtrados pelas áreas permitidas do usuário, upload de arquivos adicionais e gerenciamento de usuários do sistema.
- **database_pool:** Módulo de gerenciamento de pool de conexões com o banco de dados MySQL. Implementa pooling via `DBUtils.PersistentDB` com Singleton thread-safe (`PoolManager`), health check periódico (`DatabaseHealthCheck`), middleware de monitoramento de queries (`DatabasePoolMonitoringMiddleware`), endpoints REST para status, saúde e reset do pool, painel no Django Admin (`PoolMetricsAdmin`, `PoolStatusAdmin`) e management command CLI (`pool_monitor`). Configurável via variáveis de ambiente (`DB_POOL_*`).
- **services:** Módulo de serviços — camada de negócio e processos em background. Contém:
  - `ticket_service.py` — Service Layer com as operações de domínio sobre tickets: troca de técnico responsável, inserção de notas técnicas (`add_technical_detail_message`) e anexos técnicos (`add_technical_detail_file`), controle de status (abrir/fechar/aguardar) e atualização de chat.
  - `ticket_files_processor.py` — processamento e validação de arquivos anexados a chamados (detecção de tipo via magic bytes, conversão de imagens, mapeamento MIME → categoria).
  - `email_sender.py` — varredura e envio em lote de e-mails de notificação para mensagens não visualizadas após 3 horas, com remoção batch de registros processados.
  - `thread_manager.py` — `ThreadManager` (executor de tarefas periódicas em daemon thread).
  - `database_utils.py` — context manager para conexões MySQL diretas (fora do ORM Django), usado por serviços que acessam tabelas legadas.
  - `machines_service.py` — serviço para consulta de modelo de máquinas por endereço MAC, extraído da view para manter separação de responsabilidades (Single Responsibility).
- **classes:** Biblioteca de tipos e exceções do domínio, organizada em:
  - `users/` — `UserHelpDesk` (DTO de dados do usuário autenticado via LDAP), `UserList` (TypedDict para listagem de usuários).
  - `mapping/` — `ChatLogEntryConversation`, `ChatLogEntryFile` (dataclasses para entradas de log do chat), `StatusMap` (mapeamento tipado de status de ticket), `HistogramData` (estrutura de dados de histograma).
  - `exceptions/` — `AuthenticationError`, `CreateClassError` (exceções customizadas).

### Autenticação Django Auth e Integração LDAP

- **Mapeamento de Grupos e Perfis:**
  - A autenticação via LDAP (`validation`) varre todos os grupos atribuídos ao usuário no Active Directory (`memberOf`).
  - Se o grupo LDAP `CN=CH - Technician_Fiscal` (configurável via `TECH_TECH_FISCAL`) for detectado, o grupo Django `Helpdesk_Technician_Fiscal` (configurável via `DJANGO_GROUP_TECH_FISCAL`) é associado ao usuário.
  - O provisionamento (`create_or_verify_user`) opera de forma idempotente utilizando `user.groups.add(...)`, preservando grupos previamente atribuídos. Isso permite suporte a acessos multi-grupo (ex: um técnico com perfil `TI` + `Fiscal`).
- **Módulo Central de Permissões (`fixdesk.permissions`):**
  - `get_user_allowed_areas(user)`: Retorna as áreas autorizadas (`["TI"]`, `["Fiscal"]`, `["TI", "Fiscal"]` ou `[]`).
  - `is_technician(user)`: Retorna `True` se o usuário é técnico em pelo menos uma área.
  - `is_technician_for_area(user, area)`: Verifica acesso técnico para a área especificada (`TI` ou `Fiscal`).
  - `user_can_access_ticket(user, ticket)` e `user_can_manage_ticket(user, ticket)`: Validam acesso e gestão com base no escopo da área do chamado. Operações cross-area (ex: técnico TI operando em chamado Fiscal) são bloqueadas na camada de serviço.

## 3. Estrutura de Pastas

```text
backend/
├── manage.py                  # Entrypoint do Django
├── requirements.txt           # Dependências Python
├── .env                       # Variáveis de ambiente (não versionado)
├── .env.pool.example          # Exemplo de configuração do pool de conexões
├── INDEX.md                   # Índice de documentação do backend
├── POOL_FILES_MANIFEST.md     # Manifesto completo dos arquivos do database_pool
├── arial.ttf                  # Fonte usada na geração de PDFs
├── build/                     # Build do frontend React (servido via Django templates)
│   ├── index.html
│   └── static/
├── classes/                   # Tipos, DTOs e exceções do domínio
│   ├── exceptions/
│   │   ├── auth_exeption.py
│   │   └── create_class_exeption.py
│   ├── mapping/
│   │   ├── chat_entry_conversation.py
│   │   ├── chat_entry_file.py
│   │   ├── histogram_data.py
│   │   └── status_mapping.py
│   └── users/
│       ├── app_list.py
│       └── helpdesk.py
├── dashboards/                # App Django — Dashboards analíticos TI e Fiscal
│   ├── apps.py
│   ├── urls.py
│   ├── views.py
│   └── tests.py
├── database_pool/             # App Django — Pool de conexões e monitoramento
│   ├── apps.py                #   DatabasePoolConfig — inicializa o pool no startup
│   ├── admin.py               #   PoolMetricsAdmin, PoolStatusAdmin — integração Django Admin
│   ├── config.py              #   Configuração padrão do pool (DEFAULT_POOL_CONFIG)
│   ├── health_check.py        #   DatabaseHealthCheck — verificação de saúde das conexões
│   ├── middleware.py          #   DatabasePoolMonitoringMiddleware — logging de queries
│   ├── pool_manager.py        #   PoolManager (Singleton) — gerencia conexões via DBUtils
│   ├── urls.py                #   Rotas REST: status, health, reset
│   ├── views.py               #   Views: PoolStatusView, PoolHealthCheckView, PoolResetView
│   ├── tests.py               #   Testes unitários e de integração do pool
│   ├── migrations/            #   Migrações do app
│   ├── management/
│   │   └── commands/
│   │       └── pool_monitor.py  # CLI para monitorar o pool em tempo real
│   └── README.md              #   Documentação técnica detalhada do módulo
├── files/                     # Assets estáticos do sistema (logos, imagens)
├── fixdesk/                   # App Django — Core / Configuração
│   ├── settings.py
│   ├── urls.py
│   ├── views.py
│   ├── wsgi.py
│   ├── middleware_expire.py
│   └── middleware_permition.py
├── helpdesk/                  # App Django — Gestão de chamados
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   └── tests/
├── services/                  # App Django — Serviços e camada de negócio
│   ├── apps.py
│   ├── database_utils.py      #   Context manager para conexões MySQL diretas
│   ├── email_sender.py
│   ├── machines_service.py    #   Consulta de modelo de máquinas por MAC
│   ├── thread_manager.py
│   ├── ticket_files_processor.py
│   ├── ticket_service.py
│   └── tests/
│       ├── test_email_sender.py
│       ├── test_machines_service.py
│       ├── test_ticket_files_processor.py
│       └── test_ticket_service.py
└── templates/                 # Templates HTML de fallback (index.html para CI e testes)
    └── index.html
```

## 4. Pré-requisitos e Infraestrutura

- **Runtime:** Python 3.11+
- **Servidor WSGI:** Gunicorn 22
- **Banco de Dados:** MySQL 8+ (charset `utf8mb4`)
- **LDAP:** Servidor Active Directory para autenticação de usuários (protocolo LDAP via `ldap3`)
- **SMTP:** Servidor de e-mail para envio de notificações (porta 25, TLS)
- **Infra/DevOps:** Docker, Nginx (proxy reverso)

## 5. Configuração de Variáveis de Ambiente (.env)

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
| VALID_TYPES | Lista de MIME types permitidos para upload de arquivos | `[image/png, image/jpeg, ...]` |
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

> Consulte o arquivo `.env.pool.example` para recomendações de valores por ambiente (dev, staging, produção, alta concorrência).

## 6. Setup e Execução

**Instalação**
```bash
git clone <url-do-repositorio>
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Configuração do banco e grupos**
```bash
# Copie o .env.example para .env e preencha as variáveis
cp .env.example .env

# (Opcional) Configure o pool de conexões
# Copie as variáveis DB_POOL_* de .env.pool.example para o .env

# Aplique as migrações (cria o grupo Helpdesk_Technician_Fiscal via data migration)
python manage.py migrate

# (Opcional/CLI) Assegure a criação do grupo Helpdesk_Technician_Fiscal de forma idempotente
python manage.py create_fiscal_group
```

**Inicialização (Dev)**
```bash
python manage.py runserver 0.0.0.0:8000
```

**Inicialização (Produção)**
```bash
gunicorn fixdesk.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

**Monitoramento do Pool (CLI)**
```bash
# Verificação única do status do pool
python manage.py pool_monitor

# Monitoramento contínuo a cada 30 segundos
python manage.py pool_monitor --continuous --interval 30

# Monitorar banco específico
python manage.py pool_monitor --db default
```

## 7. Scripts, Testes e Qualidade

- `python manage.py runserver` — Inicia o servidor de desenvolvimento Django.
- `python manage.py migrate` — Aplica migrações pendentes no banco de dados.
- `python manage.py create_fiscal_group` — Cria o grupo Django `Helpdesk_Technician_Fiscal` de forma idempotente via CLI.
- `python manage.py collectstatic` — Coleta arquivos estáticos para servir em produção.
- `python manage.py pool_monitor` — Monitora o status do pool de conexões via CLI.
- `PYTHONPATH=. pytest` — Roda a suíte de testes via Pytest (incluindo `services/tests/`, `helpdesk/tests/test_first_view_authentication.py` e `helpdesk/tests/test_change_last_viewer.py`). O `ThreadManager` é automaticamente desabilitado durante os testes via detecção no `ServicesConfig.ready()`.
- `PYTHONPATH=. pytest --cov` — Roda os testes com relatório de cobertura.
- Verificação de tipos estáticos compatível com Pylance/Pyright (modo `strict`) e validação via Pyrefly Specialist Agent para garantir anotações de tipos estritos em todo o código backend Python.

A migração `helpdesk/migrations/0003_add_area_model.py` cria a tabela `helpdesk_area`, insere as áreas iniciais `TI` e `Fiscal` de forma idempotente e converte os valores legados de `SupportTicket.respective_area` para uma ForeignKey com `on_delete=PROTECT`.

## 8. Documentação da API e Contratos

### Rotas Principais — fixdesk (core)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Renderiza a página de login (SPA React) |
| GET | `/login/` | Alias da página de login |
| POST | `/validation/` | Autenticação LDAP — retorna dados do usuário e áreas autorizadas em JSON |
| GET | `/admin/` | Painel administrativo Django |

### Rotas — helpdesk

| Método | Rota | Descrição |
|---|---|---|
| GET | `/helpdesk/` | Página principal de chamados (redireciona para `/login/` via `@login_required` para anônimos) |
| GET | `/helpdesk/get-token/` | Obtém novo token CSRF |
| GET | `/helpdesk/active-areas/` | Lista áreas ativas para abertura de chamados; requer autenticação |
| POST | `/helpdesk/submit-ticket/` | Cria um novo chamado |
| GET | `/helpdesk/history/` | Página de histórico de chamados ("Meus Chamados") — exibe apenas chamados do próprio usuário solicitante |
| GET | `/helpdesk/tickets/` | Endpoint v2 seguro de busca/filtragem de chamados via query string (`context`, `area`, `occurrence`, `problem`, `status`, `order`, `limit`, `search`). No contexto `history`, restringe a consulta aos chamados onde o usuário autenticado é o solicitante (`PID` ou `ticketRequester`) |
| GET | `/helpdesk/get-ticket/<qty>/<usr>/<status>/<order>` | Lista tickets paginados e filtrados (legado) |
| POST | `/helpdesk/exit/` | Logout do usuário (requer token CSRF) |
| GET | `/helpdesk/ticket/<id>` | Detalhes de um chamado específico |
| POST | `/helpdesk/ticket/<id>/technical-details/message/` | Adiciona mensagem/nota técnica (restrito à equipe TI) |
| POST | `/helpdesk/ticket/<id>/technical-details/file/` | Upload de arquivo anexo aos detalhes técnicos (restrito à equipe TI) |
| POST | `/helpdesk/update-chat/<id>` | Atualiza o chat de um chamado |
| GET | `/helpdesk/get-ticket-filter/<url>/<sector>/<occurrence>/<order>/<user>/<qty>/<status>/<search>` | Busca avançada de tickets (legado posicional) |
| GET | `/helpdesk/equipaments-for-alocate/<location>` | Lista equipamentos para alocação |
| GET | `/helpdesk/date-equipaments-alocate/<mac>` | Verifica data de alocação do equipamento |
| POST | `/helpdesk/change-last-viewer/<id>` | Atualiza o último visualizador do chamado |
| GET | `/helpdesk/get-image/<mac>` | Obtém modelo do equipamento por MAC |

### Rotas — dashboards

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard/<area>/` ou `/dashboard-ti/` | Página principal do dashboard da área autorizada (`TI` ou `Fiscal`) |
| GET | `/dashboard/get-info/` ou `/dashboard-ti/get-info/` | Obtém informações gerais e lista de técnicos por área autorizada |
| GET | `/dashboard/get-dash-board-pie/<sector>` | Dados do gráfico de pizza por setor/área |
| GET | `/dashboard-ti/get-ticket-ti/<qty>/<status>/<order>` | Lista tickets para o painel TI |
| GET | `/dashboard/get-dash-board-bar/<sector>/<range_days>` | Dados do histograma por setor e intervalo de tempo (`week`, `month`, `year`, `all`) |
| POST | `/dashboard-ti/upload-new-files/<id>` | Upload de novos arquivos em um chamado |
| GET | `/dashboard-ti/details/<id>` | Detalhes e chat de um chamado (visão técnico) |
| GET | `/dashboard-ti/get-users-fixdesk/` | Lista usuários do sistema com paginação (parâmetros `page`, `page_size`, `search`, `filter`) |
| DELETE | `/dashboard-ti/exclude-user/<user>` | Remove um usuário do sistema (HTTP DELETE) |

### Rotas — database_pool (monitoramento)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/database-pool/status/?db=<alias>` | Status do pool de conexões para um banco específico |
| GET | `/api/database-pool/health/` | Health check geral de todos os bancos monitorados |
| POST | `/api/database-pool/reset/` | Reseta o pool de conexões (body: `{"db": "<alias>"}`) |

## 9. CI/CD e Deploy

- **Servidor de Produção:** Gunicorn como servidor WSGI, com Nginx como proxy reverso e terminação TLS.
- **Containerização:** Docker Compose (`arquitetura/docker-compose.yml`) para orquestração do backend, banco de dados MySQL e frontend/Nginx.
- **Deploy:** Realizado via Docker Compose no servidor de produção (`sappp01.lupatech.com.br`).

Para montar o ambiente completo, execute a partir da raiz do projeto:

Crie primeiro `arquitetura/.env`:

```env
MYSQL_ROOT_PASSWORD=uma_senha_segura
MYSQL_PASSWORD=uma_senha_da_aplicacao
SECRET_KEY=uma-chave-secreta-do-django
```

Em seguida, inicie os serviços:

```bash
cd arquitetura
docker compose up -d --build
```

O arquivo `arquitetura/.env` não deve ser versionado, pois contém credenciais.

## 10. Troubleshooting e FAQ

- **Problema:** Erro `ldap3.core.exceptions.LDAPBindError` ao tentar login.
  **Solução:** Verifique se o servidor LDAP (`SERVER1`) está acessível na rede e se as credenciais do domínio (`DOMAIN_NAME_HELPDESK`) estão corretas no `.env`.

- **Problema:** `mysqlclient` falha ao instalar no Linux.
  **Solução:** Instale as dependências de sistema: `sudo apt install python3-dev default-libmysqlclient-dev build-essential`.

- **Problema:** `ThreadManager` inicia durante os testes, causando efeitos colaterais.
  **Solução:** O `ServicesConfig.ready()` em `services/apps.py` detecta automaticamente execuções de teste (`pytest` em `sys.modules` ou `test` em `sys.argv`) e não inicia a thread. Execute os testes com `PYTHONPATH=. pytest`.

- **Problema:** Erro 403 CSRF ao submeter formulários.
  **Solução:** Verifique se a origem está listada em `CSRF_TRUSTED_ORIGINS` no `settings.py`. Os middlewares `CustomCsrfMiddleware` e `CsrfRedirectMiddleware` redirecionam automaticamente para `/login` em caso de falha CSRF.

- **Problema:** Arquivos estáticos do frontend não são servidos em produção.
  **Solução:** Execute `python manage.py collectstatic` e configure o Nginx para servir o diretório `static/`. O build do React deve estar em `build/`.

- **Problema:** `DBUtils` não instalado — erro `ImportError` ao inicializar o pool.
  **Solução:** Execute `pip install DBUtils==3.1.0` ou verifique se `requirements.txt` está atualizado. O pool será desabilitado graciosamente se a lib não estiver disponível.

- **Problema:** Warning `⚠️ Muitas queries detectadas` nos logs.
  **Solução:** O `DatabasePoolMonitoringMiddleware` alerta quando uma request executa mais de 10 queries SQL. Use `select_related()` ou `prefetch_related()` nas querysets para reduzir o número de queries (N+1 problem).

- **Problema:** Pool não inicializa — log mostra `PoolManager not initialized`.
  **Solução:** Verifique se `database_pool` está listado em `INSTALLED_APPS` no `settings.py` e se as variáveis `DB_POOL_*` estão corretamente definidas no `.env`. Execute `python manage.py pool_monitor` para diagnóstico via CLI.
