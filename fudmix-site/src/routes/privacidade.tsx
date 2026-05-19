import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — FUD MIX" },
      { name: "description", content: "Política de privacidade FUD MIX conforme a LGPD." },
      { property: "og:title", content: "Privacidade — FUD MIX" },
      { property: "og:url", content: "/privacidade" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <p className="text-xs uppercase tracking-widest text-primary">Legal · LGPD</p>
        <h1 className="mt-3 font-display text-5xl uppercase text-foreground md:text-7xl">Privacidade</h1>
        <p className="mt-4 text-sm text-muted-foreground">Última atualização: maio de 2026</p>

        <div className="mt-12 space-y-8 text-foreground/80">
          <Section title="Dados que coletamos">
            Nome, email, telefone, endereço de entrega, localização aproximada (apenas com sua autorização) e histórico de pedidos.
          </Section>
          <Section title="Como usamos">
            Para processar pedidos, conectar clientes a estabelecimentos, calcular rotas de entrega e enviar notificações sobre seu pedido.
          </Section>
          <Section title="Compartilhamento">
            Compartilhamos apenas o necessário para entrega: nome e localização vão para o sender e para o motoboy. Não vendemos dados a terceiros.
          </Section>
          <Section title="Seus direitos (LGPD)">
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento por <a href="mailto:privacidade@fudmix.com.br" className="text-primary hover:underline">privacidade@fudmix.com.br</a>.
          </Section>
          <Section title="Segurança">
            Senhas são armazenadas com hash. Pagamentos passam por gateway certificado. Sessões são protegidas por tokens.
          </Section>
          <Section title="Cookies">
            Usamos cookies essenciais para manter você logado e cookies analíticos anônimos para melhorar o serviço.
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
