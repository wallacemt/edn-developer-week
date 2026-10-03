const STYLES: Record<string, string> = {
  VALIDADO: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  PEDIDO_PROCESSADO: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  ALTERADO: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  CANCELADO: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const FALLBACK = "bg-white/5 text-white/60 border-white/10";

export function StatusBadge({ status }: { status?: string }) {
  const label = status ?? "SEM STATUS";
  const style = STYLES[label] ?? FALLBACK;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${style}`}>
      {label.replaceAll("_", " ")}
    </span>
  );
}
