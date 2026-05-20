import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Smartphone, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "App — FUD MIX" },
      {
        name: "description",
        content:
          "Acesse o app FUD MIX e peça comida de qualquer lugar pra onde você está.",
      },
      { property: "og:title", content: "App — FUD MIX" },
      { property: "og:url", content: "/app" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const [location, setLocation] = useState<{
    city: string;
    state: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCityFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
       );
      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Sua cidade";
      const state = data.address.state || "";
      setLocation({ city, state });
    } catch (err) {
      console.error("Erro ao obter cidade:", err);
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
      (position) => {
        getCityFromCoords(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error("Erro de geolocalização:", err);
        setError("Permissão de localização negada ou indisponível.");
        setLoading(false);
        toast.error("Ative a localização para ver os parceiros na sua região.");
      },
    );
  };

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
              Para mostrar os melhores parceiros e garantir a entrega,
              precisamos saber sua localização.
            </p>
            <button
              onClick={handleLocationRequest}
              disabled={loading}
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition hover:bg-primary-dim disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Localizando...
                </>
              ) : (
                <>
                  <MapPin size={20} /> Ativar localização
                </>
              )}
            </button>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-surface px-4 py-2 text-xs uppercase tracking-widest text-success">
              <MapPin size={14} /> {location.city}, {location.state}
            </div>
            <Smartphone
              size={64}
              className="mt-10 text-primary"
              strokeWidth={1.2}
            />
            <h1 className="mt-8 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
              Buscando parceiros em <span className="text-primary">{location.city}</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              Identificamos que você está em {location.city}. Estamos preparando a lista de estabelecimentos anfitriões e senders disponíveis na sua região.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cadastro/cliente"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary-dim"
              >
                Criar minha conta
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-7 py-3.5 text-base font-semibold text-foreground transition hover:border-primary"
              >
                <ArrowLeft size={16} /> Voltar pro site
              </Link>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
