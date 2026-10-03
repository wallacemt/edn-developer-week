"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  PackagePlus,
  BarChart3,
  Plug,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { avatarFor } from "@/lib/images";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pedidos/novo", label: "Novo pedido", icon: PackagePlus },
];

// ponytail: itens sem rota real, só preenchem a navegação como em um produto completo.
const SOON_ITEMS = [
  { label: "Relatórios", icon: BarChart3 },
  { label: "Integrações", icon: Plug },
  { label: "Configurações", icon: Settings },
];

export function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background bg-grid-pattern bg-grid text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 flex-col justify-between rounded-2xl glass p-5 lg:flex">
          <div>
            <div className="flex items-center gap-2 px-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient font-bold text-black">P</span>
              <span className="text-lg font-semibold text-gradient">Pedidos</span>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <p className="mt-8 px-3 text-xs font-medium uppercase tracking-wider text-white/30">Em breve</p>
            <nav className="mt-2 flex flex-col gap-1">
              {SOON_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30"
                >
                  <item.icon size={18} />
                  {item.label}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Image src={avatarFor("wallace-santana")} alt="" width={36} height={36} className="rounded-full" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Wallace Santana</p>
              <p className="truncate text-xs text-white/40">Conta de laboratório</p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40 sm:flex">
                <Search size={16} />
                <span>Buscar pedido...</span>
              </div>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </button>
              <Image src={avatarFor("wallace-santana")} alt="" width={40} height={40} className="rounded-full lg:hidden" />
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
