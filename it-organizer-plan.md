# IT Organizer — Plano de Desenvolvimento

## Visão Geral

Sistema web de gerenciamento de serviços de TI pessoal, com portal público para agendamento de clientes e painel administrativo para controle de ordens de serviço. O projeto é voltado para portfólio técnico, demonstrando competências em desenvolvimento full-stack, arquitetura de microsserviços, CI/CD e DevOps.

**Objetivo principal:** Construir um sistema utilizável e impressionante tecnicamente, hospedado 100% em planos gratuitos.

**Stack:**
- **Frontend:** Next.js (App Router) — Vercel
- **Backend principal:** Python + FastAPI — Render
- **Microsserviço de notificações:** Go — Render
- **Microsserviço de uploads:** Go — Render
- **Banco de dados:** PostgreSQL — Render
- **E-mail:** Resend (plano gratuito — 3.000 e-mails/mês)
- **Armazenamento de imagens:** Cloudinary (plano gratuito — 25GB)
- **Chatbot:** Gemini API (free tier — 15 RPM, 1M tokens/dia)
- **CI/CD:** GitHub Actions (desde o Day 0)
- **Ambiente local:** Docker Compose

---

## Arquitetura

```
Frontend (Next.js / Vercel)
  ├── Portal do Cliente (público)
  │     ├── Agendamento self-service
  │     ├── Acompanhamento de OS via token único
  │     ├── Chat assíncrono na OS
  │     └── Chatbot de agendamento (Gemini)
  └── Painel Admin (autenticado)
        ├── Dashboard
        ├── Gerenciamento de agendamentos e OS
        ├── Chat com clientes
        └── Catálogo de serviços e clientes
              │
              ▼
Backend Principal (FastAPI / Render)
  ├── Routers       ← entrada HTTP, validação
  ├── Services      ← regras de negócio
  ├── Repositories  ← acesso ao banco
  ├── Models        ← tabelas SQLAlchemy
  └── Schemas       ← validação Pydantic
        │
        ├──▶ Microsserviço de Notificações (Go / Render)
        │       └── Resend API (e-mail)
        ├──▶ Microsserviço de Uploads (Go / Render)
        │       └── Cloudinary API (imagens)
        └──▶ Gemini API (chatbot)

Banco de Dados: PostgreSQL (Render)
DevOps: GitHub Actions (CI/CD desde Day 0) + Docker Compose
```

---

## Arquitetura em Camadas do Backend

O backend segue arquitetura em camadas (Layered Architecture), adequada para APIs REST modernas:

```
Request HTTP
     ↓
  Routers         recebe o request, valida entrada via Pydantic, chama o Service
     ↓
  Services        contém as regras de negócio, orquestra Repositories
     ↓
  Repositories    executa queries no banco via SQLAlchemy, sem lógica de negócio
     ↓
  Models/Schemas  Models = tabelas do banco; Schemas = contratos de entrada e saída
```

Estrutura de pastas do backend:

```
backend/
├── app/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── clients.py
│   │   ├── services.py
│   │   ├── appointments.py
│   │   ├── work_orders.py
│   │   ├── messages.py
│   │   └── public.py          ← rotas sem autenticação
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── appointment_service.py
│   │   ├── work_order_service.py
│   │   └── notification_service.py
│   ├── repositories/
│   │   ├── client_repo.py
│   │   ├── appointment_repo.py
│   │   └── work_order_repo.py
│   ├── models/                ← SQLAlchemy ORM
│   ├── schemas/               ← Pydantic request/response
│   ├── core/
│   │   ├── config.py          ← variáveis de ambiente
│   │   ├── security.py        ← JWT
│   │   └── database.py        ← sessão do banco
│   └── main.py
```

---

## Status das Ordens de Serviço

`Agendado → Recebido → Em Diagnóstico → Aguardando Aprovação → Em Execução → Concluído → Entregue`

- **Agendado:** Cliente realizou o agendamento
- **Recebido:** Técnico confirmou o recebimento do equipamento
- **Em Diagnóstico:** Análise em andamento
- **Aguardando Aprovação:** Orçamento enviado, aguardando retorno do cliente
- **Em Execução:** Cliente aprovou, serviço sendo executado
- **Concluído:** Serviço finalizado, aguardando retirada/envio
- **Entregue:** Equipamento devolvido ao cliente
- **Cancelado:** Cliente recusou orçamento ou cancelou o serviço

---

## Sub-Tarefas

---

### ST-01 — Estrutura do Repositório e Ambiente Local

**Intent:**
Criar a estrutura base do monorepo e configurar o Docker Compose para desenvolvimento local. Esta é a fundação sobre a qual todo o resto será construído — precisa estar sólida antes de qualquer código de negócio.

**Expected Outcomes:**
- Repositório com estrutura de pastas definida para todos os serviços
- `docker-compose.yml` funcional levantando todos os serviços localmente
- README com instruções claras de como rodar o projeto
- `.env.example` com todas as variáveis necessárias documentadas

**Todo List:**
1. Criar estrutura de pastas do monorepo:
   ```
   /frontend
   /backend
   /services/notifications
   /services/uploads
   /infra
   ```
2. Inicializar o projeto Next.js em `/frontend` com App Router e Tailwind CSS
3. Inicializar o projeto FastAPI em `/backend` com a estrutura em camadas definida na arquitetura
4. Inicializar os projetos Go em `/services/notifications` e `/services/uploads`
5. Criar `docker-compose.yml` com todos os serviços: frontend, backend, notifications, uploads, postgres
6. Criar `.env.example` documentando todas as variáveis de ambiente de todos os serviços
7. Criar `README.md` com visão geral da arquitetura, decisões técnicas e instruções de setup local

**Relevant Context:**
- Todos os serviços se comunicam via rede interna Docker localmente
- Em produção, a comunicação entre backend e microsserviços será via HTTP (URLs do Render)
- O PostgreSQL local deve usar as mesmas credenciais padrão definidas no `.env.example`
- O CI/CD (ST-02) depende desta estrutura estar no repositório

**Status:** [x] completed — Estrutura criada e cinco serviços validados localmente com Docker Compose.

---

### ST-02 — CI/CD com GitHub Actions (Day 0)

**Intent:**
Configurar o pipeline de CI/CD imediatamente após a estrutura base, seguindo a prática DevOps de "shift left". Cada sub-tarefa subsequente já será integrada e deployada automaticamente, demonstrando que o projeto nunca existiu sem pipeline.

**Expected Outcomes:**
- Pipeline de CI validando lint, testes e build em cada pull request
- Pipeline de CD fazendo deploy automático ao fazer merge na branch `main`
- Todos os serviços deployados nos ambientes de produção (Vercel e Render)
- Badges de status do CI visíveis no README

**Todo List:**
1. Criar workflow de CI (`.github/workflows/ci.yml`) com:
   - Lint e type-check do frontend (Next.js + ESLint + TypeScript)
   - Lint e testes do backend Python (ruff + pytest)
   - Build e lint dos microsserviços Go (go build + go vet)
2. Criar workflow de CD (`.github/workflows/cd.yml`) com:
   - Deploy do frontend na Vercel via Vercel CLI
   - Deploy do backend no Render via Render Deploy Hook
   - Deploy dos microsserviços Go no Render via Deploy Hooks
3. Configurar todos os secrets necessários no GitHub (tokens Vercel, Render deploy hooks, variáveis de ambiente de produção)
4. Configurar variáveis de ambiente no painel da Vercel e do Render
5. Validar que o pipeline completo roda com sucesso em um commit inicial vazio
6. Atualizar README com badges de CI e links dos ambientes de produção

**Relevant Context:**
- O Render suporta deploy de imagens Docker — os microsserviços Go usarão Dockerfile
- A Vercel detecta Next.js automaticamente via Vercel CLI
- Os Render Deploy Hooks são URLs que disparam redeploy via POST
- A partir desta sub-tarefa, toda mudança mergeada na `main` já vai para produção

**Status:** [ ] in progress — CI preparado localmente, fora do commit da ST-01; publicação no GitHub, CD, secrets e deploy ainda pendentes.

---

### ST-03 — Modelagem do Banco de Dados e Migrations

**Intent:**
Definir e criar todas as tabelas do banco de dados com migrations versionadas via Alembic, incluindo as entidades de chat que serão usadas nas sub-tarefas posteriores.

**Expected Outcomes:**
- Schema completo criado via migrations Alembic
- Todas as relações entre entidades corretamente definidas com foreign keys e índices
- Seeds com dados de exemplo para desenvolvimento local

**Todo List:**
1. Definir o schema completo com as seguintes entidades:

   **Clientes e Serviços:**
   - `clients` (id, name, email, phone, address, created_at)
   - `services` (id, name, description, base_price, is_variable_price, category, active)

   **Agendamentos:**
   - `appointments` (id, client_id, service_id, scheduled_at, notes, status, created_at)

   **Ordens de Serviço:**
   - `work_orders` (id, appointment_id, client_id, public_token, status, diagnosis_notes, execution_notes, created_at, updated_at)
   - `work_order_items` (id, work_order_id, description, type[service|part], quantity, unit_price)
   - `work_order_images` (id, work_order_id, url, caption, uploaded_at)
   - `work_order_status_history` (id, work_order_id, from_status, to_status, changed_at, notes)
   - `work_order_messages` (id, work_order_id, sender_type[client|admin], content, sent_at, read_at)

   **Pagamento:**
   - `payment_summaries` (id, work_order_id, total_amount, payment_method, payment_notes, paid_at)

2. Configurar Alembic para gerenciamento de migrations
3. Criar a migration inicial com todas as tabelas e índices necessários
4. Criar seeds com dados de exemplo para desenvolvimento local

**Relevant Context:**
- `work_orders.public_token` é um UUID gerado na criação, usado para acesso público sem autenticação
- `services.is_variable_price` indica que o preço será definido durante o diagnóstico
- `work_order_items` registra tanto serviços executados quanto peças trocadas
- `work_order_messages` suporta o chat assíncrono entre cliente e técnico
- `payment_summaries.payment_notes` armazenará instruções de Pix e observações de parcelamento

**Status:** [ ] pending

---

### ST-04 — Backend: Autenticação e Módulo Admin

**Intent:**
Implementar autenticação JWT para proteger o painel administrativo. Apenas o técnico acessa o painel admin — não há cadastro público de administradores.

**Expected Outcomes:**
- Endpoint de login com JWT
- Middleware de autenticação protegendo todas as rotas admin
- Credenciais do admin configuradas via variáveis de ambiente

**Todo List:**
1. Implementar `POST /auth/login` — valida email/senha e retorna JWT
2. Implementar `POST /auth/refresh` — renovação de token
3. Implementar middleware de autenticação para injeção nas rotas protegidas
4. Configurar credenciais do admin via variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`)
5. Documentar no README como gerar o hash da senha via CLI

**Relevant Context:**
- Não existe tabela de usuários admin — credenciais fixas por variável de ambiente
- O token JWT deve ter expiração configurável via env (`JWT_EXPIRY`)
- Usar `python-jose` para JWT e `passlib[bcrypt]` para hash de senha
- A camada de lógica fica em `app/services/auth_service.py`

**Status:** [ ] pending

---

### ST-05 — Backend: Módulo de Clientes e Catálogo de Serviços

**Intent:**
Implementar os CRUDs de clientes e catálogo de serviços — entidades base do sistema que alimentam tanto o painel admin quanto o portal do cliente.

**Expected Outcomes:**
- CRUD completo de clientes (admin only)
- CRUD completo de catálogo de serviços (admin only)
- Endpoint público para listagem de serviços disponíveis

**Todo List:**
1. Implementar CRUD de clientes em `app/routers/clients.py` + `app/services/` + `app/repositories/`
2. Implementar CRUD de serviços em `app/routers/services.py`
3. Implementar endpoint público `GET /public/services` — retorna apenas serviços com `active=true`
4. Adicionar filtros e paginação nas listagens
5. Garantir que ao desativar um serviço ele suma do portal mas o histórico nas OS seja preservado

**Relevant Context:**
- Clientes são criados pelo admin ou automaticamente quando um cliente agenda pelo portal
- Serviços com `is_variable_price=true` devem ser marcados como "Orçamento sob consulta"
- A rota pública não requer autenticação e é consumida pelo portal do cliente

**Status:** [ ] pending

---

### ST-06 — Backend: Módulo de Agendamentos

**Intent:**
Implementar o sistema de agendamento, com endpoint público para self-service do cliente e endpoints admin para gerenciamento. A confirmação de recebimento do equipamento cria automaticamente a Ordem de Serviço.

**Expected Outcomes:**
- Endpoint público para criação de agendamento
- Endpoints admin para listagem, atualização e cancelamento
- Criação automática da OS ao confirmar recebimento

**Todo List:**
1. Implementar `POST /public/appointments` — criação pelo cliente (cria o cliente pelo e-mail se não existir)
2. Implementar `GET /appointments` (admin) — listagem com filtros por status e data
3. Implementar `PUT /appointments/{id}` (admin) — atualização
4. Implementar `POST /appointments/{id}/confirm-receipt` (admin) — confirma recebimento, cria OS com status `Recebido` e envia e-mail ao cliente com o link público da OS
5. Implementar `POST /appointments/{id}/cancel` — cancelamento (admin ou cliente via token)
6. Adicionar rate limiting no `POST /public/appointments` — máximo 3 agendamentos por e-mail por dia
7. Disparar evento de notificação ao microsserviço de notificações ao criar ou cancelar

**Relevant Context:**
- O `public_token` da OS é gerado na `confirm-receipt` e enviado ao cliente por e-mail
- O campo `notes` do agendamento é onde o cliente descreve o problema
- O rate limiting pode ser implementado com `slowapi` (FastAPI)

**Status:** [ ] pending

---

### ST-07 — Backend: Módulo de Ordens de Serviço

**Intent:**
Implementar o módulo central do sistema — gerenciamento completo das OS com transições de status, itens, imagens, histórico e resumo de pagamento. Inclui o endpoint público para o cliente acompanhar sua OS via token.

**Expected Outcomes:**
- CRUD completo de OS com controle de transições de status válidas
- Registro de itens (serviços e peças) com preços
- Histórico de status preservado e consultável
- Geração de resumo de pagamento com instruções de Pix
- Endpoint público de acompanhamento via token único

**Todo List:**
1. Implementar `GET /work-orders` (admin) — listagem com filtros
2. Implementar `GET /work-orders/{id}` (admin) — detalhes completos
3. Implementar `PUT /work-orders/{id}/status` (admin) — transição de status com validação da sequência permitida
4. Implementar `PUT /work-orders/{id}/notes` (admin) — notas de diagnóstico e execução
5. Implementar `POST /work-orders/{id}/items` (admin) — adicionar item (serviço ou peça)
6. Implementar `DELETE /work-orders/{id}/items/{item_id}` (admin) — remover item
7. Implementar `POST /work-orders/{id}/payment` (admin) — registrar resumo de pagamento
8. Implementar `GET /public/work-orders/{token}` — consulta pública sem autenticação
9. Registrar automaticamente em `work_order_status_history` a cada transição
10. Disparar eventos ao microsserviço de notificações nas transições relevantes

**Relevant Context:**
- As transições de status devem seguir a sequência definida — não permitir saltos inválidos
- O resumo de pagamento é visível ao cliente via token público
- Imagens são gerenciadas pelo microsserviço de uploads (ST-09) — o backend só armazena URLs

**Status:** [ ] pending

---

### ST-08 — Backend: Módulo de Chat e Chatbot

**Intent:**
Implementar o chat assíncrono entre cliente e técnico na OS (via token público) e o chatbot de agendamento no portal do cliente usando Gemini API.

**Expected Outcomes:**
- Endpoints de mensagens na OS (envio e listagem) acessíveis pelo cliente via token e pelo admin
- Notificação por e-mail ao técnico quando cliente envia mensagem e vice-versa
- Endpoint de chat com Gemini para guiar o agendamento

**Todo List:**
1. Implementar `GET /public/work-orders/{token}/messages` — listagem de mensagens (cliente via token)
2. Implementar `POST /public/work-orders/{token}/messages` — cliente envia mensagem
3. Implementar `GET /work-orders/{id}/messages` (admin) — listagem de mensagens
4. Implementar `POST /work-orders/{id}/messages` (admin) — técnico responde
5. Implementar `PUT /work-orders/{id}/messages/read` (admin) — marcar mensagens como lidas
6. Disparar notificação por e-mail ao enviar mensagem (cliente notifica técnico, técnico notifica cliente)
7. Implementar `POST /public/chatbot` — endpoint de chat com Gemini para auxiliar no agendamento:
   - Recebe o histórico da conversa e a mensagem atual
   - Envia ao Gemini com um system prompt descrevendo os serviços disponíveis
   - Retorna a resposta do Gemini ao frontend
8. Configurar `GEMINI_API_KEY` nas variáveis de ambiente

**Relevant Context:**
- O chatbot usa `google-generativeai` Python SDK
- O system prompt do Gemini deve incluir a lista de serviços disponíveis (buscada do banco) e instruir o modelo a guiar o cliente até o formulário de agendamento
- O chat assíncrono usa polling no frontend (não WebSocket) para simplicidade e compatibilidade com Render free tier
- `work_order_messages.read_at` permite mostrar indicador de mensagens não lidas no painel admin

**Status:** [ ] pending

---

### ST-09 — Microsserviço de Uploads (Go)

**Intent:**
Implementar microsserviço em Go responsável pelo upload e gerenciamento de imagens dos equipamentos nas OS, usando Cloudinary como armazenamento.

**Expected Outcomes:**
- Serviço HTTP em Go com endpoint de upload e remoção de imagens
- Imagens armazenadas no Cloudinary organizadas por ID de OS
- Validação de tipo e tamanho de arquivo

**Todo List:**
1. Estruturar o projeto Go com Gin
2. Implementar `POST /upload` — recebe multipart/form-data com imagem e ID da OS, faz upload ao Cloudinary e retorna a URL pública
3. Implementar `DELETE /upload` — remove imagem do Cloudinary pelo public_id
4. Organizar imagens em pastas por ID de OS no Cloudinary
5. Validar tipo de arquivo (jpg, png, webp) e tamanho máximo (10MB)
6. Implementar autenticação via chave secreta compartilhada (`UPLOAD_SECRET_KEY`)
7. Criar Dockerfile multi-stage para o serviço

**Relevant Context:**
- O backend principal chama este serviço, recebe a URL e salva em `work_order_images`
- A autenticação é via header `X-Secret-Key` — sem JWT, pois é comunicação interna entre serviços
- Cloudinary free tier: 25GB de armazenamento

**Status:** [ ] pending

---

### ST-10 — Microsserviço de Notificações (Go)

**Intent:**
Implementar microsserviço em Go responsável pelo envio de e-mails transacionais via Resend API, incluindo lembrete automático 24h antes dos agendamentos.

**Expected Outcomes:**
- Serviço HTTP em Go recebendo eventos de notificação do backend principal
- Templates de e-mail HTML para cada tipo de evento
- Job agendado enviando lembretes 24h antes dos agendamentos

**Todo List:**
1. Estruturar o projeto Go com Gin
2. Implementar `POST /notify` — recebe tipo de evento e dados, seleciona template e envia e-mail via Resend
3. Criar templates de e-mail HTML para:
   - Confirmação de agendamento
   - Cancelamento de agendamento
   - OS criada com link público
   - Orçamento disponível para aprovação
   - Serviço concluído
   - Resumo de pagamento com instruções de Pix
   - Nova mensagem de chat (cliente → técnico e técnico → cliente)
4. Implementar cron job para buscar agendamentos do dia seguinte via `GET /appointments?date=tomorrow` e enviar lembretes
5. Implementar autenticação via chave secreta compartilhada (`NOTIFY_SECRET_KEY`)
6. Criar Dockerfile multi-stage para o serviço

**Relevant Context:**
- Autenticação via header `X-Secret-Key` — comunicação interna entre serviços
- Resend free tier: 3.000 e-mails/mês
- O cron de lembretes roda uma vez por dia (ex: às 10h) e chama o backend principal para buscar agendamentos

**Status:** [ ] pending

---

### ST-11 — Frontend: Portal do Cliente

**Intent:**
Implementar as páginas públicas do Next.js: apresentação dos serviços, chatbot de agendamento, formulário de agendamento, acompanhamento de OS e chat com o técnico.

**Expected Outcomes:**
- Página inicial com serviços e chatbot
- Fluxo de agendamento completo
- Página de acompanhamento de OS com chat
- Design responsivo e profissional com Tailwind CSS

**Todo List:**
1. Criar página inicial (`/`) com:
   - Apresentação dos serviços disponíveis (consumindo `GET /public/services`)
   - Call-to-action para agendamento
   - Widget de chatbot Gemini no canto inferior direito
2. Criar página de agendamento (`/agendar`) com:
   - Formulário de dados do cliente
   - Seleção de serviço e data/horário
   - Campo de descrição do problema
   - Confirmação com resumo antes de enviar
3. Criar página de confirmação (`/agendamento/confirmado`)
4. Criar página de acompanhamento de OS (`/os/[token]`) com:
   - Linha do tempo visual do status atual
   - Histórico de transições de status
   - Itens da OS (visível após diagnóstico)
   - Resumo de pagamento com instruções de Pix (quando disponível)
   - Galeria de imagens do equipamento
   - Chat assíncrono com o técnico (polling a cada 30 segundos)
5. Implementar o componente de chatbot — janela flutuante que conversa com `POST /public/chatbot` e, ao finalizar, redireciona para `/agendar` com os dados preenchidos

**Relevant Context:**
- O link da OS (`/os/[token]`) é enviado por e-mail após confirmação de recebimento
- O chatbot usa o histórico de mensagens mantido no estado local (não persiste no banco)
- O polling de mensagens usa `setInterval` com fetch — sem WebSocket

**Status:** [ ] pending

---

### ST-12 — Frontend: Painel Administrativo

**Intent:**
Implementar o painel admin protegido por autenticação com todas as telas de gerenciamento do ciclo de vida dos serviços.

**Expected Outcomes:**
- Dashboard com visão geral operacional
- Gerenciamento completo de agendamentos e OS
- Interface de chat com clientes
- Cadastro de clientes e catálogo de serviços

**Todo List:**
1. Implementar tela de login (`/admin/login`)
2. Configurar middleware Next.js para proteger todas as rotas `/admin/*`
3. Implementar dashboard (`/admin`) com:
   - Contadores: agendamentos do dia, OS em andamento, OS concluídas no mês
   - Lista dos próximos agendamentos
   - Lista de OS com ação pendente
   - Indicador de mensagens não lidas
4. Implementar tela de agendamentos (`/admin/agendamentos`) com:
   - Listagem com filtros por status e data
   - Ação de confirmar recebimento (cria OS)
   - Ação de cancelar
5. Implementar tela de detalhes da OS (`/admin/os/[id]`) com:
   - Controle de transição de status
   - Editor de notas de diagnóstico e execução
   - Gerenciamento de itens com preços
   - Upload de fotos do equipamento
   - Geração do resumo de pagamento
   - Chat com o cliente
6. Implementar tela de clientes (`/admin/clientes`)
7. Implementar tela de catálogo de serviços (`/admin/servicos`) com CRUD completo

**Relevant Context:**
- JWT armazenado em cookie httpOnly — o middleware Next.js valida o cookie
- O upload de imagens chama o backend que repassa ao microsserviço de uploads
- O chat usa polling a cada 30 segundos, igual ao portal do cliente

**Status:** [ ] pending

---

### ST-13 — Dockerização Completa

**Intent:**
Garantir que todos os serviços tenham Dockerfiles otimizados e que o ambiente local via Docker Compose seja completamente funcional, consolidando as boas práticas de containerização do projeto.

**Expected Outcomes:**
- Dockerfile para cada serviço com multi-stage build
- `docker-compose.yml` funcional com hot-reload para desenvolvimento
- Healthchecks configurados em todos os containers

**Todo List:**
1. Criar Dockerfile multi-stage para o frontend Next.js (build + runtime)
2. Criar Dockerfile para o backend FastAPI
3. Criar Dockerfile multi-stage para cada microsserviço Go (`golang:alpine` para build, `alpine` para runtime)
4. Revisar e finalizar `docker-compose.yml` com hot-reload para todos os serviços
5. Adicionar healthchecks nos containers
6. Criar `docker-compose.prod.yml` como referência de configuração de produção
7. Validar que `docker compose up` sobe todo o ambiente local funcionando end-to-end

**Relevant Context:**
- Os Dockerfiles dos microsserviços Go já são criados nas ST-09 e ST-10 — aqui são apenas revisados e consolidados
- O hot-reload do FastAPI usa `uvicorn --reload` com volume montado
- O hot-reload do Next.js usa volumes montados no Docker Compose

**Status:** [ ] pending

---

## Notas Gerais

- **Custo zero:** Vercel (free), Render (free tier), Resend (3k e-mails/mês), Cloudinary (25GB), Gemini API (1M tokens/dia)
- **Render free tier:** Serviços "adormecem" após 15 minutos de inatividade — o primeiro request pode demorar alguns segundos. Aceitável para portfólio.
- **Gemini API free tier:** A chave API é configurada no backend — os limites são aplicados na chave, não em conta de pagamento. Nenhum custo enquanto dentro do free tier.
- **Segurança mínima:** HTTPS automático (Vercel e Render), JWT com expiração, rate limiting no agendamento público, autenticação por chave secreta entre microsserviços.
- **Fora do escopo (decisão consciente):** Pagamento online integrado, multi-usuário, app mobile, WebSocket em tempo real.

## Registro de implementação — 2026-09-24

- ST-01 concluída: monorepo, página inicial provisória, API com liveness/readiness,
  módulos Go, PostgreSQL, Docker Compose e documentação. Cinco serviços saudáveis.
- Validações: lint e tipos do frontend; build de produção em container; Ruff e
  dois testes do backend; gofmt, go vet e build dos dois módulos Go.
- ST-02 iniciada localmente com CI para os serviços e smoke test do Compose.
  O workflow ficou fora do commit da ST-01; publicação e execução no GitHub
  estão pendentes, e não há deploy configurado.
- Ajuste necessário antes do deploy: PostgreSQL gratuito do Render expira em
  30 dias (https://render.com/docs/free). Definir uma opção persistente que
  mantenha o objetivo de custo zero.
- Próxima etapa de código: ST-03, modelagem e migrations Alembic.
