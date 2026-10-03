import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, XCircle } from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";
import { getPedido } from "@/lib/pedidos-repository";
import { avatarFor, productThumb } from "@/lib/images";
import { alterarPedidoAction, cancelarPedidoAction } from "./actions";

export const dynamic = "force-dynamic";

const PIPELINE = ["RECEBIDO", "VALIDADO", "PEDIDO_PROCESSADO"] as const;

function pipelineStep(status?: string): number {
  if (status === "ALTERADO") return 2;
  const index = PIPELINE.indexOf(status as (typeof PIPELINE)[number]);
  return index === -1 ? 0 : index;
}

export default async function PedidoDetalhePage({ params }: { params: { pedidoId: string } }) {
  const pedido = await getPedido(params.pedidoId);

  if (!pedido) {
    return (
      <Shell title="Pedido não encontrado">
        <p className="text-sm text-white/50">
          {params.pedidoId} ainda está enfileirado, ou o id não existe na tabela.
        </p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-300">
          <ArrowLeft size={14} /> voltar ao dashboard
        </Link>
      </Shell>
    );
  }

  const finalizado = pedido.statusPedido === "CANCELADO";
  const step = pipelineStep(pedido.statusPedido);
  const itens = Array.isArray(pedido.itens) ? pedido.itens : [];

  const alterar = alterarPedidoAction.bind(null, pedido.pedidoId);
  const cancelar = cancelarPedidoAction.bind(null, pedido.pedidoId);

  return (
    <Shell title={`Pedido ${pedido.pedidoId}`} subtitle="Lido direto da tabela DynamoDB">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
        <ArrowLeft size={14} /> voltar ao dashboard
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass col-span-1 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={avatarFor(pedido.clienteId ?? pedido.pedidoId)} alt="" width={44} height={44} className="rounded-full" />
              <div>
                <p className="text-sm font-medium text-white">Cliente {pedido.clienteId ?? "—"}</p>
                <p className="text-xs text-white/40">Atualizado em {pedido.timestampAtualizacao ?? "—"}</p>
              </div>
            </div>
            <StatusBadge status={pedido.statusPedido} />
          </div>

          {/* Pipeline visual do status */}
          <div className="mt-6 flex items-center gap-2">
            {finalizado ? (
              <div className="flex items-center gap-2 text-rose-300">
                <XCircle size={18} />
                <span className="text-sm font-medium">Pedido cancelado</span>
              </div>
            ) : (
              PIPELINE.map((label, index) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div className={`flex items-center gap-1.5 ${index <= step ? "text-emerald-300" : "text-white/25"}`}>
                    {index <= step ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    <span className="text-xs font-medium">{label.replaceAll("_", " ")}</span>
                  </div>
                  {index < PIPELINE.length - 1 && (
                    <div className={`h-px flex-1 ${index < step ? "bg-emerald-300/50" : "bg-white/10"}`} />
                  )}
                </div>
              ))
            )}
          </div>

          <h3 className="mt-8 text-sm font-semibold text-white">Itens</h3>
          <div className="mt-3 space-y-2">
            {itens.length === 0 && <p className="text-sm text-white/40">Sem itens registrados.</p>}
            {itens.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                <Image src={productThumb(item.produto ?? `item-${index}`, 64)} alt="" width={40} height={40} className="rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.produto ?? "Produto"}</p>
                  <p className="text-xs text-white/40">Quantidade: {item.quantidade ?? item.qtd ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {!finalizado && (
            <>
              <h3 className="mt-8 text-sm font-semibold text-white">Alterar itens</h3>
              <form action={alterar} className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1.5 text-xs text-white/50">
                  Produto
                  <input
                    name="produto"
                    required
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-400/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-white/50">
                  Quantidade
                  <input
                    name="quantidade"
                    type="number"
                    min={1}
                    defaultValue={1}
                    required
                    className="w-24 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-400/50"
                  />
                </label>
                <button type="submit" className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15">
                  Enviar alteração
                </button>
              </form>

              <form action={cancelar} className="mt-4">
                <button type="submit" className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/20">
                  Cancelar pedido
                </button>
              </form>
            </>
          )}
        </div>

        {/* ponytail: timeline decorativa — só os dois pontos reais que a tabela guarda */}
        <div className="glass col-span-1 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">Linha do tempo</h3>
          <ol className="mt-4 space-y-4 border-l border-white/10 pl-4">
            <li className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
              <p className="text-sm text-white">Pedido criado</p>
              <p className="text-xs text-white/40">via API Gateway → SQS FIFO</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
              <p className="text-sm text-white">Status atual: {pedido.statusPedido ?? "—"}</p>
              <p className="text-xs text-white/40">{pedido.timestampAtualizacao ?? "sem timestamp registrado"}</p>
            </li>
          </ol>

          <p className="mt-6 text-xs text-white/40">
            Alteração e cancelamento são assíncronos (EventBridge → SQS → Lambda) — recarregue a página para ver o
            status atualizado.
          </p>
        </div>
      </div>
    </Shell>
  );
}
