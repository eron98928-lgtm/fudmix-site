import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parceiro/cardapio")({
  head: () => ({ meta: [{ title: "Cardápio — FUD MIX Parceiro" }] }),
  component: ParceiroCardapio,
});

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  photo_url: string | null;
  is_available: boolean;
  prep_time_minutes: number;
  establishment_id: string;
};

const emptyForm = {
  name: "", description: "", price: "", category: "",
  is_available: true, prep_time_minutes: "30",
};

function ParceiroCardapio() {
  const [items, setItems] = useState<Item[]>([]);
  const [estId, setEstId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      if (session.user.user_metadata?.role !== "parceiro") { navigate({ to: "/app" }); return; }

      const { data: userData } = await supabase
        .from("users").select("id").eq("auth_id", session.user.id).maybeSingle();
      if (!userData) { setLoading(false); return; }

      const { data: est } = await supabase
        .from("establishments").select("id").eq("owner_id", userData.id).maybeSingle();
      if (!est) { setLoading(false); return; }

      setEstId(est.id);
      await fetchItems(est.id);
      setLoading(false);
    };
    load();
  }, []);

  const fetchItems = async (id: string) => {
    const { data } = await supabase.from("menu_items").select("*").eq("establishment_id", id).order("category");
    setItems(data ?? []);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description, price: String(item.price),
      category: item.category, is_available: item.is_available, prep_time_minutes: String(item.prep_time_minutes) });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estId) return;
    setSaving(true);
    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), category: form.category,
      is_available: form.is_available, prep_time_minutes: parseInt(form.prep_time_minutes),
      establishment_id: estId,
    };
    try {
      if (editing) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Item atualizado.");
      } else {
        const { error } = await supabase.from("menu_items").insert({ ...payload, id: crypto.randomUUID() });
        if (error) throw error;
        toast.success("Item adicionado.");
      }
      await fetchItems(estId);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    toast.success("Item removido.");
    if (estId) await fetchItems(estId);
  };

  const toggleAvailable = async (item: Item) => {
    await supabase.from("menu_items").update({ is_available: !item.is_available }).eq("id", item.id);
    if (estId) await fetchItems(estId);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/parceiro/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Cardápio</span>
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
            <Plus size={16} /> Novo item
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-surface p-16 text-center">
            <p className="text-muted-foreground">Nenhum item no cardápio ainda.</p>
            <button onClick={openNew}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim">
              <Plus size={16} /> Adicionar primeiro item
            </button>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-10">
              <h2 className="mb-4 font-display text-lg uppercase tracking-wide text-primary">{cat}</h2>
              <div className="grid gap-3">
                {items.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-surface px-5 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{item.name}</span>
                        {item.is_available
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={12} /> Disponível</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-red-400"><XCircle size={12} /> Indisponível</span>}
                      </div>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                      <p className="mt-1 text-sm font-semibold text-primary">R$ {item.price.toFixed(2)} · {item.prep_time_minutes} min</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => toggleAvailable(item)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary">
                        {item.is_available ? "Pausar" : "Ativar"}
                      </button>
                      <button onClick={() => openEdit(item)} className="rounded-md border border-border p-1.5 hover:border-primary">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="rounded-md border border-border p-1.5 hover:border-destructive text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-surface p-6">
            <h2 className="mb-6 font-display text-xl uppercase">{editing ? "Editar item" : "Novo item"}</h2>
            <form onSubmit={handleSave} className="grid gap-4">
              <Field label="Nome" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
              <Field label="Descrição" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Preço (R$)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} required />
                <Field label="Tempo preparo (min)" type="number" value={form.prep_time_minutes} onChange={v => setForm(f => ({ ...f, prep_time_minutes: v }))} required />
              </div>
              <Field label="Categoria" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} required placeholder="Ex: Lanches, Bebidas, Sobremesas" />
              <label className="flex items-center gap-3 text-sm text-foreground/70">
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="size-4 accent-primary" />
                Disponível para pedidos
              </label>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-md border border-border py-2.5 text-sm font-medium hover:border-primary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dim disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type} required={required} placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );
}
