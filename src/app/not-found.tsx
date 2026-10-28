import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[560px] space-y-4 px-4 py-20 text-center">
      <p className="text-sm font-semibold tracking-wide text-accent uppercase">Eroare 404</p>
      <h1 className="text-3xl font-semibold text-primary">Pagina nu există</h1>
      <p className="text-ink-muted">Linkul poate fi greșit sau pagina a fost mutată.</p>
      <ButtonLink href="/">Înapoi la început</ButtonLink>
    </div>
  );
}
