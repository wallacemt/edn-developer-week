# Dia 4 · Roteiro resumido do laboratório

[← Diário da aula](README.md) · [Dia 3](../day_3/README.md) · [Inventário](created_services.md)

## Objetivo

Adicionar os fluxos de alteração e cancelamento ao pedido persistido, usando regras EventBridge, filas SQS dedicadas, DLQs e Lambdas de atualização.

```text
EventBridge → Rule de alteração → SQS → Lambda → DynamoDB
           └→ Rule de cancelamento → SQS → Lambda → DynamoDB
```

## Recursos

| Serviço | Nome de referência |
| --- | --- |
| IAM Role | `lambda-altera-cancela-role-seu-nome` |
| SQS/DLQ | `altera-pedido-queue-seu-nome` / `altera-pedido-dlq-seu-nome` |
| SQS/DLQ | `cancela-pedido-queue-seu-nome` / `cancela-pedido-dlq-seu-nome` |
| Lambda | `altera-pedido-lambda-seu-nome` |
| Lambda | `cancela-pedido-lambda-seu-nome` |
| EventBridge Rules | `altera-pedido-rule-seu-nome`, `cancela-pedido-rule-seu-nome` |
| DynamoDB | `pedidos-db-seu-nome` |

Use `seu-nome`, a mesma região dos dias anteriores e anote os ARNs e URLs.

## 1. Criar filas e permissões

1. Crie uma DLQ Standard e uma fila Standard para cada operação.
2. Configure visibility timeout `70` segundos e `maximum receives = 3`.
3. Crie a role Lambda com `AWSLambdaBasicExecutionRole`.
4. Adicione permissões de leitura/remoção nas duas filas e `dynamodb:UpdateItem` na tabela de pedidos.

## 2. Criar as regras EventBridge

No event bus customizado, crie uma regra para eventos de cancelamento e outra para eventos de alteração. Cada regra deve apontar para sua fila correspondente e possuir permissão para entrega do EventBridge.

## 3. Criar as Lambdas

Crie ambas em Python 3.12, com a role compartilhada, trigger SQS e variável:

```text
DYNAMODB_TABLE_NAME=pedidos-db-seu-nome
```

Use [cancela-pedido-lambda.py](lambda/cancela-pedido-lambda.py) na função de cancelamento e [altera-pedido-lambda.py](lambda/altera-pedido-lambda.py) na função de alteração.

## 4. Testar e observar DLQ

Envie eventos válidos pelo EventBridge e confira a fila, os logs e o item no DynamoDB:

- [ ] Cancelamento grava `CANCELADO`.
- [ ] Alteração grava `ALTERADO` e substitui `itens`.
- [ ] Os eventos chegam às filas corretas.
- [ ] Uma falha controlada é reprocessada e chega à DLQ após três tentativas.

As evidências disponíveis estão em [screenshots/test](screenshots/test/): alteração e cancelamento.
