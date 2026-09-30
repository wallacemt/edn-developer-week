import json
import os
import boto3
from datetime import datetime

EVENT_BUS_NAME = os.environ['EVENT_BUS_NAME']
event_bridge = boto3.client('events')

def lambda_handler(event, context):
    print(f"Evento SQS recebido: {event}")
    for record in event['Records']:
        try:
            pedido_data_str = record['body']
            pedido_data = json.loads(pedido_data_str)
            print(f"Processando pedido do SQS: {pedido_data}")

            if not pedido_data.get('itens') or not isinstance(pedido_data.get('itens'), list) or len(pedido_data.get('itens')) == 0:
                print(f"Erro de validação: Pedido {pedido_data.get('pedidoId')} não possui 'itens' válidos.")
                # Para o lab, se falhar aqui, a mensagem será removida da fila.
                # Se quiser que vá para a DLQ da SQS, levante uma exceção: raise ValueError("Itens inválidos")
                continue

            print(f"Pedido {pedido_data.get('pedidoId')} validado com sucesso.")
            if 'timestamp' not in pedido_data:
                pedido_data['timestamp'] = datetime.utcnow().isoformat() + "Z"

            response = event_bridge.put_events(
                Entries=[{
                    'Source': 'lab.aula1.pedidos.validacao',
                    'DetailType': 'NovoPedidoValidado',
                    'Detail': json.dumps(pedido_data),
                    'EventBusName': EVENT_BUS_NAME
                }]
            )
            print(f"Evento publicado no EventBridge: {response}")

        except json.JSONDecodeError as je:
            print(f"Erro de JSON ao processar registro {record['messageId']}: {str(je)}")
            raise je  # Envia para DLQ da SQS se houver erro de parse
        except Exception as e:
            print(f"Erro geral ao processar registro {record['messageId']}: {str(e)}")
            raise e  # Envia para DLQ da SQS
    return {'statusCode': 200, 'body': 'Processamento de mensagens SQS concluído'}