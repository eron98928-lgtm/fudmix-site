import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — FUD MIX" },
      { name: "description", content: "Entre na sua conta FUD MIX." },
      { property: "og:title", content: "Entrar — FUD MIX" },
      { property: "og:url", content: "/login" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-20 md:px-8 md:py-28">
        <h1 className="font-display text-5xl uppercase text-foreground md:text-6xl">
          Bem-vindo <span className="text-primary">de volta</span>.
        </h1>
        <p className="mt-3 text-foreground/70">Entre na sua conta pra pedir ou gerenciar seu estabelecimento.</p>

        <form
          className="mt-10 rounded-2xl border border-border/50 bg-surface p-6 md:p-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                required
                placeholder="voce@email.com"
                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Senha</label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueci</a>
              </div>
              <input
                type="password"
                required
                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary-dim"
          >
            Entrar <ArrowRight size={18} />
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro/cliente" className="text-primary hover:underline">Cadastre-se</Link>
            {" · "}
            <Link to="/cadastro/parceiro" className="text-primary hover:underline">Seja parceiro</Link>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
