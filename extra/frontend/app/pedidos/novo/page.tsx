import Image from "next/image";
import { PackagePlus, Zap, ShieldCheck, Clock } from "lucide-react";
import { Shell } from "@/components/Shell";
import { packagesImage } from "@/lib/images";
import { criarPedidoAction } from "./actions";

export default function NovoPedidoPage() {
  return (
    <Shell title="Novo pedido" subtitle="Enviado direto para a API Gateway do backend serverless">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form action={criarPedidoAction} className="glass col-span-1 rounded-2xl p-6 lg:col-span-3">
          <div className="flex items-center gap-2 text-white/80">
            <PackagePlus size={18} />
            <h2 className="text-sm font-semibold">Dados do pedido</h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-white/60">
              Id do pedido
              <input
                name="pedidoId"
                required
                placeholder="ex: P-2026-001"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-blue-400/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/60">
              Id do cliente
              <input
                name="clienteId"
                required
                placeholder="ex: cliente-001"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-blue-400/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/60">
              Produto
              <input
                name="produto"
                required
                placeholder="ex: Caderno"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-blue-400/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/60">
              Quantidade
              <input
                name="quantidade"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-white outline-none focus:border-blue-400/50"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
          >
            Enviar pedido
          </button>

          <p className="mt-4 text-xs text-white/40">
            O pedido fica &quot;enfileirado&quot; até a cadeia assíncrona (SQS → validação → EventBridge → processamento)
            terminar — pode levar alguns segundos até aparecer no dashboard.
          </p>
        </form>

        <div className="col-span-1 flex flex-col gap-4 lg:col-span-2">
          <div className="relative min-h-[180px] overflow-hidden rounded-2xl border border-white/10">
            <Image src={packagesImage} alt="" fill className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          {/* ponytail: cards informativos estáticos, só para preencher a coluna lateral */}
          <div className="glass flex items-start gap-3 rounded-2xl p-4">
            <Zap size={18} className="mt-0.5 text-cyan-300" />
            <div>
              <p className="text-sm font-medium text-white">Processamento assíncrono</p>
              <p className="text-xs text-white/50">SQS FIFO garante a ordem por pedido, não entre pedidos diferentes.</p>
            </div>
          </div>
          <div className="glass flex items-start gap-3 rounded-2xl p-4">
            <ShieldCheck size={18} className="mt-0.5 text-emerald-300" />
            <div>
              <p className="text-sm font-medium text-white">Validação em duas etapas</p>
              <p className="text-xs text-white/50">Pré-validação na Lambda de entrada, validação completa antes do evento de negócio.</p>
            </div>
          </div>
          <div className="glass flex items-start gap-3 rounded-2xl p-4">
            <Clock size={18} className="mt-0.5 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-white">Dead-letter queues</p>
              <p className="text-xs text-white/50">Falhas repetidas (3 tentativas) caem em DLQ, sem perder a mensagem.</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
