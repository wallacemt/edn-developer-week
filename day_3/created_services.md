# IAM

> Roles

- lambda-processa-pedidos-role-wallacesantana
  - arn:aws:iam::006952505713:role/lambda-processa-pedidos-role-wallacesantana

---

# SQS

> SQS

- pedidos-pendentes-queue-wallacesantana
  - https://sqs.us-west-1.amazonaws.com/006952505713/pedidos-pendentes-queue-wallacesantana
  - arn:aws:sqs:us-west-1:006952505713:pedidos-pendentes-queue-wallacesantana

- pedidos-pendentes-dlq-wallacesantana
  - arn:aws:sqs:us-west-1:006952505713:pedidos-pendentes-dlq-wallacesantana
  - https://sqs.us-west-1.amazonaws.com/006952505713/pedidos-pendentes-dlq-wallacesantana 

---

# Lambda

- processa-pedidos-lambda-wallacesantana
  - arn:aws:lambda:us-west-1:006952505713:function:processa-pedidos-lambda-wallacesantana
---

# DynamoDB

> Tabela Pedidos
  
  - pedidos-db-wallacesantana 
    - arn:aws:dynamodb:us-west-1:006952505713:table/pedidos-db-wallacesantana

# EventBridge (Role)
  > Role

  - novo-pedido-validado-rule-wallacesantana
    - arn:aws:events:us-west-1:006952505713:rule/pedidos-event-bus-wallacesantana/novo-pedido-validado-rule-wallacesantana
