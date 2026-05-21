import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, ChefHat, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parceiro/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — FUD MIX Parceiro" }] }),
  component: ParceiroPedidos,
});

type Order = {
  id: string;
  user_id: string;
  items: any[];
  subtotal: number;
  platform_fee: number;
  total: number;
  status: string;
  delivery_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_phone?: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  accepted: "Aceito",
  preparing: "Preparando",
  ready: "Pronto",
  delivering: "Em entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  accepted: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  preparing: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  ready: "text-green-400 border-green-400/30 bg-green-400/10",
  delivering: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  delivered: "text-muted-foreground border-border bg-surface-2",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

function ParceiroPedidos() {
  const [loading, setLoading] = useState(true);
  const [estId, setEstId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ativos" | "historico">("ativos");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      if (session.user.user_metadata?.role !== "parceiro") { navigate({ to: "/app" }); return; }

      const { data: userData } = await supabase
        .from("users").select("id").eq("auth_id", session.user.id).maybeSingle();
      if (!userData) { setLoading(false); return; }

      const { data: est } = await supabase
        .from("establishments").select("id").eq("owner_id", userData.id).maybeSingle();
      if (!est) { setLoading(false); return; }

      setEstId(est.id);
      await fetchOrders(est.id);
      setLoading(false);
    };
    init();
  }, []);

  // Realtime — atualiza pedidos automaticamente
  useEffect(() => {
    if (!estId) return;
    const channel = supabase
      .channel("orders-channel")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `host_establishment_id=eq.${estId}`,
      }, () => fetchOrders(estId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [estId]);

  const fetchOrders = async (id: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("host_establishment_id", id)
      .order("created_at", { ascending: false });

    if (!data) return;

    // Busca dados dos clientes
    const userIds = [...new Set(data.map(o => o.user_id))];
    const { data: users } = await supabase
      .from("users").select("id, name, phone").in("id", userIds);

    const ordersWithClient = data.map(order => ({
      ...order,
      client_name: users?.find(u => u.id === order.user_id)?.name ?? "Cliente",
      client_phone: users?.find(u => u.id === order.user_id)?.phone ?? "",
    }));

    setOrders(ordersWithClient);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error("Erro ao atualizar pedido.");
    else toast.success(`Pedido ${STATUS_LABELS[status].toLowerCase()}.`);
  };

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const historyOrders = orders.filter(o => ["delivered", "cancelled"].includes(o.status));
  const displayed = filter === "ativos" ? activeOrders : historyOrders;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/parceiro/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Pedidos</span>
          </div>
          {activeOrders.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              {activeOrders.length} ativo{activeOrders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Filtro */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter("ativos")}
            className={`px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-widest transition ${filter === "ativos" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"}`}>
            Ativos {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button onClick={() => setFilter("historico")}
            className={`px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-widest transition ${filter === "historico" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"}`}>
            Histórico
          </button>
        </div>

        {displayed.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-surface p-16 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
            <p className="text-muted-foreground">
              {filter === "ativos" ? "Nenhum pedido ativo no momento." : "Nenhum pedido no histórico."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayed.map(order => (
              <div key={order.id} className="rounded-2xl border border-border/50 bg-surface p-5">
                {/* Header do pedido */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-foreground">{order.client_name}</p>
                    {order.client_phone && <p className="text-xs text-muted-foreground mt-0.5">{order.client_phone}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] ?? ""}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                {/* Itens */}
                <div className="border-t border-border/50 pt-3 mb-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Itens</p>
                  <div className="grid gap-1.5">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.quantity}x {item.name}
                          {item.notes && <span className="text-muted-foreground ml-1">— {item.notes}</span>}
                        </span>
                        <span className="text-muted-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                  <MapPin size={12} className="mt-0.5 flex-shrink-0 text-primary" />
                  <span className="line-clamp-2">{order.delivery_address}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-3 mb-4">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-foreground">R$ {order.total?.toFixed(2)}</span>
                </div>

                {/* Ações */}
                {order.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order.id, "cancelled")}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-400/20">
                      <XCircle size={14} /> Recusar
                    </button>
                    <button onClick={() => updateStatus(order.id, "accepted")}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
                      <CheckCircle2 size={14} /> Aceitar
                    </button>
                  </div>
                )}
                {order.status === "accepted" && (
                  <button onClick={() => updateStatus(order.id, "preparing")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-orange-400/10 border border-orange-400/30 px-4 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-400/20">
                    <ChefHat size={14} /> Iniciar preparo
                  </button>
                )}
                {order.status === "preparing" && (
                  <button onClick={() => updateStatus(order.id, "ready")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-400/10 border border-green-400/30 px-4 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-400/20">
                    <CheckCircle2 size={14} /> Marcar como pronto
                  </button>
                )}
                {order.status === "ready" && (
                  <button onClick={() => updateStatus(order.id, "delivered")}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
                    <Package size={14} /> Confirmar entrega
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
