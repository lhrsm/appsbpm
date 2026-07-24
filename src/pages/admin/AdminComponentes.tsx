import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

/**
 * Component Gallery — versão leve de Storybook, sem dependências extras.
 * Mostra os componentes reutilizáveis do design system institucional.
 */
export default function AdminComponentes() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Galeria de Componentes</h1>
        <p className="text-sm text-muted-foreground">
          Referência visual dos elementos do design system SBPM (cores, botões, formulários).
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Paleta institucional</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Primary (verde)", cls: "bg-primary text-primary-foreground" },
            { name: "Destructive (vermelho)", cls: "bg-destructive text-destructive-foreground" },
            { name: "Secondary (azul)", cls: "bg-secondary text-secondary-foreground" },
            { name: "Accent (amarelo)", cls: "bg-accent text-accent-foreground" },
            { name: "Muted", cls: "bg-muted text-muted-foreground" },
            { name: "Card", cls: "bg-card text-card-foreground border" },
            { name: "Foreground", cls: "bg-foreground text-background" },
            { name: "Background", cls: "bg-background text-foreground border" },
          ].map((c) => (
            <div key={c.name} className={`h-20 rounded-lg flex items-center justify-center text-xs font-medium ${c.cls}`}>
              {c.name}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Botões</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="destructive">Destrutivo</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Desabilitado</Button>
          <Button size="sm">Pequeno</Button>
          <Button size="lg">Grande</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Erro</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Formulário</CardTitle></CardHeader>
        <CardContent className="grid gap-4 max-w-md">
          <div>
            <Label htmlFor="demo-input">Campo de texto</Label>
            <Input id="demo-input" placeholder="Digite algo…" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="demo-switch" />
            <Label htmlFor="demo-switch">Notificações por e-mail</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Informativo</AlertTitle>
            <AlertDescription>Mensagem padrão do sistema.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Algo deu errado. Tente novamente.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tipografia</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <h1 className="text-4xl font-bold">H1 — Título principal</h1>
          <h2 className="text-3xl font-bold">H2 — Subtítulo</h2>
          <h3 className="text-2xl font-semibold">H3 — Seção</h3>
          <p className="text-base">Parágrafo padrão — conteúdo do portal do associado.</p>
          <p className="text-sm text-muted-foreground">Texto secundário / legenda.</p>
        </CardContent>
      </Card>
    </div>
  );
}
