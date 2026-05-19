import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-3xl tracking-wider text-primary">
              FUD<span className="text-foreground">MIX</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Seu lugar. Sua comida. O delivery que conecta o restaurante onde você está com o que você quer comer.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-primary">Produto</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/app" className="text-foreground/70 hover:text-primary">Abrir o app</Link></li>
              <li><Link to="/cadastro/cliente" className="text-foreground/70 hover:text-primary">Cadastro cliente</Link></li>
              <li><Link to="/cadastro/parceiro" className="text-foreground/70 hover:text-primary">Seja parceiro</Link></li>
              <li><Link to="/login" className="text-foreground/70 hover:text-primary">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-primary">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/termos" className="text-foreground/70 hover:text-primary">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="text-foreground/70 hover:text-primary">Privacidade (LGPD)</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/40 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FUD MIX. Todos os direitos reservados.</p>
          <p>Feito no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}
