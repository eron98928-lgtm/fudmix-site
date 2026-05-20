import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "App — FUD MIX" },
      { name: "description", content: "Acesse o app FUD MIX e peça comida de qualquer lugar pra onde você está." },
      { property: "og:title", content: "App — FUD MIX" },
      { property: "og:url", content: "/app" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate({ to: "/login" }); return; }
      const role = session.user.user_metadata?.role;
      if (role === "parceiro") { navigate({ to: "/parceiro/dashboard" }); return; }
      setAuthChecked(true);
    });
  }, []);

  const getCityFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || "Sua cidade";
      const state = data.address.state || "";
      setLocation({ city, state });
    } catch {
      toast.error("Não conseguimos identificar sua cidade automaticamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationRequest = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => getCityFromCoords(position.coords.latitude, position.coords.longitude),
      () => {
        setError("Permissão de localização negada ou indisponível.");
        setLoading(false);
        toast.error("Ative a localização para ver os parceiros na sua região.");
      },
    );
  };

  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center md:px-8 md:py-32">
        {!location ? (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface px-4 py-2 text-xs uppercase tracking-widest text-primary">
              <MapPin size={14} /> Localização necessária
            </div>
            <h1 className="mt-8 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
              Onde você <span className="text-primary">está agora</span>?
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              Para mostrar os melhores parceiros e garantir a entrega, precisamos saber sua localização.
            </p>
            <button onClick={handleLocationRequest} disabled={loading}
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-primary-dim disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin" size={20} /> Localizando...</> : <><MapPin size={20} /> Ativar localização</>}
            </button>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-surface px-4 py-2 text-xs uppercase tracking-widest text-success">
              <MapPin size={14} /> {location.city}, {location.state}
            </div>
            <h1 className="mt-8 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
              Buscando parceiros em <span className="text-primary">{location.city}</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              Identificamos que você está em {location.city}. Estamos preparando os estabelecimentos disponíveis na sua região.
            </p>
            <Link to="/" className="mt-10 inline-flex items-center gap-2 rounded-md border border-border px-7 py-3.5 text-base font-semibold hover:border-primary">
              <ArrowLeft size={16} /> Voltar pro site
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
