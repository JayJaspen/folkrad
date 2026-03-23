"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/admin/veckans-fraga", label: "Veckans fråga" },
  { href: "/admin/forslag", label: "Förslag" },
  { href: "/admin/statistik", label: "Statistik" },
  { href: "/admin/anvandare", label: "Användare" },
  { href: "/admin/cpm-banners", label: "CPM Banners" },
  { href: "/admin/installningar", label: "Inställningar" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      client.from("profiles").select("is_admin").eq("id", data.user.id).single()
        .then(({ data: p }) => {
          if (!p?.is_admin) { router.push("/dashboard/veckans-fraga"); return; }
          setChecking(false);
        });
    });
  }, [router]);

  async function handleLogout() {
    const client = createClient();
    await client.auth.signOut();
    router.push("/");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-primary-dark shadow-md" style={{ background: "#001f5a" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-primary font-bold text-sm">F</span>
            </div>
            <span className="text-white font-bold">Folkrådet</span>
            <span className="text-white/40 text-xs ml-2 border border-white/20 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-white/80 hover:text-white text-sm px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
            Logga ut
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <nav className="flex gap-1">
            {TABS.map(tab => {
              const active = pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href}
                  className={`whitespace-nowrap text-sm px-4 py-2.5 font-medium border-b-2 transition-colors ${active ? "border-gold text-gold" : "border-transparent text-white/60 hover:text-white hover:border-white/30"}`}>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
