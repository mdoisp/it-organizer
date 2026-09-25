# IT Organizer

Sistema de gestão de serviços de TI com portal do cliente e painel administrativo.
O escopo e a sequência de entregas estão em [it-organizer-plan.md](it-organizer-plan.md).

## Desenvolvimento local

Requisitos: Docker Engine e Docker Compose v2 ou superior.

```sh
cp .env.example .env
docker compose up --build --wait
```

| Serviço | Endereço |
| --- | --- |
| Frontend Next.js | http://localhost:3000 |
| API FastAPI / documentação | http://localhost:8000/docs |
| API / saúde e conexão com banco | http://localhost:8000/health e http://localhost:8000/ready |
| Notificações / saúde | http://localhost:8081/health |
| Uploads / saúde | http://localhost:8082/health |

As credenciais locais do PostgreSQL estão no `.env.example`; o banco fica acessível
somente na rede Docker. Se alterar as credenciais, atualize também `DATABASE_URL`.
Credenciais de um volume já inicializado não são alteradas pela edição do `.env`.

```sh
docker compose logs -f
docker compose down
```

`down` preserva os dados. Frontend e backend recarregam alterações automaticamente.
Após alterar dependências do frontend, execute
`docker compose run --rm --no-deps frontend npm ci` e reconstrua os containers.
Para mudanças em Go, execute `docker compose up --build --wait` novamente.

## Arquitetura e estado atual

- `frontend/`: Next.js, App Router, TypeScript e Tailwind; página inicial provisória.
- `backend/`: FastAPI, configuração por ambiente e SQLAlchemy. Camadas separadas
  em routers, services, repositories, models e schemas.
- `services/notifications/` e `services/uploads/`: módulos Go independentes,
  com endpoints de saúde. Integrações e Gin serão adicionados nas ST-09 e ST-10.
- `infra/`: decisões e pendências de hospedagem.

As funcionalidades de agendamento, autenticação e ordens de serviço ainda não
estão implementadas. As tabelas e migrations entram na ST-03.
As chaves externas no `.env.example` são reservadas para etapas futuras e podem
permanecer vazias neste estágio. Nunca versione o arquivo `.env`.

O navegador acessa a API por `NEXT_PUBLIC_API_URL` (localhost no desenvolvimento).
Comunicação entre containers usa os nomes internos, como `backend`,
`notifications`, `uploads` e `postgres`.

## Validação

```sh
docker compose exec frontend npm run lint
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
docker compose exec backend ruff check .
docker compose exec backend ruff format --check .
docker compose exec backend pytest
```

Com Go 1.26 instalado, rode em cada pasta `services/*`:

```sh
go vet ./...
go test ./...
go build ./...
```

A publicação do workflow de GitHub Actions e do badge de CI faz parte da ST-02.
Deploy contínuo ainda depende das contas, secrets e definição do banco persistente.
O PostgreSQL gratuito do Render [expira em 30 dias](https://render.com/docs/free),
o que exige revisar essa escolha antes da publicação.
