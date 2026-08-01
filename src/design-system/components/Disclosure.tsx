import type { ReactNode } from "react";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "../utilities";
import type { LucideIcon } from "../icons";

export interface AccordionEntry {
  id: string;
  title: ReactNode;
  content: ReactNode;
  icon?: LucideIcon;
}

/**
 * Acordeão institucional (FAQ, regulamentos, seções longas).
 * @example <Accordion items={[{ id: "1", title: "Como funciona?", content: <p>...</p> }]} />
 */
export function Accordion({
  items,
  multiple,
  defaultOpen,
  className,
}: {
  items: AccordionEntry[];
  multiple?: boolean;
  defaultOpen?: string | string[];
  className?: string;
}) {
  const common = { className: cn("w-full", className) };
  const body = items.map((item) => (
    <AccordionItem key={item.id} value={item.id}>
      <AccordionTrigger className="text-left text-sm font-medium">
        <span className="flex items-center gap-2">
          {item.icon && <item.icon className="h-4 w-4 text-primary" aria-hidden />}
          {item.title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="text-sm text-muted-foreground">{item.content}</AccordionContent>
    </AccordionItem>
  ));

  return multiple ? (
    <AccordionRoot type="multiple" defaultValue={defaultOpen as string[] | undefined} {...common}>
      {body}
    </AccordionRoot>
  ) : (
    <AccordionRoot type="single" collapsible defaultValue={defaultOpen as string | undefined} {...common}>
      {body}
    </AccordionRoot>
  );
}

export interface TabEntry {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
  disabled?: boolean;
}

/**
 * Abas padronizadas, com rolagem horizontal no mobile.
 * @example <Tabs items={abas} defaultTab="dados" />
 */
export function Tabs({
  items,
  defaultTab,
  value,
  onValueChange,
  className,
}: {
  items: TabEntry[];
  defaultTab?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <TabsRoot
      defaultValue={defaultTab ?? items[0]?.id}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full justify-start overflow-x-auto">
        {items.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled} className="gap-2 whitespace-nowrap">
            {tab.icon && <tab.icon className="h-4 w-4" aria-hidden />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-4">
          {tab.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

export interface TimelineEntry {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}

/**
 * Linha do tempo (histórico de status, auditoria, protocolos).
 * @example <Timeline items={historico} />
 */
export function Timeline({ items, className }: { items: TimelineEntry[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-6 border-l border-border pl-6", className)}>
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-background",
              item.tone === "success"
                ? "bg-[hsl(var(--success))]"
                : item.tone === "warning"
                  ? "bg-warning"
                  : item.tone === "danger"
                    ? "bg-destructive"
                    : "bg-primary",
            )}
            aria-hidden
          >
            {item.icon && <item.icon className="h-3 w-3 text-primary-foreground" />}
          </span>
          <div className="space-y-0.5">
            {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
