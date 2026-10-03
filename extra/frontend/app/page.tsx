import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package, CheckCircle2, RefreshCw, XCircle, Sparkles } from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { listPedidos } from "@/lib/pedidos-repository";
import { heroWarehouseImage, productThumb } from "@/lib/images";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const pedidos = await listPedidos();

  const processados = pedidos.filter((p) => p.statusPedido === "PEDIDO_PROCESSADO").length;
  const alterados = pedidos.filter((p) => p.statusPedido === "ALTERADO").length;
  const cancelados = pedidos.filter((p) => p.statusPedido === "CANCELADO").length;

  return (
    <Shell title="Dashboard" subtitle="Visão geral dos pedidos processados pelo backend serverless">
      <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10">
        <Image src={heroWarehouseImage} alt="" fill className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 p-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
              <Sparkles size={13} /> Semana do Desenvolvedor AWS
            </span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Acompanhe o ciclo de vida completo dos pedidos
            </h2>
            <p className="mt-2 text-sm text-white/60">
              API Gateway, EventBridge e DynamoDB funcionando por trás desta tela, em tempo real.
            </p>
          </div>
          <Link
            href="/pedidos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            Novo pedido <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de pedidos" value={pedidos.length} icon={Package} trend="+12% vs. semana passada" accent="from-blue-500 to-cyan-400" />
        <StatCard label="Processados" value={processados} icon={CheckCircle2} accent="from-emerald-500 to-emerald-300" />
        <StatCard label="Alterados" value={alterados} icon={RefreshCw} accent="from-amber-500 to-amber-300" />
        <StatCard label="Cancelados" value={cancelados} icon={XCircle} accent="from-rose-500 to-rose-300" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Pedidos recentes</h3>
            <span className="text-xs text-white/40">lido direto do DynamoDB</span>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {pedidos.length === 0 && <p className="py-6 text-sm text-white/40">Nenhum pedido encontrado na tabela.</p>}
            {pedidos.map((pedido) => (
              <Link
                key={pedido.pedidoId}
                href={`/pedidos/${pedido.pedidoId}`}
                className="flex items-center gap-4 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <Image
                  src={productThumb(pedido.pedidoId, 80)}
                  alt=""
                  width={44}
                  height={44}
                  className="rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{pedido.pedidoId}</p>
                  <p className="truncate text-xs text-white/40">Cliente {pedido.clienteId ?? "—"}</p>
                </div>
                <StatusBadge status={pedido.statusPedido} />
              </Link>
            ))}
          </div>
        </div>

        {/* ponytail: painel informativo estático — lista a arquitetura real do projeto,
            sem chamada nenhuma, só para preencher a coluna lateral do dashboard. */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white">Arquitetura por trás desta tela</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>API Gateway</span>
              <span className="text-xs text-white/30">criação de pedidos</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>DynamoDB</span>
              <span className="text-xs text-white/30">leitura de status</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>EventBridge</span>
              <span className="text-xs text-white/30">alterar / cancelar</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
              <span>Elastic Beanstalk</span>
              <span className="text-xs text-white/30">hospeda este front-end</span>
            </li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
