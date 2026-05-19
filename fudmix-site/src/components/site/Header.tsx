import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wider text-primary">
            FUD<span className="text-foreground">MIX</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#como-funciona" className="text-sm text-foreground/80 transition hover:text-primary">Como funciona</a>
          <a href="/#cliente" className="text-sm text-foreground/80 transition hover:text-primary">Para você</a>
          <a href="/#parceiro" className="text-sm text-foreground/80 transition hover:text-primary">Para parceiros</a>
          <Link to="/termos" className="text-sm text-foreground/80 transition hover:text-primary">Termos</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-foreground/80 transition hover:text-primary"
          >
            Entrar
          </Link>
          <Link
            to="/app"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dim"
          >
            Abrir o app
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Abrir menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            <a href="/#como-funciona" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-surface">Como funciona</a>
            <a href="/#cliente" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-surface">Para você</a>
            <a href="/#parceiro" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-surface">Para parceiros</a>
            <Link to="/termos" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-surface">Termos</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-foreground/80 hover:bg-surface">Entrar</Link>
            <Link
              to="/app"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-3 py-3 text-center font-semibold text-primary-foreground"
            >
              Abrir o app
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
