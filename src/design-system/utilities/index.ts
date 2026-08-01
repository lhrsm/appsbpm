export { cn } from "@/lib/utils";

/** Retorna a classe de cor de contexto para um módulo institucional. */
export const moduleAccent = {
  lgpd: "text-[hsl(var(--module-lgpd))]",
  financeiro: "text-[hsl(var(--module-financeiro))]",
  saude: "text-[hsl(var(--module-saude))]",
  previdencia: "text-[hsl(var(--module-previdencia))]",
  patrimonio: "text-[hsl(var(--module-patrimonio))]",
  rh: "text-[hsl(var(--module-rh))]",
} as const;

export const moduleSurface = {
  lgpd: "bg-[hsl(var(--module-lgpd)/0.10)] border-[hsl(var(--module-lgpd)/0.30)]",
  financeiro: "bg-[hsl(var(--module-financeiro)/0.10)] border-[hsl(var(--module-financeiro)/0.30)]",
  saude: "bg-[hsl(var(--module-saude)/0.10)] border-[hsl(var(--module-saude)/0.30)]",
  previdencia: "bg-[hsl(var(--module-previdencia)/0.10)] border-[hsl(var(--module-previdencia)/0.30)]",
  patrimonio: "bg-[hsl(var(--module-patrimonio)/0.10)] border-[hsl(var(--module-patrimonio)/0.30)]",
  rh: "bg-[hsl(var(--module-rh)/0.10)] border-[hsl(var(--module-rh)/0.30)]",
} as const;

export type ModuleContext = keyof typeof moduleAccent;
