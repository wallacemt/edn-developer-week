"use server";

import { revalidatePath } from "next/cache";
import { alterarPedido, cancelarPedido } from "@/lib/pedidos-repository";

export async function alterarPedidoAction(pedidoId: string, formData: FormData) {
  const produto = String(formData.get("produto"));
  const quantidade = Number(formData.get("quantidade"));

  await alterarPedido(pedidoId, [{ produto, quantidade }]);
  revalidatePath(`/pedidos/${pedidoId}`);
}

export async function cancelarPedidoAction(pedidoId: string) {
  await cancelarPedido(pedidoId);
  revalidatePath(`/pedidos/${pedidoId}`);
}
