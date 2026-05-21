import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, MapPin, ShoppingBag, Bike, QrCode, CheckCircle2, Sparkles, Store, Beer, Users, Smartphone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroImage from "@/assets/hero-table.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUD MIX — Seu lugar. Sua comida." },
      { name: "description", content: "O delivery que conecta o restaurante onde você está com a comida que você quer. Liberdade total na mesa." },
      { property: "og:title", content: "FUD MIX — Seu lugar. Sua comida." },
      { property: "og:description", content: "Esteja em um lugar, peça de outro. O delivery brasileiro que dá liberdade total à sua mesa." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const role = session.user.user_metadata?.role;
      navigate({ to: role === "parceiro" ? "/parceiro/dashboard" : "/app" });
    });
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <Marquee />
      <HowItWorks />
      <ForClients />
      <ForPartners />
      <Pricing />
      <Coverage />
      <CTA />
    </SiteLayout>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Marquee />
      <HowItWorks />
      <ForClients />
      <ForPartners />
      <Pricing />
      <Coverage />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt="Mesa com sushi, hambúrguer e variedade de comidas"
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-radial-gold" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-20 pb-32 md:px-8 md:pt-32 md:pb-44 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs uppercase tracking-widest text-primary backdrop-blur">
            <Sparkles size={14} /> Novo no Brasil
          </div>

          <h1 className="mt-6 font-display text-6xl uppercase leading-[0.9] tracking-tight text-foreground text-balance md:text-8xl lg:text-9xl">
            Seu lugar.
            <br />
            <span className="text-primary">Sua comida.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg text-foreground/80 md:text-xl">
            Está num bar com os amigos e quer sushi? No McDonald's e quer comida japonesa?
            O FUD MIX entrega de qualquer lugar pra onde você já está.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/app"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:bg-primary-dim"
            >
              <Smartphone size={18} />
              Abrir o app
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/cadastro/parceiro"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface/50 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
            >
              <Store size={18} />
              Seja parceiro
            </Link>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border/40 pt-8">
            {[
              { v: "5min", l: "Confirmação" },
              { v: "R$1", l: "Taxa fixa" },
              { v: "100%", l: "Antecipado" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl text-primary md:text-4xl">{s.v}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Sushi", "Hambúrguer", "Pizza", "Açaí", "Churrasco", "Japonesa", "Italiana", "Mexicana", "Vegana", "Doces", "Massas", "Caldos"];
  return (
    <div className="relative overflow-hidden border-y border-border/40 bg-surface/40 py-6">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-display text-2xl uppercase tracking-widest text-foreground/40">
            {item} <span className="text-primary">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: MapPin, t: "Ative sua localização", d: "Permita o acesso ao GPS e o mapa mostra na hora todos os bares, restaurantes e estabelecimentos parceiros do FUD MIX perto de você." },
    { n: "02", icon: CheckCircle2, t: "Confirme onde você está", d: "Chegou no parceiro? O app cruza sua localização com a do estabelecimento via satélite e te conecta temporariamente ao local." },
    { n: "03", icon: ShoppingBag, t: "Peça do que quiser", d: "Conectado ao parceiro, veja todos os restaurantes que entregam ali, peça em PIX e receba na sua mesa com QR code." },
  ];

  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-36">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-primary">Como funciona</p>
        <h2 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
          Três passos, <span className="text-primary">zero fricção</span>.
        </h2>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="group relative bg-surface p-8 transition hover:bg-surface-2 md:p-10">
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl text-primary/30 transition group-hover:text-primary">{s.n}</span>
              <s.icon size={28} className="text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="mt-10 font-display text-2xl uppercase tracking-wide text-foreground">{s.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForClients() {
  const benefits = [
    "Não troque de lugar pra comer o que você quer",
    "Pagamento antecipado em PIX",
    "QR code único confirma a entrega",
    "Avalie comida, entrega e local separadamente",
    "Acompanhe o pedido em tempo real no mapa",
    "Sem mínimo de pedido escondido",
  ];

  return (
    <section id="cliente" className="border-t border-border/40 bg-surface/30">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-28 md:grid-cols-2 md:px-8 md:py-36">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary">Para você</p>
          <h2 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-6xl">
            A liberdade
            <br />
            <span className="text-primary">de escolher tudo</span>.
          </h2>
          <p className="mt-6 max-w-md text-base text-foreground/70">
            Você nunca mais precisa decidir entre o lugar onde quer estar e a comida que está com vontade. O FUD MIX cuida do meio.
          </p>
          <Link
            to="/cadastro/cliente"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary hover:text-primary-dim"
          >
            Criar minha conta <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="space-y-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-4 rounded-xl border border-border/40 bg-surface p-5 transition hover:border-primary/40">
              <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-primary" strokeWidth={2} />
              <span className="text-foreground/90">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ForPartners() {
  return (
    <section id="parceiro" className="border-t border-border/40">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-28 md:grid-cols-2 md:px-8 md:py-36">
        <div className="order-2 md:order-1">
          <div className="grid grid-cols-2 gap-4">
            <Card icon={Beer} title="Bebidas só com você" body="Senders são bloqueados de vender bebidas. Toda bebida sai do seu balcão, fora do app." />
            <Card icon={Users} title="Mesas mais cheias" body="Seu lugar vira destino mesmo pra quem quer comer de outro lugar." />
            <Card icon={QrCode} title="R$ 5 por pedido" body="Taxa fixa de anfitrião. Acima de R$ 100, ainda ganha 5% adicional." />
            <Card icon={Store} title="E você também vende" body="Todo parceiro é anfitrião E sender. Vende seu cardápio para outros locais também." />
          </div>
        </div>

        <div className="order-1 md:order-2">
          <p className="text-sm uppercase tracking-widest text-primary">Para parceiros</p>
          <h2 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-6xl">
            Mais clientes,
            <br />
            <span className="text-primary">mais bebidas</span>,
            <br />
            mais lucro.
          </h2>
          <p className="mt-6 max-w-md text-base text-foreground/70">
            Quando alguém pede comida de outro restaurante pro seu local, você ganha o anfitriato fixo
            <span className="text-primary"> e</span> as bebidas do balcão. O ticket médio sobe sem você cozinhar.
          </p>
          <Link
            to="/cadastro/parceiro"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary-dim"
          >
            Cadastrar estabelecimento <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, body }: { icon: typeof Beer; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5 transition hover:border-primary/50 hover:bg-surface-2">
      <Icon size={24} className="text-primary" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-lg uppercase tracking-wide text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Pricing() {
  const rows = [
    { item: "Comida", who: "Restaurante sender", val: "Valor do cardápio" },
    { item: "Frete", who: "Motoboy do sender", val: "Definido pelo sender" },
    { item: "Taxa anfitrião", who: "Local onde você está", val: "R$ 5 fixo (+5% se total > R$ 100)" },
    { item: "Taxa FUD MIX", who: "Plataforma", val: "R$ 1 fixo" },
  ];

  return (
    <section className="border-t border-border/40 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-36">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-primary">Transparência</p>
          <h2 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-7xl">
            Tudo separado <span className="text-primary">no carrinho</span>.
          </h2>
          <p className="mt-6 text-base text-foreground/70">
            Nunca agrupamos taxas. Você vê exatamente para onde cada centavo vai antes de pagar.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border/50 bg-surface">
          <div className="hidden grid-cols-12 gap-4 border-b border-border/40 bg-background/40 px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground md:grid">
            <div className="col-span-3">Item</div>
            <div className="col-span-5">Quem recebe</div>
            <div className="col-span-4 text-right">Valor</div>
          </div>
          {rows.map((r) => (
            <div key={r.item} className="grid gap-1 border-b border-border/30 px-6 py-5 last:border-0 md:grid-cols-12 md:gap-4 md:py-6">
              <div className="col-span-3 font-display text-lg uppercase tracking-wide text-primary">{r.item}</div>
              <div className="col-span-5 text-sm text-muted-foreground">{r.who}</div>
              <div className="col-span-4 text-sm text-foreground md:text-right">{r.val}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface p-8 md:p-10">
          <p className="text-xs uppercase tracking-widest text-primary">Exemplo de pedido</p>
          <div className="mt-4 grid gap-2 font-display text-xl uppercase tracking-wide md:text-2xl">
            <Row label="Sushi" value="R$ 70,00" />
            <Row label="Frete" value="R$ 15,00" />
            <Row label="Taxa do local" value="R$ 5,00" />
            <Row label="Taxa FUD MIX" value="R$ 1,00" />
            <div className="mt-2 border-t border-border/40 pt-3">
              <Row label="Total" value="R$ 91,00" highlight />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={highlight ? "text-primary" : "text-foreground/70"}>{label}</span>
      <span className={highlight ? "text-primary" : "text-foreground"}>{value}</span>
    </div>
  );
}

function Coverage() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-36">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary">Cobertura</p>
            <h2 className="mt-3 font-display text-5xl uppercase text-foreground text-balance md:text-6xl">
              Começamos no <span className="text-primary">sudeste</span>.
            </h2>
            <p className="mt-6 max-w-md text-foreground/70">
              Estamos abrindo cidades aos poucos pra garantir qualidade na entrega. Cadastre seu CEP no app e te avisamos quando chegarmos.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/40 bg-surface">
            <div className="absolute inset-0 bg-radial-gold opacity-40" />
            <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full opacity-30">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#grid)" className="text-primary" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-primary" />
                <p className="mt-4 font-display text-2xl uppercase tracking-wide text-foreground">São Paulo · Rio · BH</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Em breve mais cidades</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border/40 bg-surface/30">
      <div className="mx-auto max-w-5xl px-4 py-28 text-center md:px-8 md:py-36">
        <h2 className="font-display text-5xl uppercase text-foreground text-balance md:text-8xl">
          Pronto pra <span className="text-primary">misturar</span>?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-foreground/70">
          Abra o app, escolha seu lugar e peça do que quiser. Ou cadastre seu estabelecimento e venda mais sem cozinhar mais.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:bg-primary-dim"
          >
            <Smartphone size={18} /> Abrir o app
          </Link>
          <Link
            to="/cadastro/parceiro"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-8 py-4 text-base font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Quero ser parceiro
          </Link>
        </div>
      </div>
    </section>
  );
}
