import json
import os
import boto3
from datetime import datetime

DYNAMODB_TABLE_NAME = os.environ['DYNAMODB_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    print(f"Evento SQS (pedidos pendentes) recebido: {event}")
    for record in event['Records']:
        try:
            # Parsear a estrutura completa do evento EventBridge
            eventbridge_event = json.loads(record['body'])
            print(f"Evento EventBridge recebido via SQS: {eventbridge_event}")

            # Extrair o payload real do pedido do campo 'detail'
            if 'detail' not in eventbridge_event:
                print(f"Erro: Campo 'detail' não encontrado no evento: {eventbridge_event}")
                continue  # Pular este registro

            pedido_data = eventbridge_event['detail']
            print(f"Processando detalhes do pedido: {pedido_data}")

            pedido_id = pedido_data.get('pedidoId')
            if not pedido_id:
                print(f"Erro: pedidoId não encontrado nos detalhes ('detail') do evento: {pedido_data}")
                continue

            # Simular lógica de processamento
            status_processamento = "PEDIDO_PROCESSADO"
            print(f"Lógica de processamento para pedido {pedido_id} concluída (simulada).")

            # Salvar/Atualizar no DynamoDB
            item_to_put = {
                'pedidoId': str(pedido_id),
                'clienteId': str(pedido_data.get('clienteId')),
                'itens': pedido_data.get('itens', []),
                'statusPedido': status_processamento,
                'origem': pedido_data.get('origem', 'API'),
                'nomeArquivoOriginal': pedido_data.get('nomeArquivoOriginal'),
                'timestampCriacaoEvento': eventbridge_event.get(
                    'time',
                    pedido_data.get('timestamp', datetime.utcnow().isoformat() + "Z")
                ),  # Pegar timestamp do evento EB ou do detail
                'timestampProcessamento': datetime.utcnow().isoformat() + "Z"
            }

            # Remover chaves com valor None
            item_final = {k: v for k, v in item_to_put.items() if v is not None}
            table.put_item(Item=item_final)
            print(f"Pedido {pedido_id} salvo/atualizado no DynamoDB com status {status_processamento}.")

        except json.JSONDecodeError as je:
            print(f"Erro de JSON ao processar registro {record['messageId']}: {str(je)}")
            raise je
        except Exception as e:
            pedido_id_para_log = 'N/A'
            if 'pedido_data' in locals() and isinstance(pedido_data, dict):
                pedido_id_para_log = pedido_data.get('pedidoId', 'N/A')
            print(f"Erro geral ao processar registro {record['messageId']} (pedidoId: {pedido_id_para_log}): {str(e)}")
            raise e
    return {'statusCode': 200, 'body': 'Processamento de pedidos pendentes concluído'}