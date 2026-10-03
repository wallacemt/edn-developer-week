import { NextRequest, NextResponse } from "next/server";
import { alterarPedido, cancelarPedido, getPedido } from "@/lib/pedidos-repository";

type Params = { params: { pedidoId: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const pedido = await getPedido(params.pedidoId);
  if (!pedido) {
    return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(pedido);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { novosItens } = await request.json();
  await alterarPedido(params.pedidoId, novosItens);
  return NextResponse.json({ message: "Alteração enviada" }, { status: 202 });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  await cancelarPedido(params.pedidoId);
  return NextResponse.json({ message: "Cancelamento enviado" }, { status: 202 });
}
