const API_GATEWAY_URL = process.env.API_GATEWAY_URL!;

export type CriarPedidoInput = {
  pedidoId: string;
  clienteId: string;
  itens: Array<{ produto: string; quantidade: number }>;
};

export async function criarPedido(input: CriarPedidoInput) {
  const response = await fetch(`${API_GATEWAY_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message ?? "Falha ao enfileirar o pedido");
  }
  return body as { message: string; sqsMessageId: string };
}
