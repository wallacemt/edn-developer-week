"use server";

import { redirect } from "next/navigation";
import { criarPedido } from "@/lib/pedidos-api-gateway";

export async function criarPedidoAction(formData: FormData) {
  const pedidoId = String(formData.get("pedidoId"));
  const clienteId = String(formData.get("clienteId"));
  const produto = String(formData.get("produto"));
  const quantidade = Number(formData.get("quantidade"));

  await criarPedido({
    pedidoId,
    clienteId,
    itens: [{ produto, quantidade }],
  });

  redirect(`/pedidos/${pedidoId}`);
}
