import { GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { dynamoClient, eventBridgeClient } from "./aws-clients";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!;
const EVENT_SOURCE = "lab.aula4.operacoes";

export type Pedido = {
  pedidoId: string;
  clienteId?: string;
  itens?: unknown;
  statusPedido?: string;
  timestampAtualizacao?: string;
};

function fromDynamoItem(item: Record<string, any>): Pedido {
  return {
    pedidoId: item.pedidoId?.S,
    clienteId: item.clienteId?.S,
    itens: item.itens ? JSON.parse(item.itens.S ?? "null") ?? item.itens : undefined,
    statusPedido: item.statusPedido?.S,
    timestampAtualizacao: item.timestampAtualizacao?.S,
  };
}

export async function getPedido(pedidoId: string): Promise<Pedido | null> {
  const result = await dynamoClient.send(
    new GetItemCommand({ TableName: TABLE_NAME, Key: { pedidoId: { S: pedidoId } } })
  );
  return result.Item ? fromDynamoItem(result.Item) : null;
}

// ponytail: Scan sem paginação — aceitável no volume de um laboratório de curso.
// Se o volume de pedidos crescer, trocar por um GSI (ex: statusPedido) com Query.
export async function listPedidos(limit = 50): Promise<Pedido[]> {
  const result = await dynamoClient.send(new ScanCommand({ TableName: TABLE_NAME, Limit: limit }));
  return (result.Items ?? []).map(fromDynamoItem);
}

export async function alterarPedido(pedidoId: string, novosItens: unknown): Promise<void> {
  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "AlterarPedido",
          EventBusName: EVENT_BUS_NAME,
          Detail: JSON.stringify({ pedidoId, novosItens }),
        },
      ],
    })
  );
}

export async function cancelarPedido(pedidoId: string): Promise<void> {
  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: EVENT_SOURCE,
          DetailType: "CancelarPedido",
          EventBusName: EVENT_BUS_NAME,
          Detail: JSON.stringify({ pedidoId }),
        },
      ],
    })
  );
}
