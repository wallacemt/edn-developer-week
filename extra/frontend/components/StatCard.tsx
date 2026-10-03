import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: string;
};

// ponytail: "trend" é só um rótulo decorativo (sem série histórica por trás) para preencher
// o dashboard — o valor principal (`value`) é sempre real, lido do DynamoDB.
export function StatCard({ label, value, icon: Icon, trend, accent = "from-blue-500 to-cyan-400" }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-black`}>
          <Icon size={18} strokeWidth={2.25} />
        </span>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">{trend}</span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/50">{label}</p>
    </div>
  );
}
