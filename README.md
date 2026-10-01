# Semana do Desenvolvedor · AWS Serverless

**Da requisição HTTP ao evento de negócio: construindo um sistema de pedidos na nuvem.**

![AWS](https://img.shields.io/badge/AWS-Serverless-232F3E?logo=amazonwebservices&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Etapa](https://img.shields.io/badge/Etapa-Dia%201%20documentado-00875A)
![Curso](https://img.shields.io/badge/Escola%20da%20Nuvem-AWS%20Developer%20Associate-FF9900)

Repositório de estudos da **Semana do Desenvolvedor AWS**, uma semana de prática da **Escola da Nuvem**, no contexto do curso AWS Developer Associate. O objetivo é desenvolver um sistema serverless de pedidos e registrar código, arquitetura, evidências e aprendizados de cada etapa.

[Arquitetura](#arquitetura) · [Progresso](#progresso-da-semana) · [Como reproduzir](#como-reproduzir-o-dia-1) · [Métricas](#métricas-e-acompanhamento) · [Dia 1](day_1/README.md) · [Dia 2](day_2/README.md)

## O que este projeto exercita

- Integração de uma API REST com funções Lambda em Python.
- Processamento assíncrono de pedidos com Amazon SQS FIFO.
- Publicação de eventos de negócio no Amazon EventBridge.
- Permissões entre serviços com IAM e investigação de execução por logs.
- Registro da evolução de uma aplicação orientada a eventos.

## Arquitetura

### Escopo do Dia 1

```mermaid
flowchart LR
    cliente[Cliente] -->|POST /pedidos| api[API Gateway REST]
    api --> pre[Lambda de pré-validação]
    pre -->|Pedido em JSON| fila[SQS FIFO · Pedidos]
    fila --> validacao[Lambda de validação]
    fila -.->|Após falhas e tentativas configuradas| dlq[SQS FIFO · DLQ]
    validacao -->|NovoPedidoValidado| bus[EventBridge · Event bus]
```

1. A pré-validação verifica a presença de `pedidoId` e `clienteId`.
2. O pedido é enviado à fila; a API retorna HTTP `200` com o identificador da mensagem.
3. A segunda Lambda verifica se `itens` é uma lista não vazia, adiciona `timestamp` quando ausente e publica `NovoPedidoValidado`.

**O retorno HTTP confirma o enfileiramento, não a conclusão do processamento.** O código usa `pedidoId` como `MessageGroupId`: a ordenação FIFO é por grupo, não global entre todos os pedidos. Veja a [documentação de grupos FIFO](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html).

### Visão completa do curso

![Arquitetura de referência: ingestão por API e S3, filas SQS, funções Lambda, EventBridge, SNS e DynamoDB](docs/arch-diagram.png)

O diagrama acima é a **arquitetura de referência do curso**. S3, SNS, DynamoDB e os consumidores posteriores ao EventBridge ainda não possuem implementação registrada neste repositório.

## Progresso da semana

| Etapa | Escopo | Situação no repositório |
| --- | --- | --- |
| Dia 1 | API → Lambda → SQS FIFO → Lambda → EventBridge | Código, roteiro e capturas disponíveis |
| Dia 2 | S3 → SQS Standard → Lambda → DynamoDB/SNS/FIFO | Código, dados de teste e evidências disponíveis |
| Próximas etapas | Evolução para a arquitetura completa | A registrar conforme o curso |

O progresso descreve os artefatos disponíveis; não representa uma verificação da conta AWS nem uma porcentagem de conclusão do curso.

## Organização

```text
.
├── README.md                   # Visão geral e painel de acompanhamento
├── day_1/
│   ├── README.md               # Diário, evidências e pendências da aula
│   ├── resume.md               # Resumo original
│   ├── full-context.md         # Roteiro resumido do laboratório
│   ├── created_services.md     # Inventário registrado no laboratório
│   ├── lambda/
│   │   ├── pre-validacao-lambda.py
│   │   └── validacao-lambda.py
│   └── screenshots/            # Cinco capturas do console AWS
├── day_2/
│   ├── README.md               # Diário, testes e evidências da aula
│   ├── full-context.md         # Roteiro resumido
│   ├── lambda/                 # Validação de arquivos S3
│   └── screenshots/test/       # Evidências dos testes do Dia 2
└── docs/
    ├── acompanhamento.md       # Critérios de progresso e medições
    └── arch-diagram.png        # Arquitetura completa de referência
```

Cada nova aula pode seguir o padrão `day_N/`, com um `README.md`, código e evidências. Crie a pasta quando houver material da aula para registrar.

## Como reproduzir o Dia 1

### Pré-requisitos

- Acesso à conta AWS do laboratório e às permissões previstas no curso.
- Uma região única para os recursos; o inventário original registra `us-west-1`.
- Runtime Python 3.12 conforme o roteiro e `curl` para a chamada HTTP.

O provisionamento é manual pelo console. O [roteiro da aula](day_1/full-context.md) contém as etapas da aula; não há infraestrutura como código ou deploy automatizado neste repositório.

### Configuração resumida

1. Crie as duas roles IAM para as Lambdas, com permissões de logs e acesso aos respectivos recursos.
2. Crie a DLQ FIFO e a fila principal FIFO; associe a DLQ com `maxReceiveCount = 3`, conforme o laboratório.
3. Crie a Lambda de pré-validação usando [este código](day_1/lambda/pre-validacao-lambda.py) e configure a URL da fila.
4. Crie a API REST com `POST /pedidos`, integração Lambda proxy e publique no stage `dev`.
5. Crie o event bus e a Lambda de validação usando [este código](day_1/lambda/validacao-lambda.py).
6. Configure o gatilho SQS da Lambda de validação com batch size `1`, conforme o roteiro.

No editor de cada Lambda, copie o respectivo código para `lambda_function.py` e utilize o handler `lambda_function.lambda_handler`.

| Função | Variável de ambiente | Valor a configurar |
| --- | --- | --- |
| Pré-validação | `SQS_QUEUE_URL` | URL da sua fila principal FIFO |
| Validação | `EVENT_BUS_NAME` | Nome do seu event bus |

Os nomes, ARNs e endpoints em `created_services.md` são registros do laboratório original. Use os recursos da sua própria conta para reproduzir a prática.

### Enviar um pedido

Substitua o endpoint de exemplo pela Invoke URL do seu stage:

```bash
INVOKE_URL='https://SEU_API_ID.execute-api.SUA_REGIAO.amazonaws.com/dev'

curl -i -X POST "${INVOKE_URL}/pedidos" \
  -H 'Content-Type: application/json' \
  -d '{
    "pedidoId": "lab001-seu-nome",
    "clienteId": "cliente001-seu-nome",
    "itens": [{"produto": "Caderno", "quantidade": 2}]
  }'
```

Resposta esperada da pré-validação após enfileiramento bem-sucedido:

```json
{
  "message": "Pedido recebido e enfileirado",
  "sqsMessageId": "identificador-gerado-pelo-sqs"
}
```

Confira os logs das duas funções e a resposta de `PutEvents` para acompanhar o restante do fluxo. A confirmação de publicação deve considerar `FailedEntryCount` e o resultado de cada entrada; o código atual apenas imprime a resposta. Referência: [API PutEvents](https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_PutEvents.html).

## Métricas e acompanhamento

**Inventário documental em 30/09/2026**, contado a partir dos arquivos locais:

| Indicador | Valor | Evidência |
| --- | --- | --- |
| Aulas com material registrado | 2 | `day_1/`, `day_2/` |
| Funções Lambda em Python | 3 | `day_1/lambda/`, `day_2/lambda/` |
| Rotas HTTP documentadas | 1 — `POST /pedidos` | Inventário do Dia 1 |
| Capturas do console | 5 | `day_1/screenshots/` |
| Evidências de testes do Dia 2 | 3 | `day_2/screenshots/test/` |
| Diagramas de referência em imagem | 1 | `docs/arch-diagram.png` |
| Testes automatizados | Não disponíveis | Sem suíte de testes no repositório |
| Latência, taxa de erro e custo | Não medidos | Sem exportações de telemetria |

O [painel de acompanhamento](docs/acompanhamento.md) define como registrar resultados e comparar as próximas etapas. Os badges do topo são descritivos; não indicam build, disponibilidade ou deploy verificado.

## Evidências do laboratório

![Captura do console do API Gateway no Dia 1](day_1/screenshots/api-gtw-day-one.png)

<details>
<summary>Ver capturas de IAM, Lambda, SQS e EventBridge</summary>

### IAM
![Roles IAM registradas no Dia 1](day_1/screenshots/iam_roles_day_one.png)

### Lambda
![Console AWS Lambda no Dia 1](day_1/screenshots/lambda_day_one.png)

### SQS
![Filas Amazon SQS no Dia 1](day_1/screenshots/sqs_day_one.png)

### EventBridge
![Event bus no console do Amazon EventBridge no Dia 1](day_1/screenshots/event-bridge-day-one.png)

</details>

Capturas documentam o estado do console naquele momento; não substituem a evidência de um teste completo do fluxo.

## Aprendizados e próximos passos

O Dia 1 introduz desacoplamento, mensageria, permissões entre serviços e integração orientada a eventos. A [análise da aula](day_1/README.md#pontos-a-evoluir) registra limitações observadas no código, incluindo validação de entrada, tratamento de falhas de publicação e idempotência.

Para acompanhar o desenvolvimento, registre ao final de cada aula: o que foi construído, como foi verificado, evidências e pendências. A próxima etapa anunciada no material é a ingestão de arquivos via S3.

---

Desenvolvido por [Wallace Santana](https://github.com/wallacemt) durante os laboratórios da Escola da Nuvem. Repositório educacional de acompanhamento do curso.
