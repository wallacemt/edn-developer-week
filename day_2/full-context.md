# Dia 2 · Roteiro resumido do laboratório

[← Diário da aula](README.md) · [Dia 1](../day_1/README.md) · [Inventário](created_services.md)

## Objetivo

Receber pedidos em arquivos JSON no S3, validar o conteúdo, registrar o resultado no DynamoDB, alertar falhas pelo SNS e enviar pedidos válidos para a FIFO do Dia 1.

```text
S3 → SQS Standard → Lambda → SQS FIFO de pedidos → fluxo do Dia 1
                    ├── DynamoDB: histórico
                    └── SNS: erro de validação
```

## Recursos

| Serviço | Nome de referência |
| --- | --- |
| IAM Role | `lambda-s3-validation-role-seu-nome` |
| S3 | `datalake-arquivos-seu-nome` |
| SQS DLQ | `s3-arquivos-json-dlq-seu-nome` |
| SQS | `s3-arquivos-json-queue-seu-nome` |
| Lambda | `validacao-s3-arquivos-lambda-seu-nome` |
| DynamoDB | `controle-arquivos-historico-seu-nome` |
| SNS | `notificacao-erro-arquivos-seu-nome` |

Substitua `seu-nome`, use uma única região e anote ARNs e URLs.

Adicione a tag `createdBy: "Wallace Santana"` em cada recurso criado. Consulte o [padrão de tags](../docs/acompanhamento.md#padrão-de-tags-dos-recursos-aws).

## 1. IAM e filas

1. Crie a role para Lambda com `AWSLambdaBasicExecutionRole`.
2. Crie a DLQ Standard e depois a fila Standard de arquivos.
3. Configure visibility timeout `30` segundos, associe a DLQ e use `maximum receives = 3`.
4. Adicione permissões para consumir a fila e enviar à FIFO de pedidos do Dia 1.

## 2. S3, DynamoDB e SNS

1. Crie o bucket e configure notificação de novos objetos para a fila Standard.
2. Crie a tabela com partition key `nomeArquivo` (String).
3. Crie o tópico SNS e confirme uma assinatura de e-mail, se usada.
4. Adicione à role permissões de leitura no S3, escrita no DynamoDB e publicação no SNS.

## 3. Lambda

Crie a Lambda em Python 3.12 com [este código](lambda/validacao-s3-arquivos-lambda.py), handler `lambda_function.lambda_handler` e trigger da fila Standard.

```text
DYNAMODB_TABLE_NAME=controle-arquivos-historico-seu-nome
SNS_TOPIC_ARN=arn:aws:sns:REGION:ACCOUNT_ID:notificacao-erro-arquivos-seu-nome
SQS_FIFO_PEDIDOS_URL=https://sqs.REGION.amazonaws.com/ACCOUNT_ID/pedidos-fifo-queue-seu-nome.fifo
```

O fluxo lê o evento SQS, baixa o objeto, valida `lista_pedidos`, envia pedidos válidos à FIFO, registra o status no DynamoDB e publica SNS em caso de erro.

## 4. Testes

Envie [arquivo_com_pedidos.json](arquivo_com_pedidos.json) e [arquivo_schema_invalido.json](arquivo_schema_invalido.json) ao bucket. Confira CloudWatch, a FIFO do Dia 1, DynamoDB e SNS. As evidências estão em [screenshots/test](screenshots/test/).

| Critério | Situação |
| --- | --- |
| Arquivo válido chega à FIFO | [ ] |
| Histórico válido no DynamoDB | [ ] |
| Schema inválido gera status de erro | [ ] |
| Erro é publicado no SNS | [ ] |

A próxima evolução é tratar falhas parciais, validar tipos dos itens e tornar o processamento idempotente por arquivo.
