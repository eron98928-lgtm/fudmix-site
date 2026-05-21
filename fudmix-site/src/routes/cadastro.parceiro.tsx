import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Store, Bike, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro/parceiro")({
  head: () => ({
    meta: [
      { title: "Seja parceiro — FUD MIX" },
      { name: "description", content: "Cadastre seu estabelecimento no FUD MIX em 4 passos." },
      { property: "og:title", content: "Seja parceiro — FUD MIX" },
      { property: "og:url", content: "/cadastro/parceiro" },
    ],
  }),
  component: ParceiroCadastroPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

type FormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  razaoSocial: string;
  cnpj: string;
  address: string;
  schedule: string;
  radius: string;
  deliveryFee: string;
  photo: File | null;
  lat?: number;
  lng?: number;
  isHost: boolean;
  isSender: boolean;
};

const initial: FormData = {
  name: "", email: "", phone: "", password: "",
  razaoSocial: "", cnpj: "", address: "",
  schedule: "", radius: "5", deliveryFee: "",
  photo: null, lat: undefined, lng: undefined,
  isHost: false, isSender: false,
};

function ParceiroCadastroPage() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FormData>(initial);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjValid, setCnpjValid] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const setTipo = (tipo: "host" | "sender" | "both") => {
    setData((d) => ({
      ...d,
      isHost: tipo === "host" || tipo === "both",
      isSender: tipo === "sender" || tipo === "both",
    }));
  };

  const getTipo = () => {
    if (data.isHost && data.isSender) return "both";
    if (data.isHost) return "host";
    if (data.isSender) return "sender";
    return null;
  };

  const geocodeAddress = async (address: string) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=br&limit=1`);
      const results = await r.json();
      if (results.length > 0) return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      return null;
    } catch { return null; }
  };

  const validateCnpj = async (): Promise<boolean> => {
    const clean = data.cnpj.replace(/\D/g, "");
    if (clean.length !== 14) { setCnpjError("CNPJ inválido"); setCnpjValid(false); return false; }
    setCnpjLoading(true); setCnpjError(null);
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!r.ok) throw new Error("CNPJ não encontrado");
      const json = await r.json();
      const newAddress = json.logradouro
        ? `${json.logradouro}, ${json.numero ?? ""} — ${json.municipio}/${json.uf}`
        : data.address;
      const coords = await geocodeAddress(newAddress);
      setData((d) => ({ ...d, razaoSocial: json.razao_social || d.razaoSocial, address: newAddress, lat: coords?.lat, lng: coords?.lng }));
      setCnpjValid(true); return true;
    } catch { setCnpjError("Não conseguimos validar este CNPJ."); setCnpjValid(false); return false; }
    finally { setCnpjLoading(false); }
  };

  const handleAddressChange = async (address: string) => {
    set("address", address);
    if (address.length > 10) {
      setGeocodingLoading(true);
      const coords = await geocodeAddress(address);
      if (coords) setData((d) => ({ ...d, lat: coords.lat, lng: coords.lng }));
      setGeocodingLoading(false);
    }
  };

  const handleSignup = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      let lat = data.lat, lng = data.lng;
      if (!lat || !lng) {
        const coords = await geocodeAddress(data.address);
        if (coords) { lat = coords.lat; lng = coords.lng; }
      }
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email, password: data.password,
        options: {
          data: {
            name: data.name, phone: data.phone, role: "parceiro",
            razao_social: data.razaoSocial, cnpj: data.cnpj.replace(/\D/g, ""),
            address: data.address, schedule: data.schedule,
            radius: data.radius, delivery_fee: data.deliveryFee,
            lat, lng, is_host: data.isHost, is_sender: data.isSender,
          },
        },
      });
      if (error) throw error;
      if (authData.user && data.photo) {
        const ext = data.photo.name.split(".").pop() ?? "jpg";
        await supabase.storage.from("establishment-photos")
          .upload(`${authData.user.id}/photo.${ext}`, data.photo, { upsert: true });
      }
      setStep(5);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setSubmitError(message === "User already registered" ? "Este e-mail já está cadastrado." : message);
    } finally { setSubmitting(false); }
  };

  const next = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (step === 2 && !cnpjValid) { const ok = await validateCnpj(); if (!ok) return; }
    if (step === 3 && !getTipo()) { return; }
    if (step < 4) setStep((s) => (s + 1) as Step);
    else await handleSignup();
  };

  const prev = () => setStep((s) => (s - 1) as Step);

  if (step === 5) return (
    <SiteLayout>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center md:px-8 md:py-44">
        <CheckCircle2 size={64} className="text-success" strokeWidth={1.2} />
        <h1 className="mt-6 font-display text-4xl uppercase text-foreground md:text-6xl">Cadastro recebido!</h1>
        <p className="mt-4 max-w-md text-foreground/70">Nosso time vai revisar seu estabelecimento e te avisar por email em até 48h.</p>
        <Link to="/" className="mt-8 text-sm uppercase tracking-widest text-primary hover:text-primary-dim">Voltar para o início</Link>
      </section>
    </SiteLayout>
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="mt-4 font-display text-4xl uppercase text-foreground text-balance md:text-6xl">
            Seja <span className="text-primary">parceiro</span>.
          </h1>
          <p className="mt-3 text-foreground/70">Passo {step} de 4</p>
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition ${n <= step ? "bg-primary" : "bg-surface-3"}`} />
            ))}
          </div>
        </div>

        <form onSubmit={next} className="rounded-2xl border border-border/50 bg-surface p-6 md:p-10">
          {step === 1 && (
            <StepBlock title="Seus dados" subtitle="Quem é o responsável pelo estabelecimento.">
              <Field label="Nome completo" value={data.name} onChange={(v) => set("name", v)} required />
              <Field label="Email" type="email" value={data.email} onChange={(v) => set("email", v)} required />
              <Field label="Telefone" type="tel" value={data.phone} onChange={(v) => set("phone", v)} required placeholder="(11) 99999-9999" />
              <Field label="Senha" type="password" value={data.password} onChange={(v) => set("password", v)} required placeholder="Mínimo 8 caracteres" minLength={8} />
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock title="Dados do estabelecimento" subtitle="Validamos seu CNPJ na hora via BrasilAPI.">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">CNPJ</label>
                <div className="mt-2 flex gap-2">
                  <input value={data.cnpj}
                    onChange={(e) => { set("cnpj", e.target.value); setCnpjValid(false); setCnpjError(null); }}
                    onBlur={validateCnpj} placeholder="00.000.000/0000-00" required
                    className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button type="button" onClick={validateCnpj} disabled={cnpjLoading}
                    className="rounded-md border border-border bg-surface-2 px-4 text-sm font-medium uppercase tracking-widest text-foreground hover:border-primary disabled:opacity-50">
                    {cnpjLoading ? <Loader2 size={16} className="animate-spin" /> : "Validar"}
                  </button>
                </div>
                {cnpjError && <p className="mt-2 text-xs text-destructive">{cnpjError}</p>}
                {cnpjValid && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-success"><CheckCircle2 size={14} /> CNPJ validado</p>}
              </div>
              <Field label="Razão social" value={data.razaoSocial} onChange={(v) => set("razaoSocial", v)} required />
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Endereço completo</label>
                <div className="mt-2 flex gap-2 items-center">
                  <input value={data.address} onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Rua, número, bairro, cidade/UF" required
                    className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {geocodingLoading && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>
                {data.lat && data.lng && (
                  <p className="mt-2 text-xs text-success">✓ Localização encontrada</p>
                )}
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock title="Tipo de operação" subtitle="Como você vai atuar no FUD MIX.">
              <div className="grid gap-3">
                {[
                  { tipo: "host" as const, icon: <Store size={24} />, title: "Anfitrião", desc: "Tenho espaço físico para receber clientes. Vendo bebida no balcão, fora do app." },
                  { tipo: "sender" as const, icon: <Bike size={24} />, title: "Sender", desc: "Produzo e entrego comida. Não tenho espaço físico para receber clientes." },
                  { tipo: "both" as const, icon: <Layers size={24} />, title: "Ambos", desc: "Produzo, entrego e tenho espaço físico para receber clientes." },
                ].map(({ tipo, icon, title, desc }) => (
                  <button key={tipo} type="button" onClick={() => setTipo(tipo)}
                    className={`flex items-start gap-4 rounded-xl border p-5 text-left transition ${getTipo() === tipo ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <span className={getTipo() === tipo ? "text-primary" : "text-muted-foreground"}>{icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {!getTipo() && (
                <p className="text-xs text-destructive mt-2">Selecione um tipo de operação para continuar.</p>
              )}

              {(getTipo() === "sender" || getTipo() === "both") && (
                <div className="mt-4 grid gap-4">
                  <Field label="Horário de funcionamento" value={data.schedule} onChange={(v) => set("schedule", v)} required placeholder="Seg-Sex 11h-23h" />
                  <Field label="Raio de entrega (km)" type="number" value={data.radius} onChange={(v) => set("radius", v)} required />
                  <Field label="Valor do frete (R$)" type="number" value={data.deliveryFee} onChange={(v) => set("deliveryFee", v)} required placeholder="15.00" />
                </div>
              )}

              {getTipo() === "host" && (
                <div className="mt-4">
                  <Field label="Horário de funcionamento" value={data.schedule} onChange={(v) => set("schedule", v)} required placeholder="Seg-Sex 11h-23h" />
                  <p className="mt-3 rounded-md border border-primary/30 bg-primary/10 p-4 text-xs text-foreground/80">
                    <strong className="text-primary">Lembrete:</strong> Como anfitrião, você recebe clientes que pediram comida de um sender. A venda de bebida é feita no seu balcão, fora do FUD MIX.
                  </p>
                </div>
              )}
            </StepBlock>
          )}

          {step === 4 && (
            <StepBlock title="Foto e confirmação" subtitle="Adicione uma foto do seu estabelecimento.">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">Foto do estabelecimento</label>
                <input type="file" accept="image/*" onChange={(e) => set("photo", e.target.files?.[0] ?? null)}
                  className="mt-2 w-full rounded-md border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary-dim" />
              </div>
              <div className="rounded-md border border-border/50 bg-surface-2 p-5 text-sm">
                <p className="font-display text-base uppercase tracking-wide text-primary">Revisão</p>
                <dl className="mt-3 grid gap-1.5 text-foreground/80">
                  <Review label="Nome" value={data.name} />
                  <Review label="Razão social" value={data.razaoSocial} />
                  <Review label="CNPJ" value={data.cnpj} />
                  <Review label="Tipo" value={getTipo() === "host" ? "Anfitrião" : getTipo() === "sender" ? "Sender" : "Ambos"} />
                  {(data.isSender) && <Review label="Raio" value={`${data.radius} km`} />}
                  {(data.isSender) && <Review label="Frete" value={`R$ ${data.deliveryFee}`} />}
                </dl>
              </div>
              <label className="flex items-start gap-3 text-sm text-foreground/70">
                <input type="checkbox" required className="mt-1 size-4 accent-primary" />
                <span>Aceito os <Link to="/termos" className="text-primary hover:underline">termos</Link> e a <Link to="/privacidade" className="text-primary hover:underline">política de privacidade</Link>.</span>
              </label>
              {submitError && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{submitError}</p>
              )}
            </StepBlock>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button type="button" onClick={prev} disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground hover:border-primary disabled:opacity-50">
                <ArrowLeft size={16} /> Anterior
              </button>
            ) : <span />}
            <button type="submit" disabled={submitting || cnpjLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary-dim disabled:opacity-60">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : <>{step === 4 ? "Enviar cadastro" : "Continuar"} <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}

function StepBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl uppercase tracking-wide text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 grid gap-5">{children}</div>
    </div>
  );
}

function formatPhoneBR(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

function Field({ label, value, onChange, type = "text", required, placeholder, minLength }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; minLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value}
        onChange={(e) => type === "tel" ? onChange(formatPhoneBR(e.target.value)) : onChange(e.target.value)}
        type={type} required={required} placeholder={placeholder} minLength={minLength}
        maxLength={type === "tel" ? 15 : undefined}
        className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value || "—"}</dd>
    </div>
  );
}
