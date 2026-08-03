export interface SkipLinkTarget {
  href: string;
  label: string;
}

const DEFAULT_LINKS: SkipLinkTarget[] = [
  { href: "#conteudo-principal", label: "Ir para o conteúdo" },
  { href: "#navegacao-principal", label: "Ir para a navegação" },
  { href: "#busca-portal", label: "Ir para a busca" },
];

/**
 * Atalhos de teclado exibidos ao receber foco (WCAG 2.4.1).
 * Devem ser os primeiros elementos focáveis da página.
 */
export default function SkipLinks({ links = DEFAULT_LINKS }: { links?: SkipLinkTarget[] }) {
  return (
    <div className="skip-links">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="skip-link"
          onClick={(e) => {
            // Alguns alvos existem em duas variantes (desktop/mobile);
            // foca a primeira que estiver realmente visível.
            const candidates = Array.from(
              document.querySelectorAll<HTMLElement>(`${l.href}, ${l.href}-mobile`),
            );
            const el = candidates.find((c) => c.offsetParent !== null) ?? candidates[0];
            if (!el) return;
            e.preventDefault();
            if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
            el.focus();
            el.scrollIntoView({ block: "start" });
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
