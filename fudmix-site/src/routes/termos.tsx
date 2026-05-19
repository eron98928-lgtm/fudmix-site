import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — FUD MIX" },
      { name: "description", content: "Termos de uso da plataforma FUD MIX." },
      { property: "og:title", content: "Termos de uso — FUD MIX" },
      { property: "og:url", content: "/termos" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <p className="text-xs uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-3 font-display text-5xl uppercase text-foreground md:text-7xl">Termos de uso</h1>
        <p className="mt-4 text-sm text-muted-foreground">Última atualização: maio de 2026</p>

        <div className="prose-fudmix mt-12 space-y-8 text-foreground/80">
          <Section title="1. Aceitação">
            Ao usar o FUD MIX você concorda com estes termos. Caso não concorde, não utilize a plataforma.
          </Section>
          <Section title="2. O que é o FUD MIX">
            Plataforma de delivery que conecta clientes, estabelecimentos anfitriões (onde o pedido é entregue) e estabelecimentos senders (que preparam a comida).
          </Section>
          <Section title="3. Pagamento">
            100% antecipado via PIX. Não há cobrança no momento da entrega. Cada pedido inclui valor da comida, frete do sender, taxa de anfitrião e taxa fixa FUD MIX de R$ 1,00.
          </Section>
          <Section title="4. Regras para parceiros">
            Senders não podem cadastrar bebidas — esta categoria é exclusiva do anfitrião, vendida fora do app. CNPJ obrigatório e validado via BrasilAPI. Todo parceiro atua como anfitrião e como sender simultaneamente.
          </Section>
          <Section title="5. Cancelamentos">
            Se o sender não confirmar o pedido em 5 minutos, ele é cancelado automaticamente e o valor é estornado integralmente.
          </Section>
          <Section title="6. Avaliações">
            Após cada pedido, o cliente avalia comida, entrega e local em três notas separadas. Clientes com 3 ou mais avaliações pendentes ficam temporariamente bloqueados.
          </Section>
          <Section title="7. Contato">
            Dúvidas: <a href="mailto:legal@fudmix.com.br" className="text-primary hover:underline">legal@fudmix.com.br</a>
          </Section>
        </div>
      </article>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl uppercase tracking-wide text-primary">{title}</h2>
      <p className="mt-3 leading-relaxed">{children}</p>
    </section>
  );
}
