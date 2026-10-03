# Front-end — Next.js (BFF)

[← Índice da camada extra](../README.md) · [Arquitetura](../docs/architecture.md) · [Contratos](../docs/event-contracts.md)

App Next.js 14 (App Router, TypeScript) que serve de interface e de BFF para o sistema de pedidos: cria pedidos pela API Gateway existente, e lê/altera/cancela direto via AWS SDK (DynamoDB + EventBridge), usando a IAM role da instância em produção.

## Rodar localmente

Pré-requisitos: Node 20+, um profile AWS local (`aws configure`) com permissão de leitura na tabela `pedidos-db-wallacesantana` e `events:PutEvents` no bus `pedidos-event-bus-wallacesantana`.

```bash
cp .env.example .env.local   # edite com a URL real da sua API Gateway
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build de produção / imagem Docker

O `Dockerfile` **não roda `npm run build` dentro do container** — ele só empacota um build já pronto. Isso é deliberado: a instância do Elastic Beanstalk no lab é uma `t3.micro` (CPU burstable); sem créditos de CPU de sobra, compilar o Next.js (webpack + Tailwind) ali travou a instância por mais de 10 minutos em um deploy real. Build local ou em CI, sempre:

```bash
npm install
npm run build         # gera .next/standalone e .next/static
docker build -t pedidos-frontend .
docker run -p 8080:8080 --env-file .env.local pedidos-frontend
```

Em runtime de produção de verdade (CI com runner maior, ou o alvo em Fargate), o build pode voltar a rodar dentro do container sem problema — a restrição é específica desta instância pequena do lab.

## Páginas

| Rota | Descrição |
| --- | --- |
| `/` | Lista pedidos (lê DynamoDB) |
| `/pedidos/novo` | Formulário de criação (chama `POST /pedidos` na API Gateway) |
| `/pedidos/[pedidoId]` | Detalhe, formulário de alteração e botão de cancelamento (ambos via `events:PutEvents`) |

As mesmas operações também existem como rotas HTTP em `app/api/pedidos` (`GET`/`POST` em `/api/pedidos`, `GET`/`PATCH`/`DELETE` em `/api/pedidos/{pedidoId}`), caso algo externo ao próprio front precise chamá-las.

## Variáveis de ambiente

Ver [`.env.example`](.env.example). Nenhuma credencial AWS é configurada por variável — o SDK resolve pela IAM instance role (produção) ou pelo profile local (desenvolvimento).
