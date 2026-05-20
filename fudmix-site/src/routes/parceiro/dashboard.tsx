import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Store, Star, Clock, Truck } from "lucide-react";

export const Route = createFileRoute("/parceiro/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — FUD MIX Parceiro" }],
  }),
  component: ParceiroDashboard,
});

function ParceiroDashboard() {
  const [user, setUser] = useState<any>(null);
  const [est, setEst] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const role = session.user.user_metadata?.role;
      if (role !== "parceiro") { navigate({ to: "/app" }); return; }
      setUser(session.user);

      const { data: userData } = await supabase
        .from("users").select("id").eq("auth_id", session.user.id).maybeSingle();

      if (userData) {
        const { data } = await supabase
          .from("establishments").select("*").eq("owner_id", userData.id).maybeSingle();
        setEst(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="font-display text-xl uppercase tracking-widest text-primary">FUDMIX</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.user_metadata?.name}</span>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl uppercase text-foreground">
            Olá, <span className="text-primary">{user?.user_metadata?.name?.split(" ")[0]}</span>.
          </h1>
          <p className="mt-1 text-muted-foreground">Painel do parceiro FUD MIX</p>
        </div>

        {est ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard icon={<Store size={20} />} label="Estabelecimento" value={est.name} />
              <StatCard icon={<Star size={20} />} label="Avaliação" value={est.rating > 0 ? `${est.rating.toFixed(1)} ★` : "Sem avaliações"} />
              <StatCard icon={<Truck size={20} />} label="Raio de entrega" value={`${est.delivery_radius_km} km`} />
              <StatCard icon={<Clock size={20} />} label="Status" value={est.is_active ? "Ativo" : "Inativo"} color={est.is_active ? "text-green-400" : "text-red-400"} />
            </div>

            <div className="rounded-2xl border border-border/50 bg-surface p-6 mb-6">
              <h2 className="font-display text-lg uppercase text-foreground mb-4">Dados do estabelecimento</h2>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <InfoRow label="Razão social" value={est.name} />
                <InfoRow label="CNPJ" value={est.cnpj} />
                <InfoRow label="Endereço" value={est.address} />
                <InfoRow label="Frete" value={`R$ ${est.delivery_fee?.toFixed(2)}`} />
                <InfoRow label="Verificado" value={est.is_verified ? "Sim" : "Pendente"} />
                <InfoRow label="Cadastro" value={new Date(est.created_at).toLocaleDateString("pt-BR")} />
              </dl>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex items-center justify-between">
              <p className="text-sm text-foreground/70">Gerencie os itens do seu cardápio.</p>
              <Link to="/parceiro/cardapio"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
                Ver cardápio
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-surface p-10 text-center">
            <Store size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
            <p className="text-foreground/70">Nenhum estabelecimento encontrado para esta conta.</p>
            <Link to="/cadastro/parceiro"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
              Cadastrar estabelecimento
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-xs uppercase tracking-widest">{label}</span></div>
      <p className={`text-lg font-semibold ${color ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value || "—"}</dd>
    </div>
  );
}
