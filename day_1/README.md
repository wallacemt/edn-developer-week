# Dia 1 · Ingestão e validação de pedidos

[← Visão geral](../README.md) · [Roteiro resumido](full-context.md) · [Inventário de recursos](created_services.md)

## Objetivo

Receber pedidos por uma API REST, desacoplar o processamento com SQS FIFO e publicar um evento de pedido validado no EventBridge.

## Material disponível

| Artefato | Conteúdo |
| --- | --- |
| [Resumo](resume.md) | Contexto e objetivo da aula |
| [Roteiro](full-context.md) | Passo a passo resumido pelo console AWS |
| [Inventário](created_services.md) | Nomes e identificadores registrados durante a prática |
| [Pré-validação](lambda/pre-validacao-lambda.py) | Entrada HTTP e envio à fila |
| [Validação](lambda/validacao-lambda.py) | Consumo da fila e publicação do evento |
| [Capturas](screenshots/) | Evidências de API Gateway, IAM, Lambda, SQS e EventBridge |

## Contrato registrado no código

| Etapa | Comportamento atual |
| --- | --- |
| Entrada HTTP | Corpo JSON com `pedidoId` e `clienteId` não vazios |
| Pré-validação | Retorna `400` para JSON malformado ou identificadores ausentes |
| Enfileiramento | Retorna `200` com `sqsMessageId` após `send_message` |
| Agrupamento | `MessageGroupId = pedidoId` |
| Deduplicação | `MessageDeduplicationId = context.aws_request_id` |
| Validação assíncrona | Exige `itens` como lista não vazia |
| Evento | Source: `lab.aula1.pedidos.validacao`; DetailType: `NovoPedidoValidado` |
| Data do evento | Adiciona `timestamp` quando não existe no pedido |

## Validação a registrar

O roteiro descreve os testes, mas não há resultados de execução salvos que permitam marcá-los como aprovados.

- [ ] Enviar pedido válido e registrar HTTP `200` e `sqsMessageId`.
- [ ] Enviar JSON malformado e registrar HTTP `400`.
- [ ] Omitir `pedidoId` ou `clienteId` e registrar HTTP `400`.
- [ ] Correlacionar o `pedidoId` nos logs das duas Lambdas.
- [ ] Confirmar a publicação no EventBridge pela resposta de `PutEvents`.
- [ ] Em teste controlado, registrar uma falha de processamento e o comportamento da DLQ.

## Pontos a evoluir

Observações da leitura do código; não são resultados de testes executados na AWS:

1. **Falhas de publicação:** a Lambda de validação imprime a resposta de `put_events`, mas não verifica `FailedEntryCount`. Uma entrada com falha pode ser tratada como processada. A [API do EventBridge](https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_PutEvents.html) expõe os resultados por entrada.
2. **Pedidos sem itens:** o `continue` encerra o tratamento desse registro sem lançar erro. Esses pedidos não acionam a política de tentativas da DLQ por essa validação.
3. **Formato de entrada:** a pré-validação pressupõe um objeto JSON; um array ou `null` chega ao tratamento genérico de erro. Os itens não têm validação de produto ou quantidade.
4. **Idempotência:** usar o ID da invocação como deduplicador não identifica duas requisições distintas para o mesmo pedido de negócio.
5. **Diagnóstico:** os logs incluem o evento completo e a resposta HTTP de erro inclui detalhes da exceção. Revisar esses dados antes de ampliar o uso do sistema.

Os códigos originais foram preservados nesta organização documental para manter o registro da prática.

## Continuidade

A próxima aula anunciada no roteiro aborda ingestão de arquivos por S3. Mantenha os recursos necessários à sequência do laboratório conforme as orientações do curso e registre os novos artefatos na pasta da respectiva aula.
