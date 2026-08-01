import { Link } from "react-router-dom";

const links = [
  { label: "Política de Privacidade", to: "/privacidade" },
  { label: "Termos de Uso", to: "/privacidade#termos" },
  { label: "Acessibilidade", to: "/acessibilidade" },
  { label: "Meus Dados — LGPD", to: "/dashboard/minha-privacidade" },
  { label: "Suporte", to: "/dashboard/faq" },
];

export const PORTAL_VERSION = "2.0";

/** Rodapé institucional do portal externo. */
export default function PortalFooter() {
  return (
    <footer className="border-t bg-card/60">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-xs">
          © {new Date().getFullYear()} SBPM — Sociedade Beneficente da Polícia Militar · Portal v{PORTAL_VERSION}
        </p>
        <ul className="flex flex-col gap-1 md:flex-row md:flex-wrap md:items-center md:gap-4">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="flex min-h-11 items-center text-xs transition hover:text-foreground hover:underline md:min-h-0"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
