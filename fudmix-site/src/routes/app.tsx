import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, MapPin, Clock, Truck, Star, ShoppingBag, User, LogOut, Pencil, ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "App — FUD MIX" }] }),
  component: AppPage,
});

type Establishment = {
  id: string; name: string; address: string; lat: number; lng: number;
  logo_url: string | null; cover_url: string | null; delivery_radius_km: number;
  delivery_fee: number; rating: number; is_active: boolean; prep_time_minutes: number; category: string;
};

type MenuItem = {
  id: string; name: string; description: string; price: number; category: string;
  photo_url: string | null; ingredients: string | null; is_available: boolean; prep_time_minutes: number;
};

type CartItem = {
  id: string; name: string; price: number; photo_url: string | null;
  establishment_id: string; establishment_name: string; quantity: number; notes: string;
};

type UserProfile = { name: string; email: string; phone: string; };

function formatPhoneBR(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

function AppPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selected, setSelected] = useState<Establishment | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [screen, setScreen] = useState<"home" | "map">("home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate({ to: "/login" }); return; }
      if (session.user.user_metadata?.role === "parceiro") { navigate({ to: "/parceiro/dashboard" }); return; }
      const profile = {
        name: session.user.user_metadata?.name ?? "",
        email: session.user.email ?? "",
        phone: session.user.user_metadata?.phone ?? "",
      };
      setUser(profile);
      setAuthUser(session.user);
      setEditForm({ name: profile.name, phone: profile.phone });

      // Carrega carrinho do sessionStorage
      const saved = sessionStorage.getItem("fudmix_cart");
      if (saved) setCart(JSON.parse(saved));

      setAuthChecked(true);
    });
  }, []);

  const addToCart = (item: MenuItem, est: Establishment) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, {
          id: item.id, name: item.name, price: item.price, photo_url: item.photo_url,
          establishment_id: est.id, establishment_name: est.name, quantity: 1, notes: "",
        }];
      }
      sessionStorage.setItem("fudmix_cart", JSON.stringify(updated));
      return updated;
    });
    toast.success(`${item.name} adicionado ao carrinho.`);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const loadEstablishments = async () => {
    const { data } = await supabase.from("establishments").select("*").eq("is_active", true);
    setEstablishments(data ?? []);
    return data ?? [];
  };

  const handleLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { toast.error("Geolocalização não suportada."); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        sessionStorage.setItem("fudmix_location", JSON.stringify(loc));
        setLocationDenied(false); setLocating(false);
        setScreen("map"); await loadEstablishments();
      },
      () => { setLocationDenied(true); setLocating(false); toast.error("Permissão negada. Ative a localização nas configurações."); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: editForm.name, phone: editForm.phone } });
      if (error) throw error;
      if (authUser) {
        await supabase.from("users").update({ name: editForm.name, phone: editForm.phone }).eq("auth_id", authUser.id);
      }
      setUser(u => u ? { ...u, name: editForm.name, phone: editForm.phone } : u);
      setEditingProfile(false);
      toast.success("Perfil atualizado.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar.");
    } finally { setSavingProfile(false); }
  };

  const loadMenu = async (estId: string) => {
    setMenuLoading(true);
    const { data } = await supabase.from("menu_items").select("*").eq("establishment_id", estId).eq("is_available", true).order("category");
    setMenuItems(data ?? []); setMenuLoading(false);
  };

  const selectEst = (est: Establishment) => { setSelected(est); loadMenu(est.id); };

  useEffect(() => {
    if (!location || !mapContainerRef.current || mapRef.current || screen !== "map") return;
    import("leaflet").then((L) => {
      const map = L.default.map(mapContainerRef.current!, { center: [location.lat, location.lng], zoom: 13 });
      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
      L.default.circleMarker([location.lat, location.lng], { radius: 10, fillColor: "#E8B84B", fillOpacity: 1, color: "#fff", weight: 2 }).addTo(map).bindPopup("Você está aqui");
      mapRef.current = map;
    });
  }, [location, screen]);

  useEffect(() => {
    if (!mapRef.current || establishments.length === 0) return;
    import("leaflet").then((L) => {
      establishments.forEach((est) => {
        if (!est.lat || !est.lng) return;
        const icon = L.default.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
            <span style="background:#0a0a0a;color:#E8B84B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-bottom:4px;border:1px solid #E8B84B36">${est.name}</span>
            <div style="width:14px;height:14px;background:#E8B84B;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>
          </div>`,
          iconAnchor: [7, 32],
        });
        L.default.marker([est.lat, est.lng], { icon }).addTo(mapRef.current).on("click", () => selectEst(est));
      });
    });
  }, [establishments]);

  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  if (screen === "home") return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="font-display text-xl uppercase tracking-widest text-primary">FUDMIX</span>
          <div className="flex items-center gap-2">
            <Link to="/app/carrinho" className="relative inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary">
              <ShoppingCart size={14} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-border/50 bg-surface p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl uppercase text-foreground">{user?.name || "—"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.phone && <p className="text-sm text-muted-foreground">{user?.phone}</p>}
              </div>
            </div>
            <button onClick={() => setEditingProfile(true)} className="rounded-md border border-border p-2 hover:border-primary">
              <Pencil size={14} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-display text-lg uppercase text-foreground mb-2">
            {locationDenied ? "Localização bloqueada" : "Ver estabelecimentos"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {locationDenied
              ? "Você bloqueou a localização. Ative nas configurações do navegador e tente novamente."
              : "Ative sua localização para ver os estabelecimentos disponíveis perto de você."}
          </p>
          <button onClick={handleLocation} disabled={locating}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim disabled:opacity-50">
            {locating ? <><Loader2 size={16} className="animate-spin" /> Localizando...</> : <><MapPin size={16} /> Ativar localização</>}
          </button>
        </div>
      </main>

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl uppercase">Editar perfil</h2>
              <button onClick={() => setEditingProfile(false)} className="rounded-full border border-border p-1.5 hover:border-primary">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="grid gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nome</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required
                  className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Telefone</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: formatPhoneBR(e.target.value) }))}
                  maxLength={15} placeholder="(11) 99999-9999"
                  className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setEditingProfile(false)}
                  className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium hover:border-primary">Cancelar</button>
                <button type="submit" disabled={savingProfile}
                  className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim disabled:opacity-60">
                  {savingProfile ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const menuCategories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="flex h-screen bg-background overflow-hidden flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-surface">
        <button onClick={() => setScreen("home")} className="font-display text-lg uppercase tracking-widest text-primary">FUDMIX</button>
        <div className="flex gap-2 items-center">
          <button onClick={() => setView("mapa")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition ${view === "mapa" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"}`}>
            Mapa
          </button>
          <button onClick={() => setView("lista")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition ${view === "lista" ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"}`}>
            Lista
          </button>
          <Link to="/app/carrinho" className="relative inline-flex items-center rounded-md border border-border p-1.5 hover:border-primary">
            <ShoppingCart size={16} />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {view === "mapa" && <div className="flex-1 relative"><div ref={mapContainerRef} className="w-full h-full" /></div>}

        {view === "lista" && (
          <div className="flex-1 overflow-y-auto p-4">
            {establishments.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">Nenhum estabelecimento disponível.</p>
            ) : (
              <div className="grid gap-4">
                {establishments.map(est => (
                  <div key={est.id} onClick={() => selectEst(est)}
                    className="rounded-xl border border-border/50 bg-surface overflow-hidden cursor-pointer hover:border-primary transition">
                    {est.cover_url ? <img src={est.cover_url} alt={est.name} className="w-full h-32 object-cover" /> : (
                      <div className="w-full h-32 bg-surface-2 flex items-center justify-center">
                        <ShoppingBag size={32} className="text-muted-foreground" strokeWidth={1.2} />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display text-base uppercase text-foreground">{est.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{est.address}</p>
                      <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Star size={11} className="text-primary" /> {est.rating > 0 ? est.rating.toFixed(1) : "Novo"}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={11} /> {est.prep_time_minutes} min</span>
                        <span className="inline-flex items-center gap-1"><Truck size={11} /> R$ {est.delivery_fee.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="w-full md:w-96 border-l border-border/50 bg-surface flex flex-col overflow-hidden absolute inset-0 md:relative md:inset-auto z-10">
            <div className="relative">
              {selected.cover_url ? <img src={selected.cover_url} alt={selected.name} className="w-full h-40 object-cover" /> : (
                <div className="w-full h-40 bg-surface-2 flex items-center justify-center">
                  <ShoppingBag size={40} className="text-muted-foreground" strokeWidth={1.2} />
                </div>
              )}
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 border-b border-border/50">
              <h2 className="font-display text-xl uppercase text-foreground">{selected.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selected.address}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star size={12} className="text-primary" /> {selected.rating > 0 ? selected.rating.toFixed(1) : "Novo"}</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {selected.prep_time_minutes} min</span>
                <span className="inline-flex items-center gap-1"><Truck size={12} /> R$ {selected.delivery_fee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {menuLoading ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
                : menuItems.length === 0 ? <p className="text-center text-sm text-muted-foreground py-10">Cardápio não disponível.</p>
                : menuCategories.map(cat => (
                  <div key={cat} className="mb-6">
                    <h3 className="font-display text-sm uppercase tracking-wide text-primary mb-3">{cat}</h3>
                    <div className="grid gap-3">
                      {menuItems.filter(i => i.category === cat).map(item => (
                        <div key={item.id} className="flex gap-3 rounded-xl border border-border/50 bg-background p-3">
                          {item.photo_url ? <img src={item.photo_url} alt={item.name} className="size-16 rounded-lg object-cover flex-shrink-0" /> : <div className="size-16 rounded-lg bg-surface-2 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground">{item.name}</p>
                            {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                            {item.ingredients && <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">🧾 {item.ingredients}</p>}
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm font-semibold text-primary">R$ {item.price.toFixed(2)}</p>
                              <button onClick={() => addToCart(item, selected)}
                                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-dim">
                                <Plus size={12} /> Adicionar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
