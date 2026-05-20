import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Field } from "@/components/ui/custom-field";

export const Route = createFileRoute("/cadastro/cliente")({
  head: () => ({
    meta: [
      { title: "Criar conta — FUD MIX" },
      { name: "description", content: "Crie sua conta no FUD MIX e peça comida de qualquer lugar pra onde você está." },
      { property: "og:title", content: "Criar conta — FUD MIX" },
      { property: "og:url", content: "/cadastro/cliente" },
    ],
  }),
  component: ClienteCadastroPage,
});

function ClienteCadastroPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: "cliente",
          },
        },
      });

      if (error) throw error;
      setDone(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center md:px-8 md:py-44">
          <CheckCircle2 size={64} className="text-success" strokeWidth={1.2} />
          <h1 className="mt-6 font-display text-4xl uppercase text-foreground md:text-6xl">Conta criada!</h1>
          <p className="mt-4 max-w-md text-foreground/70">
            Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada para ativar sua conta.
          </p>
          <Link to="/login" className="mt-8 text-sm uppercase tracking-widest text-primary hover:text-primary-dim">
            Ir para o login
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-5 md:px-8 md:py-24">
        <div className="md:col-span-2">
          <h1 className="font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
            Crie sua <span className="text-primary">conta</span>.
          </h1>
          <p className="mt-6 text-lg text-foreground/70">
            Peça comida de qualquer lugar, para onde você estiver. Sem taxas abusivas, com entrega inteligente.
          </p>
        </div>

        <form className="md:col-span-3" onSubmit={handleSignup}>
          <div className="rounded-2xl border border-border/50 bg-surface p-6 md:p-8">
            <div className="grid gap-5">
              <Field label="Nome completo" name="name" id="name" placeholder="Maria Silva" required />
              <Field label="Email" name="email" id="email" type="email" placeholder="voce@email.com" required />
              <Field label="Telefone" name="phone" id="phone" type="tel" placeholder="(11) 99999-9999" required />
              <Field label="Senha" name="password" id="password" type="password" placeholder="Mínimo 8 caracteres" required />
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-foreground/70">
              <input type="checkbox" required className="mt-1 size-4 accent-primary" />
              <span>Aceito os <Link to="/termos" className="text-primary hover:underline">termos</Link> e a <Link to="/privacidade" className="text-primary hover:underline">política de privacidade</Link>.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary-dim disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Criando conta…</>
              ) : (
                <>Criar minha conta <ArrowRight size={16} /></>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-foreground/60">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
