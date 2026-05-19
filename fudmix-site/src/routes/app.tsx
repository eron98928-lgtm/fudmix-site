import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Smartphone, Construction, ArrowLeft } from "lucide-react";

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
  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center md:px-8 md:py-44">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface px-4 py-2 text-xs uppercase tracking-widest text-primary">
          <Construction size={14} /> Em construção
        </div>
        <Smartphone size={64} className="mt-10 text-primary" strokeWidth={1.2} />
        <h1 className="mt-8 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
          O app está <span className="text-primary">chegando</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground/70">
          Estamos polindo cada tela pra te entregar a melhor experiência de delivery do Brasil. Cadastre-se pra ser avisado no lançamento.
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
      </section>
    </SiteLayout>
  );
}
