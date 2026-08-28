# Especificação de Domínio (DDD) - FixDesk

## 0. Metadados e Changelog
* **Última atualização:** 2026-08-28
* **Histórico:**
    * 2026-08-28 — Lançamento da versão v5.1.0 (MINOR): implementação da política de autenticação e fallback configurável para superusuários locais (`auth_policy.py`, `AUTHENTICATION_MODE`, `ALLOW_LOCAL_SUPERUSER_LOGIN`), unificação do build do frontend na imagem Docker do backend, execução automática de migrações no Compose e melhoria no fluxo de submissão do login.
    * 2026-08-13 — Lançamento da versão v5.0.3 (PATCH): inclusão de template baseline de fallback (`templates/index.html`), adequação do carregamento de templates em `settings.py` para ambientes headless/CI e alinhamento das variáveis de ambiente LDAP nos fluxos de integração contínua.
    * 2026-08-13 — Lançamento da versão v5.0.2: restrição estrita da listagem no histórico de chamados aos registros de autoria do próprio solicitante autenticado (`PID` ou `ticketRequester`).
    * 2026-08-13 — Lançamento da versão v5.0.1: autenticação e controle de acesso via `first_view`, desacoplamento de handlers e resiliência em hooks de histórico e dashboard.
    * 2026-08-13 — Lançamento da versão v5.0.0: consolidação do catálogo de entidades `Area`, suporte a permissões multi-grupo (TI + Fiscal), tipagem defensiva de mensagens/remetentes (`str | None`), encerramento de chamados timezone-aware e tags de imagens sincronizadas.
    * 2026-08-12 — Implementação do catálogo `Area`, migração de `respective_area` para ForeignKey protegida, endpoint de áreas ativas e validação de áreas ativas na abertura de chamados.
    * 2026-08-12 — Definição do contrato funcional para cadastro de Áreas Responsáveis (`Area`), transformando `respective_area` em entidade com controle de status (`active`).
    * 2026-08-10 — Adequação do Contexto de Chamados para retornar HTTP 415 (Unsupported Media Type) caso o Content-Type: application/json seja omitido, refletindo a dependência estrita do formato JSON para troca de técnico responsável e geração de PDF.
    * 2026-08-10 — Atualização do método HTTP de exclusão de usuário para DELETE e adição de paginação na listagem de usuários.
    * 2026-08-05 — Implementação do grupo Django Helpdesk_Technician_Fiscal, integração LDAP com TECH_TECH_FISCAL (CN=CH - Technician_Fiscal), suporte a acesso técnico multi-grupo (TI + Fiscal) e centralização das permissões de área em fixdesk.permissions.
    * 2026-08-05 — Atualização do glossário de domínio: Adicionada a área Fiscal como Área Responsável cadastrada para abertura de chamados (junto com TI).
    * 2026-08-05 — Esclarecimento inicial da Área Responsável TI.
    * 2026-08-04 — Refatoração dos Detalhes Técnicos: Desacoplamento do protocolo HTTP_TECH_DETAILS da view central e criação dos serviços de domínio `add_technical_detail_message` e `add_technical_detail_file` com endpoints dedicados no Contexto de Chamados.
    * 2026-07-15 — Criação inicial do documento com mapeamento completo do domínio a partir da análise dos READMEs e código-fonte (models, views, services, classes).

## 1. Linguagem Ubíqua (Glossário)
* **Chamado (Ticket):** Solicitação de suporte aberta por um Usuário, contendo descrição do problema, setor, ocorrência e observações. Possui ciclo de vida com estados Aberto, Em Aguardo e Finalizado.
* **Solicitante (Ticket Requester):** Colaborador da empresa que abre um chamado de suporte.
* **Técnico (Technician):** Membro da equipe de TI ou da equipe Fiscal responsável por atender, transferir ou finalizar chamados de sua respectiva área autorizada.
* **Técnico Fiscal (Technician Fiscal):** Membro da equipe do Setor Fiscal responsável pelo atendimento de chamados direcionados à área Fiscal (grupo `Helpdesk_Technician_Fiscal`).
* **Gestor (Leader):** Técnico com permissões adicionais de gestão (grupo `Helpdesk_Leader_TI`).
* **Setor (Sector):** Área organizacional da empresa à qual o Solicitante pertence (ex: Financeiro, RH, Produção).
* **Ocorrência (Occurrence):** Categoria do tipo de problema reportado no chamado (ex: Hardware, Software, Lançamentos Fiscais).
* **Problema (Problem):** Subtipo específico dentro da Ocorrência (ex: Alocação de Máquina, Impressora, Impostos / Retenções).
* **Área Responsável (Respective Area):** Setor técnico/atendedora responsável pelo atendimento do chamado. Modelada como a entidade `Area` (com código único e controle de status), limitando os chamados apenas a áreas ativas (inicialmente **TI** e **Fiscal**).
* **Chat:** Histórico de mensagens trocadas entre Solicitante e Técnico dentro de um chamado, armazenado como texto estruturado com delimitadores.
* **Detalhes Técnicos (Tech Details):** Notas internas visíveis apenas para a equipe de TI ou área técnica autorizada, registradas em campo separado do chat público.
* **Arquivo Anexo (Ticket File):** Arquivo binário (imagem, documento, planilha) vinculado a um chamado, armazenado como BLOB no banco de dados.
* **Equipamento (Equipment):** Máquina (computador) que pode ser alocada a um chamado do tipo "Alocação de Máquina", identificada por endereço MAC.
* **Último Remetente (Last Sender):** Registro do último participante que enviou mensagem no chat, utilizado para controle de notificações.
* **Último Visualizador (Last Viewer):** Registro do último participante que visualizou o chat, utilizado para determinar necessidade de notificação por e-mail.
* **Notificação de E-mail (Ticket Mail):** Registro de controle que indica que um chamado possui mensagens não visualizadas, disparando envio de e-mail de lembrete após 3 horas.
* **Perfil de Acesso (Helpdesk Role):** Classificação do usuário baseada em grupos LDAP/Django — `Helpdesk_User` (Usuário), `Helpdesk_Technician_TI` (Técnico TI), `Helpdesk_Technician_Fiscal` (Técnico Fiscal) e `Helpdesk_Leader_TI` (Gestor TI) —, determinando autorização mono ou multi-área no sistema.
* **Dashboard TI:** Painel analítico para Técnicos de TI e Técnicos Fiscais autorizados, exibindo métricas de chamados da área correspondente (gráfico de pizza, histograma) e funcionalidades de gerenciamento.
* **PDF do Chamado:** Documento gerado sob demanda contendo as informações completas de um chamado, incluindo dados gerais, informações de máquina (quando aplicável) e histórico do chat.

## 2. Visão Geral do Domínio e Subdomínios
* **Core Domain:** Gestão de Chamados de Suporte — ciclo de vida completo dos tickets (abertura, atendimento, chat, transferência, aguardo, finalização, reabertura), incluindo arquivos anexos e alocação de equipamentos. É o coração do sistema e o diferencial competitivo para a operação interna de TI.
* **Supporting Domain:** Autenticação e Controle de Acesso — autenticação LDAP corporativa, provisionamento de usuários Django, mapeamento de grupos/perfis e gerenciamento de permissões. Necessário para o funcionamento seguro do Core Domain, mas não gera vantagem competitiva por si só.
* **Supporting Domain:** Análise e Dashboards — painéis analíticos com métricas de chamados (distribuição por status, histogramas temporais), filtragem avançada e gerenciamento de usuários. Suporta a tomada de decisão da equipe de TI.
* **Generic Domain:** Notificações por E-mail — varredura periódica de mensagens não visualizadas e envio de e-mails transacionais via SMTP. Funcionalidade genérica que poderia ser substituída por um serviço externo.
* **Generic Domain:** Infraestrutura e Proxy — Nginx (proxy reverso + TLS), Docker Compose (orquestração), Gunicorn (WSGI). Infraestrutura padrão sem lógica de negócio.

## 3. Contextos Delimitados (Bounded Contexts)

### 3.1. Contexto de Gestão de Chamados (Helpdesk)
* **Responsabilidade:** Gerencia o ciclo de vida completo dos chamados de suporte, desde a abertura até a finalização, incluindo chat, upload de arquivos, alocação de equipamentos, transferência de técnico e geração de PDF.
* **Agregados e Entidades:**
    * `Area` (entidade referenciada pelo agregado):
        * `id` (AutoField, PK)
        * `code` (CharField, único) — código interno da área (ex: TI, Fiscal)
        * `active` (BooleanField) — se `True`, permite receber novos chamados
        * `created_at` (DateTimeField) — data de criação
    * `SupportTicket` (aggregate root):
        * `id` (AutoField, PK)
        * `ticketRequester` (CharField) — nome do solicitante
        * `department` (CharField) — departamento do solicitante
        * `mail` (EmailField) — e-mail do solicitante
        * `company` (CharField) — unidade/empresa
        * `sector` (CharField) — setor organizacional
        * `occurrence` (CharField) — categoria do problema
        * `problemn` (CharField) — subtipo do problema
        * `observation` (TextField) — observações livres
        * `start_date` (DateTimeField) — data de abertura
        * `end_date` (DateTimeField, nullable) — data de finalização
        * `respective_area` (FK → Area) — área técnica responsável (mantém o nome físico da coluna `respective_area`)
        * `responsible_technician` (CharField, nullable) — nome do técnico atribuído
        * `PID` (IntegerField) — ID do usuário Django do solicitante
        * `chat` (TextField) — histórico de mensagens estruturado
        * `details` (TextField) — notas técnicas internas
        * `equipament` (TextField, nullable) — MAC do equipamento alocado
        * `date_alocate` (TextField, nullable) — datas de alocação do equipamento
        * `open` (BooleanField, nullable) — estado do chamado (`True`=Aberto, `False`=Finalizado, `None`=Em Aguardo)
        * `last_sender` (TextField) — último remetente do chat
        * `last_viewer` (TextField) — último visualizador do chat
        * `technician_mail` (EmailField, nullable) — e-mail do técnico responsável
    * `TicketFile` (entidade filha de SupportTicket):
        * `ticket` (FK → SupportTicket)
        * `file_name` (CharField) — nome original do arquivo
        * `file_type` (CharField) — tipo MIME detectado
        * `data` (BinaryField) — conteúdo binário do arquivo (BLOB)
    * `TicketMail` (entidade filha de SupportTicket):
        * `ticket` (FK → SupportTicket)
        * `send_date` (DateField) — data do registro de notificação pendente
* **Objetos de Valor (Value Objects):**
    * `ChatLogEntryConversation` — entrada de log do chat com `date`, `user`, `message`, `hours`. Imutável, serializado como string estruturada `[[Date:...],[System:...],[Hours:...]]`.
    * `ChatLogEntryFile` — entrada de log para upload de arquivo com `date`, `hours`, `user`, `action`. Imutável, mesmo padrão de serialização.
    * `StatusMap` — mapeamento tipado de strings de status (`open`, `close`, `stop`, `all`) para valores booleanos/nulos.
    * `HistogramData` — estrutura tipada com `days` (lista de labels) e `values` (lista de contagens) para dados de gráficos.
* **Serviços de Domínio:**
    * `get_active_areas` — retorna a lista de áreas ativas (`active=True`) para abertura de chamados em `GET /helpdesk/active-areas/`. Cada item contém `respective_area` (ID) e `respective_area_code` (código).
    * `submit_ticket` — cria um novo chamado, aceita o ID ou código da `respective_area`, valida sua existência e atividade, persiste a relação com `Area`, processa arquivos anexos e valida tipos MIME permitidos.
    * `change_responsible_technician` — transfere a responsabilidade do chamado para outro técnico, registra no chat e envia notificação.
    * `updating_chat_change_sender` — adiciona mensagem ao chat, atualiza `last_sender` e cria registro de notificação.
    * `add_technical_detail_message` — adiciona notas/mensagens técnicas internas visíveis apenas para a equipe de TI no campo `details`, sem alterar o histórico público `chat`.
    * `add_technical_detail_file` — valida e persiste arquivos anexos técnicos na entidade `TicketFile` e registra o evento em `details`, sem alterar o histórico público `chat`.
    * `ticket_open` — reabre um chamado em aguardo ou finalizado.
    * `ticket_close` — finaliza o chamado, registra `end_date` e envia notificação.
    * `ticket_stop` — coloca o chamado em aguardo, envia notificação.
    * `change_last_viewer` — atualiza o último visualizador para controle de notificações.
    * `create_pdf` — gera PDF com dados completos do chamado.
    * `process_files` — processa e persiste arquivos anexos em um novo chamado.
    * `equipaments_for_alocate` — consulta equipamentos disponíveis para alocação via conexão direta ao banco.
    * `date_equipaments_alocate` — retorna datas de alocação de um equipamento específico.
* **Eventos de Domínio publicados por este contexto:** `ChamadoCriado`, `TecnicoAtribuido`, `ChamadoTransferido`, `MensagemEnviada`, `ChamadoFinalizado`, `ChamadoEmAguardo`, `ChamadoReaberto`, `ArquivoAnexado`, `VisualizadorAtualizado` (ver Seção 5).

### 3.2. Contexto de Autenticação e Acesso (Identity)
* **Responsabilidade:** Autentica usuários via LDAP corporativo, provisiona/atualiza usuários e grupos no Django e gerencia sessões de login/logout.
* **Agregados e Entidades:**
    * `User` (Django Auth — aggregate root):
        * `username`, `first_name`, `last_name`, `password`
        * Relacionamento M:N com `Group`
    * `Group` (Django Auth):
        * `Helpdesk_User` — grupo de usuários comuns
        * `Helpdesk_Technician_TI` — grupo de técnicos de TI
        * `Helpdesk_Technician_Fiscal` — grupo de técnicos fiscais
        * `Helpdesk_Leader_TI` — grupo de gestores de TI
* **Objetos de Valor (Value Objects):**
    * `UserHelpDesk` — DTO que encapsula dados do usuário autenticado via LDAP (`name`, `department`, `job_title`, `mail`, `company`, `helpdesk`). Imutável após criação.
* **Serviços de Domínio:**
    * `validation` — endpoint de autenticação LDAP: recebe credenciais, conecta ao AD, extrai atributos do usuário, instancia `UserHelpDesk`, provisiona/atualiza User+Group no Django e realiza login.
    * `connect_ldap` — estabelece conexão LDAP, executa busca por `sAMAccountName` e retorna atributos.
    * `create_class_user` — constrói `UserHelpDesk` a partir dos atributos LDAP, determinando o perfil de acesso pelo parsing de todos os grupos em `memberOf` (incluindo `TECH_TECH_FISCAL`).
    * `create_or_verify_user` — cria ou atualiza User Django e seus grupos conforme o perfil LDAP de forma idempotente, preservando atribuições multi-grupo.
    * `auth_policy` (`get_authentication_mode`, `is_local_superuser_login_allowed`, `should_try_ldap`, `should_try_local_fallback`, `is_user_eligible_for_local_auth`) — serviço de regras e políticas de autenticação que controla os modos `ldap`, `ldap_or_local_superuser` e `django_superuser`, garantindo que o fallback local seja restrito estritamente a superusuários Django ativos (`is_superuser=True`).
* **Política de Autenticação e Contingência:**
    * **Modos de Autenticação:**
        * `ldap` (padrão): autenticação estrita corporativa via Active Directory/LDAP.
        * `ldap_or_local_superuser`: tenta autenticação LDAP primária e, em caso de falha/indisponibilidade, permite autenticação local exclusivamente para superusuários Django cadastrados e ativos quando `ALLOW_LOCAL_SUPERUSER_LOGIN=true`.
        * `django_superuser`: contingência/desenvolvimento onde apenas superusuários Django realizam login localmente.
    * **Elegibilidade Estrita de Superusuário:** Usuários comuns (`is_superuser=False`), inativos ou anônimos são sempre rejeitados no fallback local, preservando o LDAP corporativo como única fonte de autoridade para colaboradores.
* **Matriz de Acesso e Suporte Multi-Grupo:**
    * Atribuição M:N de grupos permite que um técnico seja associado a `Helpdesk_Technician_TI` e `Helpdesk_Technician_Fiscal` simultaneamente.
    * O módulo centralizado `fixdesk.permissions` calcula as áreas permitidas via `get_user_allowed_areas(user)`.
    * Matriz de Permissões:
        * **Helpdesk_User:** Abertura de chamados (TI/Fiscal), Visualização dos próprios chamados.
        * **Helpdesk_Technician_TI:** Abertura de chamados, Gerenciamento de chamados TI, Dashboard TI.
        * **Helpdesk_Technician_Fiscal:** Abertura de chamados, Gerenciamento de chamados Fiscal, Dashboard Fiscal.
        * **Técnico Dual (TI + Fiscal):** Abertura de chamados, Gerenciamento de chamados TI e Fiscal, Dashboards TI e Fiscal.
        * **Helpdesk_Leader_TI:** Abertura de chamados, Gerenciamento de chamados TI, Dashboard TI.
* **Eventos de Domínio publicados por este contexto:** `UsuarioAutenticado`, `UsuarioProvisionado` (ver Seção 5).

### 3.3. Contexto de Dashboards e Análise (Analytics)
* **Responsabilidade:** Fornece painéis analíticos com métricas agregadas de chamados, filtros avançados de busca, upload de arquivos complementares e gerenciamento de usuários do sistema.
* **Agregados e Entidades:** Não possui entidades próprias — consome dados de `SupportTicket`, `TicketFile`, `User` e `Group` do Contexto de Gestão de Chamados e do Contexto de Autenticação.
* **Objetos de Valor (Value Objects):**
    * `UserList` — TypedDict para serialização de usuários (`id`, `first_name`, `last_name`, `groups`).
* **Serviços de Domínio:**
    * `get_dash_board_pie` — agrega contagens de chamados por status (total, abertos, fechados, em aguardo, urgentes) para gráfico de pizza.
    * `get_dash_board_bar` — despacha para variantes de histograma (`week`, `month`, `year`, `all`).
    * `get_ticket_ti` — lista chamados com filtros de status e ordenação para o painel TI.
    * `upload_new_files` — permite upload de arquivos adicionais a um chamado existente com registro no chat.
    * `details_chat` — recupera notas técnicas de um chamado (visão exclusiva TI).
    * `get_users_fixdesk` — lista usuários do sistema com suporte a paginação e seus grupos.
    * `exclude_user` — remove um usuário do sistema, desvinculando seus chamados.
* **Eventos de Domínio publicados por este contexto:** `UsuarioExcluido`, `ArquivoComplementarAnexado` (ver Seção 5).

### 3.4. Contexto de Notificações (Notification)
* **Responsabilidade:** Monitora chamados com mensagens não visualizadas e envia e-mails de notificação quando ultrapassam o tempo limite de 3 horas.
* **Agregados e Entidades:** Não possui entidades próprias — consome `TicketMail` e `SupportTicket` do Contexto de Gestão de Chamados.
* **Objetos de Valor (Value Objects):** Nenhum exclusivo.
* **Serviços de Domínio:**
    * `send_pending_emails` — varre todos os registros `TicketMail`, verifica o tempo decorrido, identifica destinatário e envia e-mail com as últimas 5 mensagens.
    * `get_last_messages` — extrai as últimas mensagens do chat e determina o destinatário com base no tipo do remetente (User ou Technician).
    * `ticket_removal_email` — remove o registro de notificação após envio ou quando o chamado foi fechado/visualizado.
    * `ThreadManager` — executor genérico de tarefas periódicas em daemon thread, utilizado para agendar a varredura de notificações.
* **Eventos de Domínio publicados por este contexto:** `NotificacaoEnviada` (ver Seção 5).

## 4. Componentes de Infraestrutura e Serviços

* **Componente:** Banco de Dados MySQL 8
    * **Tipo:** Banco de dados relacional
    * **Contexto Vinculado:** Contexto de Gestão de Chamados, Contexto de Autenticação e Acesso, Contexto de Notificações
    * **Entidades/Dados Persistidos:** `SupportTicket`, `TicketFile`, `TicketMail`, `User`, `Group`, tabela `machines` (equipamentos)
    * **Modo de Acesso:** Síncrono via Django ORM (principal) e síncrono via `mysql.connector` (consulta direta à tabela `machines`)

* **Componente:** Servidor LDAP / Active Directory
    * **Tipo:** API externa / Diretório corporativo
    * **Contexto Vinculado:** Contexto de Autenticação e Acesso
    * **Entidades/Dados Persistidos:** Atributos de usuário (`displayName`, `department`, `title`, `mail`, `company`, `memberOf`)
    * **Modo de Acesso:** Síncrono via protocolo LDAP (biblioteca `ldap3`)

* **Componente:** Servidor SMTP
    * **Tipo:** API externa / Serviço de e-mail
    * **Contexto Vinculado:** Contexto de Gestão de Chamados, Contexto de Notificações
    * **Entidades/Dados Persistidos:** Nenhum (stateless — apenas envio)
    * **Modo de Acesso:** Assíncrono via thread (envio transacional no Contexto de Chamados), Síncrono na varredura periódica (Contexto de Notificações)

* **Componente:** Gunicorn WSGI Server
    * **Tipo:** Servidor de aplicação
    * **Contexto Vinculado:** Todos os contextos (ponto de entrada HTTP)
    * **Entidades/Dados Persistidos:** Nenhum
    * **Modo de Acesso:** Síncrono (requisições HTTP)

* **Componente:** Nginx Proxy Reverso
    * **Tipo:** Proxy reverso / Servidor de arquivos estáticos
    * **Contexto Vinculado:** Todos os contextos (camada de transporte)
    * **Entidades/Dados Persistidos:** Nenhum (arquivos estáticos do frontend React)
    * **Modo de Acesso:** Síncrono (HTTP/HTTPS com TLS)

* **Componente:** ThreadManager (Daemon Thread)
    * **Tipo:** Executor de tarefas periódicas em background
    * **Contexto Vinculado:** Contexto de Notificações
    * **Entidades/Dados Persistidos:** Nenhum (orquestra chamadas ao `EmailSender`)
    * **Modo de Acesso:** Assíncrono (daemon thread com intervalo configurável)

## 5. Eventos de Domínio

### Evento: ChamadoCriado
* **Publicado por:** Contexto de Gestão de Chamados (`submit_ticket`)
* **Consumido por:** Nenhum ainda (implícito — o chamado é persistido e fica disponível para consulta)
* **Payload essencial:** `ticket_id`, `ticketRequester`, `sector`, `occurrence`, `problemn`, `mail`, `start_date`
* **Gatilho:** Solicitante submete o formulário de abertura de chamado via `POST /helpdesk/submit-ticket/`

### Evento: TecnicoAtribuido
* **Publicado por:** Contexto de Gestão de Chamados (`change_responsible_technician`)
* **Consumido por:** Contexto de Notificações (envio de e-mail transacional ao Solicitante — assíncrono via thread)
* **Payload essencial:** `ticket_id`, `responsible_technician`, `technician_mail`, `mail` (do solicitante)
* **Gatilho:** Técnico assume o atendimento de um chamado sem técnico atribuído

### Evento: ChamadoTransferido
* **Publicado por:** Contexto de Gestão de Chamados (`change_responsible_technician`)
* **Consumido por:** Contexto de Notificações (envio de e-mail transacional — assíncrono via thread)
* **Payload essencial:** `ticket_id`, `old_technician`, `new_technician`, `technician_mail`
* **Gatilho:** Técnico transfere o chamado para outro técnico

### Evento: MensagemEnviada
* **Publicado por:** Contexto de Gestão de Chamados (`updating_chat_change_sender`)
* **Consumido por:** Contexto de Notificações (`verify_notification_call` — cria registro `TicketMail` — assíncrono via thread)
* **Payload essencial:** `ticket_id`, `sender` (User ou Technician), `message`, `date`, `hours`
* **Gatilho:** Solicitante ou Técnico envia mensagem no chat do chamado

### Evento: ChamadoFinalizado
* **Publicado por:** Contexto de Gestão de Chamados (`ticket_close`)
* **Consumido por:** Contexto de Notificações (envio de e-mail de confirmação — assíncrono via thread), remoção de `TicketMail` pendente
* **Payload essencial:** `ticket_id`, `technician`, `end_date`, `mail`
* **Gatilho:** Técnico responsável finaliza o chamado

### Evento: ChamadoEmAguardo
* **Publicado por:** Contexto de Gestão de Chamados (`ticket_stop`)
* **Consumido por:** Contexto de Notificações (envio de e-mail de notificação — assíncrono via thread)
* **Payload essencial:** `ticket_id`, `technician`, `date`, `hours`, `mail`
* **Gatilho:** Técnico responsável coloca o chamado em aguardo

### Evento: ChamadoReaberto
* **Publicado por:** Contexto de Gestão de Chamados (`ticket_open`)
* **Consumido por:** Contexto de Notificações (envio de e-mail de reabertura — assíncrono via thread)
* **Payload essencial:** `ticket_id`, `technician`, `technician_mail`, `mail`
* **Gatilho:** Técnico reabre um chamado finalizado ou em aguardo

### Evento: ArquivoAnexado
* **Publicado por:** Contexto de Gestão de Chamados (`process_files`)
* **Consumido por:** Nenhum ainda
* **Payload essencial:** `ticket_id`, `file_name`, `file_type`
* **Gatilho:** Solicitante anexa arquivo(s) durante a abertura do chamado

### Evento: ArquivoComplementarAnexado
* **Publicado por:** Contexto de Dashboards e Análise (`upload_new_files`)
* **Consumido por:** Nenhum ainda (registra no chat do chamado)
* **Payload essencial:** `ticket_id`, `file_name`, `file_type`, `uploader`
* **Gatilho:** Técnico faz upload de arquivo complementar em um chamado existente via painel TI

### Evento: UsuarioAutenticado
* **Publicado por:** Contexto de Autenticação e Acesso (`validation`)
* **Consumido por:** Contexto de Gestão de Chamados (sessão do Django — síncrono)
* **Payload essencial:** `username`, `name`, `department`, `job_title`, `mail`, `company`, `helpdesk` (perfil)
* **Gatilho:** Usuário submete credenciais válidas via `POST /validation/`

### Evento: UsuarioProvisionado
* **Publicado por:** Contexto de Autenticação e Acesso (`create_or_verify_user`)
* **Consumido por:** Nenhum ainda (o User Django é criado/atualizado no banco)
* **Payload essencial:** `username`, `first_name`, `last_name`, `groups`
* **Gatilho:** Primeiro login de um usuário que ainda não existe no Django

### Evento: UsuarioExcluido
* **Publicado por:** Contexto de Dashboards e Análise (`exclude_user`)
* **Consumido por:** Contexto de Gestão de Chamados (desvinculação de chamados — `PID` setado para 0 — síncrono)
* **Payload essencial:** `user_id`, `first_name`, `last_name`
* **Gatilho:** Técnico remove um usuário do sistema via modal de gerenciamento

### Evento: VisualizadorAtualizado
* **Publicado por:** Contexto de Gestão de Chamados (`change_last_viewer`)
* **Consumido por:** Nenhum ainda (atualiza campo no `SupportTicket`)
* **Payload essencial:** `ticket_id`, `viewer`, `requester_type` (tech ou user)
* **Gatilho:** Solicitante ou Técnico abre a janela de detalhe do chamado

### Evento: NotificacaoEnviada
* **Publicado por:** Contexto de Notificações (`send_pending_emails`)
* **Consumido por:** Nenhum (efeito colateral: e-mail enviado e registro `TicketMail` removido)
* **Payload essencial:** `ticket_id`, `mail_to`, `last_messages` (últimas 5 mensagens)
* **Gatilho:** Varredura periódica detecta mensagem não visualizada há mais de 3 horas

## 6. Mapa de Contexto (Context Map)

* **Contexto de Autenticação e Acesso → Contexto de Gestão de Chamados:** Customer-Supplier — o Contexto de Autenticação fornece o `User` autenticado e seus grupos para que o Contexto de Chamados valide permissões de acesso (decorators `@login_required`, verificação de `user.groups`).
* **Contexto de Autenticação e Acesso → Contexto de Dashboards e Análise:** Customer-Supplier — o Contexto de Autenticação fornece `User` e `Group` para validação de acesso ao dashboard (apenas técnicos) e para listagem/gerenciamento de usuários.
* **Contexto de Gestão de Chamados → Contexto de Notificações:** Customer-Supplier — o Contexto de Chamados cria registros `TicketMail` e dispara threads de envio de e-mail. O Contexto de Notificações consome `TicketMail` e `SupportTicket` para decidir se e para quem enviar notificações.
* **Contexto de Dashboards e Análise → Contexto de Gestão de Chamados:** Conformist — o Contexto de Dashboards consome diretamente as entidades `SupportTicket` e `TicketFile` do Contexto de Chamados sem adaptação, conformando-se ao modelo de dados do upstream.
* **Contexto de Gestão de Chamados → Servidor LDAP:** Anti-Corruption Layer (implícito) — a função `create_class_user` transforma os atributos brutos do LDAP no Value Object `UserHelpDesk`, isolando o domínio da estrutura do diretório externo.
* **Contexto de Gestão de Chamados → Tabela `machines`:** Shared Kernel (banco compartilhado) — o Contexto de Chamados consulta diretamente a tabela `machines` via `mysql.connector` (fora do ORM Django) para listar equipamentos disponíveis para alocação. A tabela é gerenciada por um sistema externo.

## 7. Fluxos de Aplicação (Engineers/Agent View)

### Fluxo: Autenticação de Usuário
* **Ator(es) envolvido(s):** Solicitante ou Técnico
* **Pré-condição:** O ator possui credenciais válidas no Active Directory corporativo.
* **Passos:**
    1. **Solicitante/Técnico** submete credenciais (usuário e senha) via formulário de login (`POST /validation/`).
    2. **Contexto de Autenticação e Acesso** extrai e valida os dados da requisição (JSON body).
    3. **Contexto de Autenticação e Acesso** chama `connect_ldap` para estabelecer conexão com o Servidor LDAP.
    4. **Servidor LDAP** autentica as credenciais via bind e executa busca por `sAMAccountName`.
    5. **SE** autenticação falha **ENTÃO**
        5a. **Contexto de Autenticação e Acesso** retorna erro 401 (acesso inválido).
       **SENÃO**
        5b. **Contexto de Autenticação e Acesso** recebe atributos do usuário (`displayName`, `department`, `title`, `mail`, `company`, `memberOf`).
    6. **Contexto de Autenticação e Acesso** chama `create_class_user` para construir o Value Object `UserHelpDesk` e determinar o Perfil de Acesso.
    7. **Contexto de Autenticação e Acesso** chama `create_or_verify_user` para provisionar ou atualizar o User Django.
    8. **Banco de Dados MySQL** persiste o User e seus Groups (`CREATE` ou `UPDATE`).
    9. **Contexto de Autenticação e Acesso** realiza `login(request, user_auth)` e publica o evento de domínio `UsuarioAutenticado` (síncrono — sessão Django).
    10. **Solicitante/Técnico** recebe JSON com dados do perfil e é redirecionado para `/helpdesk` ou `/dashboard-ti` conforme o Perfil de Acesso.
* **Pós-condição:** O ator possui sessão autenticada no Django com grupos de acesso corretos.
* **Fluxo(s) de erro/exceção:**
    * 2x. Dados ausentes ou malformados → retorna erro 400 com descrição.
    * 3x. Falha de conexão LDAP → levanta `AuthenticationError`, retorna erro 401.
    * 6x. Falha ao criar `UserHelpDesk` → levanta `CreateClassError`, retorna erro 400.
    * 7x. Falha ao criar/atualizar User Django → levanta `CreateClassError`, retorna erro 400.

---

### Fluxo: Abertura de Chamado
* **Ator(es) envolvido(s):** Solicitante
* **Pré-condição:** O Solicitante está autenticado e pertence ao grupo `Helpdesk_User` ou `Helpdesk_Technician_TI`.
* **Passos:**
    1. **Solicitante** acessa a página de abertura de chamados (`GET /helpdesk/`).
    2. **Contexto de Gestão de Chamados** valida permissão de grupo e renderiza a SPA React.
    3. **Solicitante** solicita token CSRF via `GET /helpdesk/get-token/`.
    4. **Contexto de Gestão de Chamados** valida grupo e retorna o token CSRF.
    5. **Solicitante** preenche o formulário de chamado (setor, ocorrência, problema, observação, arquivos opcionais, equipamento opcional) e submete via `POST /helpdesk/submit-ticket/`.
    6. **Contexto de Gestão de Chamados** extrai os dados do formulário (form_data).
    7. **SE** há arquivos anexados **ENTÃO**
        7a. **Contexto de Gestão de Chamados** chama `process_files` para validar tipos MIME e persistir os arquivos.
        7b. **Banco de Dados MySQL** persiste o `SupportTicket` e os `TicketFile` associados (`CREATE`).
       **SENÃO**
        7c. **Contexto de Gestão de Chamados** cria o `SupportTicket` sem arquivos.
        7d. **Banco de Dados MySQL** persiste o `SupportTicket` (`CREATE`).
    8. **Contexto de Gestão de Chamados** publica o evento de domínio `ChamadoCriado` (implícito — persistência concluída).
    9. **Solicitante** recebe JSON com o `ticket_id` criado e lista de arquivos recusados (se houver).
* **Pós-condição:** Um novo `SupportTicket` com status `open=True` existe no banco, com arquivos anexados (se fornecidos).
* **Fluxo(s) de erro/exceção:**
    * 6x. Dados ausentes ou malformados → retorna erro 300 com descrição.
    * 7ax. Arquivo com tipo MIME inválido → arquivo é adicionado à lista `denied_files` e ignorado (não interrompe o fluxo).
    * 7ax. Falha de persistência → levanta `ValueError`, retorna erro 300.

---

### Fluxo: Atendimento e Atribuição de Técnico
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O chamado existe com `responsible_technician=None` e `open=True`.
* **Passos:**
    1. **Técnico** seleciona um chamado sem técnico atribuído no Dashboard TI e escolhe atender.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `responsible_technician` no body.
    3. **Contexto de Gestão de Chamados** chama `change_responsible_technician`.
    4. **Contexto de Gestão de Chamados** verifica que o chamado não possui chat (primeiro atendimento).
    5. **Contexto de Gestão de Chamados** registra no chat: `"[System: <técnico> atendeu ao Chamado]"`.
    6. **Banco de Dados MySQL** atualiza `SupportTicket.responsible_technician` e `technician_mail` (`UPDATE`).
    7. **Contexto de Gestão de Chamados** publica o evento de domínio `TecnicoAtribuido` (assíncrono — dispara thread de envio de e-mail ao Solicitante).
    8. **Servidor SMTP** envia e-mail de notificação ao Solicitante (assíncrono).
    9. **Técnico** recebe JSON com o total de tickets da área TI.
* **Pós-condição:** O chamado possui um técnico responsável atribuído e o chat contém o registro de atendimento.
* **Fluxo(s) de erro/exceção:**
    * 3x. Campos obrigatórios ausentes → levanta `ValueError`, retorna erro 400.
    * 3x. Técnico tenta atribuir a si mesmo quando já é responsável → levanta `ValueError`, retorna erro 400.

---

### Fluxo: Transferência de Chamado
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O chamado já possui um técnico responsável atribuído.
* **Passos:**
    1. **Técnico** seleciona um chamado e escolhe transferir para outro técnico.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `responsible_technician` diferente do atual.
    3. **Contexto de Gestão de Chamados** chama `change_responsible_technician`.
    4. **Contexto de Gestão de Chamados** verifica que o técnico atual é diferente do novo técnico.
    5. **SE** o novo técnico é o próprio remetente da requisição **ENTÃO**
        5a. **Contexto de Gestão de Chamados** registra no chat: `"[System: <novo técnico> atendeu ao Chamado]"`.
       **SENÃO**
        5b. **Contexto de Gestão de Chamados** registra no chat: `"[System: <técnico atual> transferiu o Chamado para <novo técnico>]"`.
    6. **Banco de Dados MySQL** atualiza `SupportTicket.responsible_technician` e `technician_mail` (`UPDATE`).
    7. **Contexto de Gestão de Chamados** publica o evento de domínio `ChamadoTransferido` (implícito).
    8. **Técnico** recebe JSON com o total de tickets da área TI.
* **Pós-condição:** O chamado possui o novo técnico como responsável e o chat contém o registro de transferência.
* **Fluxo(s) de erro/exceção:**
    * 4x. Novo técnico é o mesmo que o atual → levanta `ValueError` ("Metodologia desconhecida para transferir o chamado a alguém que já é responsável por ele").

---

### Fluxo: Envio de Mensagem no Chat
* **Ator(es) envolvido(s):** Solicitante ou Técnico
* **Pré-condição:** O chamado existe e possui um técnico responsável atribuído.
* **Passos:**
    1. **Solicitante/Técnico** digita uma mensagem no chat do chamado e submete.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `chat`, `date`, `hours`, `user`, `helpdesk` no body.
    3. **Contexto de Gestão de Chamados** chama `updating_chat_change_sender`.
    4. **SE** `helpdesk == "helpdesk"` (Solicitante) **ENTÃO**
        4a. **Contexto de Gestão de Chamados** formata a mensagem como `[User: <mensagem>]`.
       **SENÃO**
        4b. **Contexto de Gestão de Chamados** formata a mensagem como `[Technician: <mensagem>]`.
    5. **Contexto de Gestão de Chamados** chama `update_last_sender` para atualizar o campo `last_sender`.
    6. **Banco de Dados MySQL** atualiza `SupportTicket.chat` e `SupportTicket.last_sender` (`UPDATE`).
    7. **Contexto de Gestão de Chamados** publica o evento de domínio `MensagemEnviada` (assíncrono — dispara `verify_notification_call` em thread).
    8. **Contexto de Gestão de Chamados** verifica se já existe `TicketMail` para o chamado.
    9. **SE** não existe `TicketMail` **ENTÃO**
        9a. **Banco de Dados MySQL** persiste novo `TicketMail` com `send_date=now()` (`CREATE`).
       **SENÃO**
        9b. Mantém o registro existente (a data original é preservada para o cálculo das 3 horas).
    10. **Solicitante/Técnico** recebe JSON com o chat atualizado.
* **Pós-condição:** O chat do chamado contém a nova mensagem e um registro de notificação existe para controle de tempo.
* **Fluxo(s) de erro/exceção:**
    * 3x. Falha ao atualizar o chat → retorna erro 400 com descrição.

---

### Fluxo: Finalização de Chamado
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O chamado está com status `open=True` ou `open=None` (Em Aguardo) e possui um técnico responsável.
* **Passos:**
    1. **Técnico** aciona a finalização do chamado via painel TI.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `status="close"`.
    3. **Contexto de Gestão de Chamados** chama `ticket_close`.
    4. **Contexto de Gestão de Chamados** verifica que o Técnico solicitante é o técnico responsável pelo chamado.
    5. **SE** o chamado já está finalizado (`open=False`) **ENTÃO**
        5a. **Contexto de Gestão de Chamados** retorna erro 205 ("Chamado já está finalizado").
       **SENÃO**
        5b. Prossegue com a finalização.
    6. **Contexto de Gestão de Chamados** define `open=False`, registra no chat `"[System: <técnico> Finalizou o Chamado]"`, limpa `technician_mail`, define `end_date`.
    7. **Banco de Dados MySQL** atualiza o `SupportTicket` (`UPDATE`).
    8. **Contexto de Gestão de Chamados** publica o evento de domínio `ChamadoFinalizado` (assíncrono — dispara thread de envio de e-mail).
    9. **Servidor SMTP** envia e-mail de confirmação de finalização ao Solicitante (assíncrono).
    10. **Técnico** recebe JSON com o total de tickets da área TI.
* **Pós-condição:** O chamado está com `open=False`, `end_date` preenchido e `technician_mail` limpo.
* **Fluxo(s) de erro/exceção:**
    * 4x. Técnico não é o responsável pelo chamado → retorna erro 304 ("Identificado que o Tecnico não é o atribuido ao Chamado").
    * 4x. Técnico não definido → retorna erro 304 ("Tecnico não Definido").

---

### Fluxo: Chamado Em Aguardo
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O chamado está com status `open=True` e possui um técnico responsável.
* **Passos:**
    1. **Técnico** aciona a ação de colocar o chamado em aguardo.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `status="stop"`.
    3. **Contexto de Gestão de Chamados** chama `ticket_stop`.
    4. **Contexto de Gestão de Chamados** verifica que o Técnico é o responsável pelo chamado.
    5. **SE** o chamado já está em aguardo (`open=None`) **ENTÃO**
        5a. **Contexto de Gestão de Chamados** retorna erro 204 ("Chamado já está em aguardo").
       **SENÃO**
        5b. Prossegue.
    6. **Contexto de Gestão de Chamados** define `open=None` e registra no chat `"[System: <técnico> Deixou esse chamado em aguardo]"`.
    7. **Banco de Dados MySQL** atualiza o `SupportTicket` (`UPDATE`).
    8. **Contexto de Gestão de Chamados** publica o evento de domínio `ChamadoEmAguardo` (assíncrono — dispara thread de envio de e-mail).
    9. **Servidor SMTP** envia e-mail de notificação ao Solicitante (assíncrono).
    10. **Técnico** recebe JSON com o total de tickets da área TI.
* **Pós-condição:** O chamado está com `open=None` (Em Aguardo).
* **Fluxo(s) de erro/exceção:**
    * 4x. Técnico não é o responsável → retorna erro 304.
    * 4x. Técnico não definido → retorna erro 304.

---

### Fluxo: Reabertura de Chamado
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O chamado está com status `open=False` (Finalizado) ou `open=None` (Em Aguardo).
* **Passos:**
    1. **Técnico** aciona a reabertura do chamado.
    2. **Contexto de Gestão de Chamados** recebe `POST /helpdesk/ticket/<id>` com `status="open"`.
    3. **Contexto de Gestão de Chamados** chama `ticket_open`.
    4. **SE** o chamado já está aberto (`open=True`) **ENTÃO**
        4a. **Contexto de Gestão de Chamados** retorna erro 206 ("Chamado já está aberto").
       **SENÃO**
        4b. Prossegue com a reabertura.
    5. **Contexto de Gestão de Chamados** define `open=True`, registra no chat `"[System: <técnico> Reabriu e atendeu o Chamado]"`, atualiza `technician_mail`.
    6. **Banco de Dados MySQL** atualiza o `SupportTicket` (`UPDATE`).
    7. **Contexto de Gestão de Chamados** publica o evento de domínio `ChamadoReaberto` (assíncrono — dispara thread de envio de e-mail).
    8. **Servidor SMTP** envia e-mail de reabertura ao Solicitante (assíncrono).
    9. **Técnico** recebe JSON com o total de tickets da área TI.
* **Pós-condição:** O chamado está com `open=True` e `technician_mail` atualizado.
* **Fluxo(s) de erro/exceção:**
    * 4ax. Chamado já está aberto → retorna erro 206.

---

### Fluxo: Notificação Periódica de Mensagens Não Visualizadas
* **Ator(es) envolvido(s):** ThreadManager (sistema automatizado)
* **Pré-condição:** O ThreadManager está ativo e existem registros `TicketMail` no banco.
* **Passos:**
    1. **ThreadManager** dispara a execução de `send_pending_emails` no intervalo configurado.
    2. **Contexto de Notificações** consulta todos os registros `TicketMail` com `select_related("ticket")`.
    3. **Contexto de Notificações** calcula o tempo decorrido entre `send_date` e a hora atual para cada registro.
    4. **SE** tempo decorrido < 10800 segundos (3 horas) **ENTÃO**
        4a. **Contexto de Notificações** ignora o registro e passa ao próximo.
       **SENÃO**
        4b. Prossegue com a verificação de envio.
    5. **SE** o chamado está finalizado (`open=False`) **ENTÃO**
        5a. **Banco de Dados MySQL** remove o registro `TicketMail` (`DELETE`).
       **SENÃO**
        5b. Prossegue.
    6. **SE** `last_sender` é diferente de `last_viewer` **ENTÃO**
        6a. **Banco de Dados MySQL** remove o registro `TicketMail` (`DELETE`) — a mensagem já foi visualizada.
       **SENÃO**
        6b. Prossegue com o envio.
    7. **Contexto de Notificações** chama `get_last_messages` para extrair as últimas 5 mensagens do remetente e determinar o destinatário.
    8. **SE** o último remetente é `Technician` **ENTÃO**
        8a. **Contexto de Notificações** define destinatário como o e-mail do Solicitante.
       **SENÃO**
        8b. **Contexto de Notificações** define destinatário como o e-mail do Técnico.
    9. **Servidor SMTP** envia e-mail de notificação com as últimas mensagens (síncrono).
    10. **Contexto de Notificações** publica o evento de domínio `NotificacaoEnviada`.
    11. **Banco de Dados MySQL** remove o registro `TicketMail` correspondente (`DELETE`).
* **Pós-condição:** E-mail de lembrete enviado ao destinatário apropriado e registro `TicketMail` removido.
* **Fluxo(s) de erro/exceção:**
    * 7x. Nenhuma mensagem válida encontrada → loga erro e ignora o registro.
    * 9x. Falha de envio SMTP → loga erro e mantém o registro `TicketMail` para nova tentativa no próximo ciclo.

---

### Fluxo: Geração de PDF do Chamado
* **Ator(es) envolvido(s):** Técnico ou Solicitante
* **Pré-condição:** O chamado existe e o ator está autenticado com permissão de acesso.
* **Passos:**
    1. **Técnico/Solicitante** solicita download do PDF do chamado via `POST /helpdesk/ticket/<id>` com header `HTTP_DOWNLOAD_TICKET`.
    2. **Contexto de Gestão de Chamados** chama `create_pdf`.
    3. **Banco de Dados MySQL** recupera o `SupportTicket` pelo ID (`READ`).
    4. **Contexto de Gestão de Chamados** inicializa o PDF (FPDF) com logos e fontes.
    5. **Contexto de Gestão de Chamados** adiciona dados gerais do chamado ao PDF (`add_ticket_info_to_pdf`).
    6. **SE** `problemn == "Alocação de Máquina"` **ENTÃO**
        6a. **Contexto de Gestão de Chamados** adiciona informações da máquina alocada ao PDF (`add_machine_info_to_pdf`).
       **SENÃO**
        6b. Prossegue sem informações de máquina.
    7. **SE** o chamado possui chat **ENTÃO**
        7a. **Contexto de Gestão de Chamados** converte o chat para dicionários e adiciona ao PDF (`add_chat_to_pdf`).
       **SENÃO**
        7b. Prossegue sem seção de chat.
    8. **Contexto de Gestão de Chamados** codifica o PDF em base64.
    9. **Técnico/Solicitante** recebe JSON com o PDF em base64.
* **Pós-condição:** O ator possui o PDF completo do chamado para download.
* **Fluxo(s) de erro/exceção:**
    * 3x. Chamado não encontrado → retorna erro 404.
    * 4x-8x. Falha na geração do PDF → loga erro e retorna erro 300 com descrição.

---

### Fluxo: Exclusão de Usuário
* **Ator(es) envolvido(s):** Técnico
* **Pré-condição:** O Técnico está autenticado e o usuário a ser excluído existe no sistema.
* **Passos:**
    1. **Técnico** seleciona um usuário no modal de gerenciamento e aciona a exclusão.
    2. **Contexto de Dashboards e Análise** recebe `DELETE /dashboard-ti/exclude-user/<user>`.
    3. **Contexto de Dashboards e Análise** separa o nome completo em `first_name` e `last_name`.
    4. **Banco de Dados MySQL** busca o User Django por `first_name` + `last_name` (`READ`).
    5. **SE** o usuário não existe **ENTÃO**
        5a. **Contexto de Dashboards e Análise** retorna erro 402 ("false").
       **SENÃO**
        5b. Prossegue com a exclusão.
    6. **Banco de Dados MySQL** desvincula os chamados do usuário: `SupportTicket.PID = 0` (`UPDATE`).
    7. **Banco de Dados MySQL** remove o User Django (`DELETE`).
    8. **Contexto de Dashboards e Análise** publica o evento de domínio `UsuarioExcluido` (síncrono).
    9. **Técnico** recebe JSON com `{"success": "ok"}`.
* **Pós-condição:** O usuário foi removido do sistema e seus chamados foram desvinculados (`PID=0`).
* **Fluxo(s) de erro/exceção:**
    * 4x. Nome malformado (menos de 2 partes) → levanta `IndexError`, retorna erro 400.
    * 5ax. Usuário não encontrado → retorna erro 402.
    * 6x-7x. Falha de persistência → retorna erro 400 com descrição.
