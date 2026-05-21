import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function formatPhoneBR(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export function Field({ label, error, className, type, onChange, ...props }: FieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "tel") {
      const formatted = formatPhoneBR(e.target.value);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(e.target, formatted);
      e.target.dispatchEvent(new Event("input", { bubbles: true }));
      if (onChange) onChange({ ...e, target: { ...e.target, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    if (onChange) onChange(e);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        {...props}
        type={type}
        onChange={handleChange}
        maxLength={type === "tel" ? 15 : undefined}
        className={cn(
          "mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
          error && "border-destructive focus:ring-destructive/30",
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
