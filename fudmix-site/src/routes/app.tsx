import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, MapPin, Clock, Truck, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "App — FUD MIX" },
      { name: "description", content: "Encontre estabelecimentos perto de você." },
    ],
  }),
  component: AppPage,
});

type Establishment = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  logo_url: string | null;
  cover_url: string | null;
  delivery_radius_km: number;
  delivery_fee: number;
  rating: number;
  is_active: boolean;
  prep_time_minutes: number;
  category: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  photo_url: string | null;
  ingredients: string | null;
  is_available: boolean;
  prep_time_minutes: number;
};

function AppPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selected, setSelected] = useState<Establishment | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate({ to: "/login" }); return; }
      if (session.user.user_metadata?.role === "parceiro") { navigate({ to: "/parceiro/dashboard" }); return; }
      setAuthChecked(true);
    });
  }, []);

  const handleLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { toast.error("Geolocalização não suportada."); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocating(false);
        await loadEstablishments();
      },
      () => { toast.error("Permissão de localização negada."); setLocating(false); }
    );
  };

  const loadEstablishments = async () => {
    const { data } = await supabase.from("establishments").select("*").eq("is_active", true);
    setEstablishments(data ?? []);
  };

  const loadMenu = async (estId: string) => {
    setMenuLoading(true);
    const { data } = await supabase.from("menu_items").select("*").eq("establishment_id", estId).eq("is_available", true).order("category");
    setMenuItems(data ?? []);
    setMenuLoading(false);
  };

  const selectEst = (est: Establishment) => {
    setSelected(est);
    loadMenu(est.id);
  };

  // Inicializa mapa após localização
  useEffect(() => {
    if (!location || !mapContainerRef.current) return;
    if (mapRef.current) return;

    import("leaflet").then((L) => {
      const map = L.default.map(mapContainerRef.current!, {
        center: [location.lat, location.lng],
        zoom: 14,
      });

      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      // Marcador do usuário
      L.default.circleMarker([location.lat, location.lng], {
        radius: 8, fillColor: "#E8B84B", fillOpacity: 1, color: "#fff", weight: 2,
      }).addTo(map).bindPopup("Você está aqui");

      mapRef.current = map;
    });
  }, [location]);

  // Adiciona pins dos estabelecimentos
  useEffect(() => {
    if (!mapRef.current || establishments.length === 0) return;

    import("leaflet").then((L) => {
      establishments.forEach((est) => {
        if (!est.lat || !est.lng) return;

        const icon = L.default.divIcon({
          className: "",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
              <span style="background:#0a0a0a;color:#E8B84B;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;margin-bottom:4px;border:1px solid #E8B84B">
                ${est.name}
              </span>
              <div style="width:16px;height:16px;background:#E8B84B;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>
            </div>
          `,
          iconAnchor: [8, 32],
        });

        L.default.marker([est.lat, est.lng], { icon })
          .addTo(mapRef.current)
          .on("click", () => selectEst(est));
      });
    });
  }, [establishments]);

  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  if (!location) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface px-4 py-2 text-xs uppercase tracking-widest text-primary mb-8">
        <MapPin size={14} /> Localização necessária
      </div>
      <h1 className="font-display text-5xl uppercase text-foreground md:text-7xl">
        Onde você <span className="text-primary">está agora</span>?
      </h1>
      <p className="mt-6 max-w-xl text-lg text-foreground/70">
        Ative sua localização para ver os estabelecimentos disponíveis perto de você.
      </p>
      <button onClick={handleLocation} disabled={locating}
        className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary-dim disabled:opacity-50">
        {locating ? <><Loader2 className="animate-spin" size={20} /> Localizando...</> : <><MapPin size={20} /> Ativar localização</>}
      </button>
    </div>
  );

  const menuCategories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mapa */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Sidebar */}
      {selected && (
        <div className="w-96 border-l border-border/50 bg-surface flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative">
            {selected.cover_url ? (
              <img src={selected.cover_url} alt={selected.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-surface-2 flex items-center justify-center">
                <ShoppingBag size={40} className="text-muted-foreground" strokeWidth={1.2} />
              </div>
            )}
            <button onClick={() => setSelected(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 border-b border-border/50">
            <h2 className="font-display text-xl uppercase text-foreground">{selected.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selected.address}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star size={12} className="text-primary" /> {selected.rating > 0 ? `${selected.rating.toFixed(1)}` : "Novo"}</span>
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {selected.prep_time_minutes} min</span>
              <span className="inline-flex items-center gap-1"><Truck size={12} /> R$ {selected.delivery_fee.toFixed(2)}</span>
            </div>
          </div>

          {/* Cardápio */}
          <div className="flex-1 overflow-y-auto p-5">
            {menuLoading ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : menuItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Cardápio não disponível.</p>
            ) : (
              menuCategories.map(cat => (
                <div key={cat} className="mb-6">
                  <h3 className="font-display text-sm uppercase tracking-wide text-primary mb-3">{cat}</h3>
                  <div className="grid gap-3">
                    {menuItems.filter(i => i.category === cat).map(item => (
                      <div key={item.id} className="flex gap-3 rounded-xl border border-border/50 bg-background p-3">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.name} className="size-16 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="size-16 rounded-lg bg-surface-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                          {item.ingredients && <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">🧾 {item.ingredients}</p>}
                          <p className="text-sm font-semibold text-primary mt-1">R$ {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
