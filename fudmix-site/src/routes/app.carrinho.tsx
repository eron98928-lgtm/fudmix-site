import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Trash2, ShoppingBag, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — FUD MIX" }] }),
  component: CarrinhoPage,
});

type CartItem = {
  id: string;
  name: string;
  price: number;
  photo_url: string | null;
  establishment_id: string;
  establishment_name: string;
  quantity: number;
  notes: string;
};

function CarrinhoPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }

      const { data: userData } = await supabase
        .from("users").select("id").eq("auth_id", session.user.id).maybeSingle();
      if (userData) setUserId(userData.id);

      // Carrega carrinho do sessionStorage
      const saved = sessionStorage.getItem("fudmix_cart");
      if (saved) setCart(JSON.parse(saved));

      // Carrega localização e converte em endereço
      const loc = sessionStorage.getItem("fudmix_location");
      if (loc) {
        const { lat, lng } = JSON.parse(loc);
        setLoadingAddress(true);
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await r.json();
          setAddress(data.display_name ?? `${lat}, ${lng}`);
        } catch {
          setAddress(`${lat}, ${lng}`);
        } finally {
          setLoadingAddress(false);
        }
      }

      setAuthChecked(true);
    };
    init();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      sessionStorage.setItem("fudmix_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateNotes = (id: string, notes: string) => {
    setCart(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, notes } : item);
      sessionStorage.setItem("fudmix_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      sessionStorage.setItem("fudmix_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const handleConfirm = async () => {
    if (!userId) { toast.error("Usuário não identificado."); return; }
    if (cart.length === 0) { toast.error("Carrinho vazio."); return; }
    if (!address) { toast.error("Localização necessária para finalizar o pedido."); return; }

    setSubmitting(true);
    try {
      // Agrupa itens por estabelecimento
      const byEst = cart.reduce((acc, item) => {
        if (!acc[item.establishment_id]) acc[item.establishment_id] = [];
        acc[item.establishment_id].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Cria um pedido por estabelecimento
      for (const [estId, items] of Object.entries(byEst)) {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const platformFee = 1; // R$1 por estabelecimento
        const total = subtotal + platformFee;

        const { error } = await supabase.from("orders").insert({
          id: crypto.randomUUID(),
          user_id: userId,
          host_establishment_id: estId,
          sender_establishment_id: estId,
          items: items.map(i => ({
            menu_item_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            notes: i.notes,
          })),
          subtotal,
          platform_fee: platformFee,
          delivery_fee: 0,
          total,
          status: "pending",
          delivery_address: address,
          payment_method: "cash",
          payment_status: "pending",
        });

        if (error) throw error;
      }

      sessionStorage.removeItem("fudmix_cart");
      setDone(`#${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao finalizar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  // Tela de confirmação
  if (done) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <ShoppingBag size={36} className="text-primary" strokeWidth={1.2} />
      </div>
      <h1 className="font-display text-4xl uppercase text-foreground">Pedido enviado!</h1>
      <p className="mt-3 text-muted-foreground">Pedido {done} recebido. O estabelecimento vai preparar em breve.</p>
      <Link to="/app" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
        Voltar ao app
      </Link>
    </div>
  );

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const establishments = [...new Set(cart.map(i => i.establishment_name))];
  const platformFee = establishments.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link to="/app" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            <ArrowLeft size={14} /> Voltar
          </Link>
          <span className="font-display text-xl uppercase tracking-widest text-primary">Carrinho</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.2} />
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link to="/app" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
              Ver estabelecimentos
            </Link>
          </div>
        ) : (
          <>
            {/* Itens por estabelecimento */}
            {establishments.map(estName => (
              <div key={estName} className="mb-6">
                <h2 className="font-display text-sm uppercase tracking-wide text-primary mb-3">{estName}</h2>
                <div className="grid gap-3">
                  {cart.filter(i => i.establishment_name === estName).map(item => (
                    <div key={item.id} className="rounded-xl border border-border/50 bg-surface p-4">
                      <div className="flex gap-3">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.name} className="size-16 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="size-16 rounded-lg bg-surface-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm text-foreground">{item.name}</p>
                            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive ml-2">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-primary mt-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => updateQuantity(item.id, -1)}
                              className="size-6 rounded-md border border-border flex items-center justify-center text-sm hover:border-primary">−</button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}
                              className="size-6 rounded-md border border-border flex items-center justify-center text-sm hover:border-primary">+</button>
                          </div>
                        </div>
                      </div>
                      <textarea
                        value={item.notes}
                        onChange={e => updateNotes(item.id, e.target.value)}
                        placeholder="Observação (ex: sem cebola, bem passado...)"
                        rows={2}
                        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Endereço */}
            <div className="rounded-xl border border-border/50 bg-surface p-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Endereço de entrega</p>
                  {loadingAddress ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : address ? (
                    <p className="text-sm text-foreground">{address}</p>
                  ) : (
                    <p className="text-sm text-destructive">Localização não disponível. Volte e ative a localização.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="rounded-xl border border-border/50 bg-surface p-4 mb-6">
              <h3 className="font-display text-sm uppercase tracking-wide text-foreground mb-3">Resumo</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa FUD MIX ({establishments.length} {establishments.length === 1 ? "local" : "locais"})</span>
                  <span>R$ {platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mt-1">
                  <span>Total</span>
                  <span>R$ {(total + platformFee).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button onClick={handleConfirm} disabled={submitting || !address}
              className="w-full rounded-md bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary-dim disabled:opacity-60">
              {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Confirmar pedido"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
