# Dia 1 · Roteiro resumido do laboratório

[← Diário da aula](README.md) · [Visão geral do projeto](../README.md) · [Recursos registrados](created_services.md)

## Objetivo

Construir o fluxo inicial de ingestão de pedidos da **Semana do Desenvolvedor AWS**, da Escola da Nuvem, no contexto do curso AWS Developer Associate.

```text
POST /pedidos → Lambda de pré-validação → SQS FIFO → Lambda de validação → EventBridge
                                            ↓
                                         DLQ FIFO
```

Ao final da prática, o sistema deverá receber pedidos por HTTP, enfileirá-los e publicar o evento `NovoPedidoValidado` após a validação.

## Antes de começar

- Acesse a conta fornecida pelo curso e confirme a conta e a região selecionadas.
- Substitua `seu-nome` por um identificador único em todos os recursos.
- Use a mesma região nos serviços regionais do laboratório.
- Anote os ARNs, a URL da fila e a Invoke URL da API conforme forem criados.

A conta do laboratório tem permissões limitadas. Os nomes dos menus podem variar em relação ao material da aula.

## 1. Criar as roles IAM

Em **IAM → Roles → Create role**, selecione **AWS service → Lambda** e associe a política `AWSLambdaBasicExecutionRole`, que permite gravar logs no CloudWatch.

Crie as duas roles:

| Role | Responsabilidade |
| --- | --- |
| `lambda-prevalidacao-role-seu-nome` | Executar a pré-validação e enviar pedidos ao SQS |
| `lambda-validacao-pedidos-role-seu-nome` | Consumir o SQS e publicar eventos no EventBridge |

As permissões específicas serão adicionadas após a criação da fila e do barramento.

## 2. Configurar as filas SQS FIFO

Em **SQS → Create queue**, crie primeiro a DLQ e depois a fila principal:

| Configuração | DLQ | Fila principal |
| --- | --- | --- |
| Tipo | FIFO | FIFO |
| Nome | `pedidos-fifo-dlq-seu-nome.fifo` | `pedidos-fifo-queue-seu-nome.fifo` |
| Dead-letter queue | — | Associar à DLQ criada |
| Maximum receives | — | `3` |

O sufixo `.fifo` é obrigatório. Salve o ARN da DLQ, o ARN da fila principal e a URL da fila principal.

A DLQ recebe mensagens conforme a política de reprocessamento configurada. No código desta aula, a ordenação é por `pedidoId`, usado como grupo de mensagens, e não global entre todos os pedidos.

### Permissão de envio

Na role de pré-validação, acesse **Add permissions → Create inline policy → JSON**. Substitua `REGION`, `ACCOUNT_ID` e `seu-nome` pelos valores da sua fila:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:pedidos-fifo-queue-seu-nome.fifo"
    }
  ]
}
```

Salve como `SQSSendMessageToPedidosFIFO-seu-nome`.

## 3. Criar a Lambda de pré-validação

Em **Lambda → Create function → Author from scratch**, configure:

| Campo | Valor |
| --- | --- |
| Nome | `pre-validacao-lambda-seu-nome` |
| Runtime da aula | Python 3.12 |
| Role | `lambda-prevalidacao-role-seu-nome` |
| Handler | `lambda_function.lambda_handler` |
| Variável `SQS_QUEUE_URL` | URL da fila principal FIFO |

Copie o [código de pré-validação](lambda/pre-validacao-lambda.py) para `lambda_function.py` no editor e clique em **Deploy**. Configure a variável em **Configuration → Environment variables**.

A função verifica `pedidoId` e `clienteId`, envia o pedido ao SQS e retorna `sqsMessageId`. JSON malformado ou identificadores ausentes resultam em HTTP `400`.

## 4. Publicar a API REST

Em **API Gateway**, crie uma **REST API** com as seguintes configurações:

| Campo | Valor |
| --- | --- |
| Nome | `pedidos-api-seu-nome` |
| Endpoint type | Regional |
| Recurso | `/pedidos` |
| Método | `POST` |
| Integração | Lambda Function, com Lambda proxy integration |
| Função | `pre-validacao-lambda-seu-nome` |
| Stage | `dev` |

Execute **Deploy API**, crie o stage `dev` e anote sua **Invoke URL**.

### Testar o enfileiramento

Em um terminal Bash, substitua a URL de exemplo pela URL do seu stage:

```bash
INVOKE_URL='https://SEU_API_ID.execute-api.SUA_REGIAO.amazonaws.com/dev'

curl -i -X POST "${INVOKE_URL}/pedidos" \
  -H 'Content-Type: application/json' \
  -d '{
    "pedidoId": "lab001-seu-nome",
    "clienteId": "clienteXYZ-seu-nome",
    "itens": [
      {"produto": "Caneta Azul", "quantidade": 10},
      {"produto": "Caderno Universitário", "quantidade": 2}
    ]
  }'
```

Resposta esperada: HTTP `200` com corpo semelhante a:

```json
{
  "message": "Pedido recebido e enfileirado",
  "sqsMessageId": "identificador-gerado-pelo-sqs"
}
```

Confira o log group `/aws/lambda/pre-validacao-lambda-seu-nome` no CloudWatch. Antes de configurar a segunda Lambda, também é possível consultar a mensagem em **SQS → Send and receive messages → Poll for messages**. Não a exclua: ela será usada na próxima etapa.

**HTTP `200` confirma o enfileiramento, não a conclusão da validação.**

## 5. Criar o barramento EventBridge

Em **EventBridge → Event buses → Create event bus**, crie `pedidos-event-bus-seu-nome` e anote seu ARN. O laboratório não exige Archive ou Schema Registry nesta etapa.

### Permissões de consumo e publicação

Na role `lambda-validacao-pedidos-role-seu-nome`, crie uma política inline com o conteúdo abaixo, substituindo os valores pelos ARNs da sua fila e do seu barramento:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:REGION:ACCOUNT_ID:pedidos-fifo-queue-seu-nome.fifo"
    },
    {
      "Effect": "Allow",
      "Action": "events:PutEvents",
      "Resource": "arn:aws:events:REGION:ACCOUNT_ID:event-bus/pedidos-event-bus-seu-nome"
    }
  ]
}
```

Salve como `SQSReadEventBridgePutPolicy-seu-nome`.

## 6. Criar a Lambda de validação

Crie outra função Lambda com as configurações:

| Campo | Valor |
| --- | --- |
| Nome | `validacao-pedidos-lambda-seu-nome` |
| Runtime da aula | Python 3.12 |
| Role | `lambda-validacao-pedidos-role-seu-nome` |
| Handler | `lambda_function.lambda_handler` |
| Variável `EVENT_BUS_NAME` | `pedidos-event-bus-seu-nome` |
| Trigger | Fila `pedidos-fifo-queue-seu-nome.fifo` |
| Batch size do laboratório | `1` |

Copie o [código de validação](lambda/validacao-lambda.py) para `lambda_function.py`, clique em **Deploy**, configure a variável de ambiente e adicione o gatilho SQS.

A função verifica se `itens` é uma lista não vazia, adiciona `timestamp` quando ausente e publica no EventBridge:

- **Source:** `lab.aula1.pedidos.validacao`.
- **DetailType:** `NovoPedidoValidado`.
- **Detail:** dados do pedido em JSON.

## 7. Verificar o fluxo completo

Repita a chamada HTTP com outro `pedidoId` e registre as evidências:

| Etapa | O que conferir |
| --- | --- |
| API | HTTP `200` e `sqsMessageId` |
| Pré-validação | Log de recebimento e envio ao SQS |
| Validação | Logs de consumo, validação e resposta do EventBridge |
| Publicação | `FailedEntryCount` igual a `0` e resultado da entrada em `PutEvents` |

Use o mesmo `pedidoId` para correlacionar os logs. Após ativar o consumidor, a mensagem pode ser processada antes de aparecer em uma consulta manual à fila.

**Limitações do código da aula:** pedidos sem itens válidos são descartados com `continue`; a resposta de `PutEvents` é impressa, mas suas falhas individuais não são tratadas. Consulte os [pontos a evoluir](README.md#pontos-a-evoluir) e registre os testes no [painel de acompanhamento](../docs/acompanhamento.md).

## Continuidade

Esta aula exercita IAM, API Gateway, Lambda, SQS FIFO, DLQ e publicação de eventos. A próxima aula anunciada aborda ingestão de arquivos via S3.

**Mantenha os recursos do laboratório para a próxima etapa**, conforme a orientação do curso.
