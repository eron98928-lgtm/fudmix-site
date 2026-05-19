import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/cadastro/cliente")({
  head: () => ({
    meta: [
      { title: "Cadastro — FUD MIX" },
      { name: "description", content: "Crie sua conta no FUD MIX em 30 segundos." },
      { property: "og:title", content: "Cadastro — FUD MIX" },
      { property: "og:url", content: "/cadastro/cliente" },
    ],
  }),
  component: ClienteCadastroPage,
});

function ClienteCadastroPage() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <SiteLayout>
        <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center md:px-8 md:py-44">
          <CheckCircle2 size={64} className="text-success" strokeWidth={1.2} />
          <h1 className="mt-6 font-display text-4xl uppercase text-foreground md:text-6xl">Quase lá!</h1>
          <p className="mt-4 max-w-md text-foreground/70">
            Enviamos um link de confirmação pro seu email. Confirme pra liberar seu acesso ao app.
          </p>
          <Link to="/" className="mt-8 text-sm uppercase tracking-widest text-primary hover:text-primary-dim">
            Voltar para o início
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-5 md:px-8 md:py-28">
        <div className="md:col-span-2">
          <p className="text-sm uppercase tracking-widest text-primary">Cadastro cliente</p>
          <h1 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-6xl">
            Bem-vindo ao <span className="text-primary">FUD MIX</span>.
          </h1>
          <p className="mt-6 text-foreground/70">
            Crie sua conta em segundos. Sem cartão, sem mensalidade — você só paga o que pedir.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-foreground/80">
            {["Pague em PIX antecipado", "Acompanhe o pedido em tempo real", "Avalie comida, entrega e local"].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary" />
                {i}
              </li>
            ))}
          </ul>
        </div>

        <form
          className="md:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <div className="rounded-2xl border border-border/50 bg-surface p-6 md:p-8">
            <div className="grid gap-5">
              <Field label="Nome completo" name="name" placeholder="Maria Silva" required />
              <Field label="Email" name="email" type="email" placeholder="voce@email.com" required />
              <Field label="Telefone" name="phone" type="tel" placeholder="(11) 99999-9999" required />
              <Field label="Senha" name="password" type="password" placeholder="Mínimo 8 caracteres" required />
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-foreground/70">
              <input type="checkbox" required className="mt-1 size-4 accent-primary" />
              <span>
                Li e aceito os{" "}
                <Link to="/termos" className="text-primary hover:underline">termos de uso</Link>{" "}
                e a{" "}
                <Link to="/privacidade" className="text-primary hover:underline">política de privacidade</Link>.
              </span>
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary-dim"
            >
              Criar conta <ArrowRight size={18} />
            </button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
