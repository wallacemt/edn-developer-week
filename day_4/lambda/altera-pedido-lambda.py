import json
import os
import boto3
from datetime import datetime

DYNAMODB_TABLE_NAME = os.environ['DYNAMODB_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    print(f"Evento SQS (alteração) recebido: {event}")
    for record in event['Records']:
        pedido_id = None
        try:
            eventbridge_event = json.loads(record['body'])
            print(f"Evento EventBridge recebido via SQS: {eventbridge_event}")
            if 'detail' not in eventbridge_event:
                print(f"Erro: Campo 'detail' não encontrado no evento: {eventbridge_event}")
                continue

            pedido_data = eventbridge_event['detail']
            pedido_id = pedido_data.get('pedidoId')
            # Espera-se que o evento de alteração contenha os novos itens
            novos_itens = pedido_data.get('novosItens')

            if not pedido_id or novos_itens is None:  # Checa se novosItens está presente, mesmo que seja lista vazia
                print(f"Erro: pedidoId ou novosItens não encontrados nos detalhes do evento: {pedido_data}")
                continue

            print(f"Processando alteração para pedido: {pedido_id} com novos itens: {novos_itens}")

            # Atualizar itens e status no DynamoDB
            response = table.update_item(
                Key={'pedidoId': str(pedido_id)},
                UpdateExpression="SET itens = :i, statusPedido = :s, timestampAtualizacao = :ts",
                ExpressionAttributeValues={
                    ':i': novos_itens,  # Assume que novosItens já está no formato correto
                    ':s': 'ALTERADO',
                    ':ts': datetime.utcnow().isoformat() + "Z"
                },
                ReturnValues="UPDATED_NEW"
            )
            print(f"Pedido {pedido_id} atualizado para ALTERADO. Resposta DynamoDB: {response}")

        except json.JSONDecodeError as je:
            print(f"Erro de JSON ao processar registro {record['messageId']}: {str(je)}")
            raise je
        except Exception as e:
            print(f"Erro geral ao processar alteração {record['messageId']} (pedidoId: {pedido_id}): {str(e)}")
            raise e
    return {'statusCode': 200, 'body': 'Processamento de alterações concluído'}