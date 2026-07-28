import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export type ModuleLink = {
  to?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  status?: "ativo" | "em-breve" | "depende-integracao";
};

const statusLabel: Record<NonNullable<ModuleLink["status"]>, string> = {
  ativo: "Disponível",
  "em-breve": "Em desenvolvimento",
  "depende-integracao": "Depende de integração",
};

interface ModuleHubProps {
  title: string;
  description: string;
  icon: LucideIcon;
  links: ModuleLink[];
  notes?: string[];
}

export default function ModuleHub({ title, description, icon: Icon, links, notes }: ModuleHubProps) {
  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => {
          const status = link.status ?? "ativo";
          const body = (
            <Card className={`h-full transition-colors ${link.to ? "hover:border-primary" : "opacity-70"}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <link.icon className="h-5 w-5 text-primary" />
                  <Badge variant={status === "ativo" ? "default" : "secondary"} className="text-[10px]">
                    {statusLabel[status]}
                  </Badge>
                </div>
                <CardTitle className="text-base pt-2">{link.title}</CardTitle>
                <CardDescription className="text-xs">{link.description}</CardDescription>
              </CardHeader>
              {link.to && (
                <CardContent className="pt-0">
                  <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                    Abrir <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              )}
            </Card>
          );
          return link.to ? (
            <Link key={link.title} to={link.to} className="block">
              {body}
            </Link>
          ) : (
            <div key={link.title}>{body}</div>
          );
        })}
      </div>

      {notes && notes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Observações do módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
