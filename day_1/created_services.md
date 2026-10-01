# IAM

> Roles

- lambda-prevalidacao-role-wallacesantana

  - arn:aws:iam::006952505713:role/lambda-prevalidacao-role-wallacesantana
- lambda-validacao-pedidos-role-wallacesantana

  - arn:aws:iam::006952505713:role/lambda-validacao-pedidos-role-wallacesantana

---



# SQS

> DLQ (Dead-Letter Queue)

- pedidos-fifo-dlq-wallacesantana.fifo

  - arn:aws:sqs:us-west-1:006952505713:pedidos-fifo-dlq-wallacesantana.fifo
- pedidos-fifo-queue-wallacesantana.fifo

  - arn:aws:sqs:us-west-1:006952505713:pedidos-fifo-queue-wallacesantana.fifo
  - https://sqs.us-west-1.amazonaws.com/006952505713/pedidos-fifo-queue-wallacesantana.fifo

---



# Lambda

> Lambda de Pre-Validação de dados.

- pre-validacao-lambda-wallacesantana
  - arn:aws:lambda:us-west-1:006952505713:function:pre-validacao-lambda-wallacesantana

---



# API GTW

> API REST

- pedidos-api-wallacesantana

  - arn:aws:apigateway:us-west-1::/restapis/ko20e3ys6k
  - https://ko20e3ys6k.execute-api.us-west-1.amazonaws.com/dev
- `/pedidos`

  - POST
    - body:
      ```json
      {
          "pedidoId": "lab001-seu-nome",
          "clienteId": "clienteXYZ-seu-nome",
          "itens": [
              {
                  "produto": "Caneta Azul",
                  "quantidade": 10
              },
              {
                  "produto": "Caderno Universitário",
                  "quantidade": 2
              }
          ]
      }
      ```



---



# Event Bridge

> Event Bus (Barramento  de Eventos)

- pedidos-event-bus-wallacesantana
  - arn:aws:events:us-west-1:006952505713:event-bus/pedidos-event-bus-wallacesantana
