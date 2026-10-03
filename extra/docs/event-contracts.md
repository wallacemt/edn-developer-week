# Contratos consumidos pelo front-end

[← Índice da camada extra](../README.md) · [Arquitetura](architecture.md)

Confirmados diretamente na conta AWS via `events:DescribeRule` em 02/10/2026 (não é apenas o que está nos READMEs — é o `EventPattern` real das rules do bus `pedidos-event-bus-wallacesantana`).

## Criar pedido — via API Gateway (sem mudança)

```
POST {API_GATEWAY_URL}/pedidos
Content-Type: application/json

{
  "pedidoId": "string",
  "clienteId": "string",
  "itens": [{ "produto": "string", "quantidade": number }]
}
```

Resposta `200`: `{ "message": "Pedido recebido e enfileirado", "sqsMessageId": "..." }`. Fonte: [`day_1/lambda/pre-validacao-lambda.py`](../../day_1/lambda/pre-validacao-lambda.py).

O pedido só aparece no DynamoDB depois que a cadeia assíncrona (SQS → validação → EventBridge → SQS → processamento) terminar. O front deve tratar isso como "pedido enfileirado", não "pedido criado".

## Consultar pedido — via DynamoDB (leitura direta pelo BFF)

Tabela: `pedidos-db-wallacesantana`, chave de partição `pedidoId` (string).

```ts
GetItemCommand({ TableName: "pedidos-db-wallacesantana", Key: { pedidoId: { S: pedidoId } } })
```

Campos conhecidos no item: `pedidoId`, `clienteId`, `itens`, `statusPedido` (`VALIDADO` | `ALTERADO` | `CANCELADO`, conforme os Lambdas de `day_3`/`day_4`), `timestampAtualizacao`.

## Alterar pedido — via EventBridge PutEvents

```json
{
  "Source": "lab.aula4.operacoes",
  "DetailType": "AlterarPedido",
  "EventBusName": "pedidos-event-bus-wallacesantana",
  "Detail": "{\"pedidoId\":\"...\",\"novosItens\":[{\"sku\":\"...\",\"qtd\":1}]}"
}
```

Roteado pela rule `altera-pedido-rule-wallacesantana` → `altera-pedido-queue-wallacesantana` → [`day_4/lambda/altera-pedido-lambda.py`](../../day_4/lambda/altera-pedido-lambda.py), que grava `statusPedido = ALTERADO` e substitui `itens` pelos `novosItens`.

## Cancelar pedido — via EventBridge PutEvents

```json
{
  "Source": "lab.aula4.operacoes",
  "DetailType": "CancelarPedido",
  "EventBusName": "pedidos-event-bus-wallacesantana",
  "Detail": "{\"pedidoId\":\"...\"}"
}
```

Roteado pela rule `cancela-pedido-rule-wallacesantana` → `cancela-pedido-queue-wallacesantana` → [`day_4/lambda/cancela-pedido-lambda.py`](../../day_4/lambda/cancela-pedido-lambda.py), que grava `statusPedido = CANCELADO`.

## O que o front-end NÃO faz

- Não publica `NovoPedidoValidado` (isso é interno, feito pela Lambda de validação do Dia 1).
- Não cria Lambda nem rota de API Gateway nova — toda leitura/ação além da criação usa SDK AWS direto (DynamoDB + EventBridge) com a IAM role da instância.
- Não lista pedidos por `Scan` em produção (custo/performance) — usa `Query`/`GetItem` por `pedidoId`. Uma listagem completa exigiria um GSI ou tabela de índice, fora do escopo desta etapa (ver pendências no `architecture.md`).
