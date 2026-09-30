import json
import os
import boto3

SQS_QUEUE_URL = os.environ['SQS_QUEUE_URL']
sqs = boto3.client('sqs')

def lambda_handler(event, context):
    print(f"Evento recebido do API Gateway: {event}")
    try:
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
        body = json.loads(body_str)

        pedido_id = body.get('pedidoId')
        cliente_id = body.get('clienteId')
        # Valida dados obrigatórios
        if not pedido_id or not cliente_id:
            print("Erro: pedidoId ou clienteId ausente.")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'pedidoId e clienteId são obrigatórios'})
            }

        response = sqs.send_message(
            QueueUrl=SQS_QUEUE_URL,
            MessageBody=json.dumps(body),
            MessageGroupId=str(pedido_id),
            MessageDeduplicationId=str(context.aws_request_id)
        )
        print(f"Mensagem enviada para SQS: {response['MessageId']}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Pedido recebido e enfileirado', 'sqsMessageId': response['MessageId']})
        }
    except json.JSONDecodeError:
        print("Erro: Corpo da requisição não é um JSON válido.")
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Corpo da requisição inválido, não é um JSON válido'})
        }
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': f'Erro interno do servidor: {str(e)}'})
        }