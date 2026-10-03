import json
import os
import boto3
from datetime import datetime

DYNAMODB_TABLE_NAME = os.environ['DYNAMODB_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    print(f"Evento SQS (cancelamento) recebido: {event}")
    for record in event['Records']:
        pedido_id = None  # Inicializa para o log de erro
        try:
            eventbridge_event = json.loads(record['body'])
            print(f"Evento EventBridge recebido via SQS: {eventbridge_event}")
            if 'detail' not in eventbridge_event:
                print(f"Erro: Campo 'detail' não encontrado no evento: {eventbridge_event}")
                continue

            pedido_data = eventbridge_event['detail']
            pedido_id = pedido_data.get('pedidoId')
            if not pedido_id:
                print(f"Erro: pedidoId não encontrado nos detalhes do evento: {pedido_data}")
                continue

            print(f"Processando cancelamento para pedido: {pedido_id}")

            # Atualizar status no DynamoDB
            response = table.update_item(
                Key={'pedidoId': str(pedido_id)},
                UpdateExpression="SET statusPedido = :status, timestampAtualizacao = :ts",
                ExpressionAttributeValues={
                    ':status': 'CANCELADO',
                    ':ts': datetime.utcnow().isoformat() + "Z"
                },
                ReturnValues="UPDATED_NEW"  # Opcional: retorna os atributos atualizados
            )
            print(f"Pedido {pedido_id} atualizado para CANCELADO. Resposta DynamoDB: {response}")

        except json.JSONDecodeError as je:
            print(f"Erro de JSON ao processar registro {record['messageId']}: {str(je)}")
            raise je
        except Exception as e:
            print(f"Erro geral ao processar cancelamento {record['messageId']} (pedidoId: {pedido_id}): {str(e)}")
            raise e
    return {'statusCode': 200, 'body': 'Processamento de cancelamentos concluído'}