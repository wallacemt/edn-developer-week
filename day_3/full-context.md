# Dia 3 · Roteiro resumido do laboratório

[← Diário da aula](README.md) · [Dia 2](../day_2/README.md) · [Inventário](created_services.md)

## Objetivo

Roteiar eventos `NovoPedidoValidado` do EventBridge para uma fila SQS Standard, processá-los com Lambda e persistir os pedidos no DynamoDB.

```text
EventBridge Rule → SQS Standard → Lambda → DynamoDB
                                      └── DLQ em caso de falha
```

## Recursos

| Serviço | Nome de referência |
| --- | --- |
| IAM Role | `lambda-processa-pedidos-role-seu-nome` |
| SQS DLQ | `pedidos-pendentes-dlq-seu-nome` |
| SQS | `pedidos-pendentes-queue-seu-nome` |
| Lambda | `processa-pedidos-lambda-seu-nome` |
| DynamoDB | `pedidos-db-seu-nome` |
| EventBridge Rule | `novo-pedido-validado-rule-seu-nome` |

Use `seu-nome`, a mesma região dos dias anteriores e anote ARNs e URLs.

Em cada recurso, adicione a tag `createdBy: "Wallace Santana"`. A regra está detalhada no [guia de acompanhamento](../docs/acompanhamento.md#padrão-de-tags-dos-recursos-aws).

## 1. Criar a fila e o banco

1. Crie a DLQ Standard.
2. Crie `pedidos-pendentes-queue-seu-nome` como Standard, com visibility timeout de `70` segundos.
3. Associe a DLQ e configure `maximum receives = 3`.
4. Crie `pedidos-db-seu-nome` com partition key `pedidoId` (String).

## 2. Configurar permissões

Crie a role para Lambda com `AWSLambdaBasicExecutionRole` e uma política inline que permita:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
      "Resource": "ARN_DA_FILA_PEDIDOS_PENDENTES"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
      "Resource": "ARN_DA_TABELA_PEDIDOS"
    }
  ]
}
```

## 3. Criar a regra EventBridge

Crie uma regra no event bus customizado do Dia 1 com padrão que capture eventos cujo `detail-type` seja `NovoPedidoValidado`. Configure a fila `pedidos-pendentes-queue-seu-nome` como destino e permita que o EventBridge envie mensagens para ela.

## 4. Criar a Lambda

Crie `processa-pedidos-lambda-seu-nome` em Python 3.12, com a role criada, trigger da fila pendente e variável:

```text
DYNAMODB_TABLE_NAME=pedidos-db-seu-nome
```

Copie [processa-pedidos-lambda.py](lambda/processa-pedidos-lambda.py) para `lambda_function.py` e use `lambda_function.lambda_handler`.

## 5. Testar

Gere um pedido pelo fluxo do Dia 1 ou envie [arquivo_com_pedidos_dia3.json](arquivo_com_pedidos_dia3.json) pelo fluxo do Dia 2. Confira:

- [ ] A regra EventBridge recebeu `NovoPedidoValidado`.
- [ ] A mensagem apareceu na fila pendente.
- [ ] A Lambda processou a mensagem sem erro.
- [ ] O pedido foi persistido em `pedidos-db-seu-nome`.
- [ ] A evidência foi registrada em [screenshots/test](screenshots/test/).

O teste documentado está em [success_process_request.png](screenshots/test/success_process_request.png).
