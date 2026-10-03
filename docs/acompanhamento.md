# Acompanhamento do desenvolvimento

[← Voltar ao README](../README.md)

## Como atualizar a cada aula

1. Crie `day_N/README.md` com objetivo, entregas, aprendizados e pendências.
2. Salve código e capturas na pasta da aula, seguindo a organização do Dia 1.
3. Registre o teste realizado, resultado esperado, resultado observado e evidência.
4. Atualize a tabela de progresso e o inventário do README principal, incluindo a data da contagem.
5. Só marque uma verificação como concluída quando houver resultado registrado.

## Padrão de tags dos recursos AWS

Todo recurso criado para este projeto deve receber a tag abaixo:

| Chave | Valor |
| --- | --- |
| `createdBy` | `Wallace Santana` |

Ao criar ou editar um recurso no console AWS, abra a seção **Tags** e adicione exatamente essa chave e esse valor. Se o serviço permitir tags no momento da criação, aplique a tag antes de concluir; caso contrário, adicione-a logo depois.

Use o mesmo padrão para buckets S3, filas e DLQs SQS, funções e layers Lambda, tabelas DynamoDB, tópicos SNS, regras e event buses EventBridge, roles IAM e demais recursos do laboratório. O nome do recurso continua seguindo o identificador da aula; `createdBy` identifica a autoria da criação.

Ao registrar um novo recurso em `created_services.md`, confirme também que a tag foi aplicada. Não use variações como `CreatedBy`, `created-by` ou valores abreviados, para manter filtros e relatórios consistentes.

**Documentado** significa que há material no repositório. **Validado** significa que existe evidência de execução. **Planejado** identifica algo ainda não implementado ou registrado.

## Métricas operacionais

Nenhuma medição operacional foi anexada até o momento. Preencha a tabela após os testes do laboratório; use sempre a mesma janela de observação para comparar resultados.

| Indicador | Como obter | Resultado atual |
| --- | --- | --- |
| Requisições enviadas | Quantidade de chamadas do teste | Não medido |
| Sucesso no enfileiramento | Respostas `200` / chamadas enviadas × 100 | Não medido |
| Latência HTTP | Tempo da chamada observado no cliente, com tamanho da amostra | Não medido |
| Erros das Lambdas | Métrica `Errors`, por função, no CloudWatch | Não medido |
| Duração das Lambdas | Métrica `Duration`, por função, no CloudWatch | Não medido |
| Mensagens disponíveis | `ApproximateNumberOfMessagesVisible`, na fila principal e DLQ | Não medido |
| Publicação de eventos | Resultados de `PutEvents`, incluindo `FailedEntryCount` | Não medido |
| Custo do laboratório | Relatório de custos da conta, delimitado por período e recursos | Não medido |

Sucesso no enfileiramento e publicação de evento são etapas diferentes. Não use HTTP `200` como evidência de conclusão do pedido. Profundidade da fila é aproximada; não equivale à contagem total de pedidos processados.

## Registro de execução

Copie este bloco para o diário da aula após realizar um teste:

```text
Data e hora (com fuso):
Aula / versão do código:
Região e ambiente:
Cenário e resultado esperado:
Janela de observação:
Quantidade de requisições:
Resultado observado:
Pedido usado para correlação:
Evidência (arquivo ou captura):
Pendência / próximo passo:
```

## Critério para fechar uma etapa

- Código e configuração utilizados estão documentados.
- O cenário principal foi executado e possui evidência.
- Os cenários de erro exercitados têm resultado registrado.
- As limitações conhecidas estão no diário da aula.
- As métricas apresentadas indicam fonte, período e tamanho da amostra quando aplicável.

Não há percentual global de conclusão: o cronograma completo e os critérios das demais aulas ainda não estão registrados.
