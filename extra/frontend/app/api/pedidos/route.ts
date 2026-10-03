import { NextRequest, NextResponse } from "next/server";
import { listPedidos } from "@/lib/pedidos-repository";
import { criarPedido } from "@/lib/pedidos-api-gateway";

export async function GET() {
  const pedidos = await listPedidos();
  return NextResponse.json(pedidos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const result = await criarPedido(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}
