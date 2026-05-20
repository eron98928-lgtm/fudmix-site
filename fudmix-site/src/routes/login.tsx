import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const role = data.user?.user_metadata?.role;
      navigate({ to: role === "parceiro" ? "/parceiro/dashboard" : "/app" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao entrar";
      toast.error(message === "Invalid login credentials" ? "Email ou senha incorretos." : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-20 md:px-8 md:py-28">
        <h1 className="font-display text-5xl uppercase text-foreground md:text-6xl">
          Bem-vindo <span className="text-primary">de volta</span>.
        </h1>
        <p className="mt-3 text-foreground/70">Entre na sua conta pra pedir ou gerenciar seu estabelecimento.</p>
        <form className="mt-10 rounded-2xl border border-border/50 bg-surface p-6 md:p-8" onSubmit={handleLogin}>
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</label>
              <input name="email" type="email" required placeholder="voce@email.com"
                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Senha</label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueci</a>
              </div>
              <input name="password" type="password" required
                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary-dim disabled:opacity-60">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Entrando…</> : <>Entrar <ArrowRight size={18} /></>}
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
