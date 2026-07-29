import {
  Building2,
  DollarSign,
  FileSignature,
  HeartHandshake,
  Info,
  ListChecks,
  Rocket,
  ShieldCheck,
  Users,
  CheckCircle2,
  CircleDashed,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const aImplementar = [
  { icon: DollarSign, label: "Módulo Financeiro" },
  { icon: Building2, label: "Módulo Patrimonial" },
  { icon: FileSignature, label: "Módulo Contábil" },
];

const implementados = [
  { icon: ShieldCheck, label: "Módulo da Previdência" },
  { icon: HeartHandshake, label: "Módulo da Assistência à Saúde" },
];

type Etapa = { titulo: string; estado: "concluido" | "andamento" | "previsto" };

const etapas: Etapa[] = [
  { titulo: "Portal externo", estado: "concluido" },
  { titulo: "Integração institucional", estado: "andamento" },
  { titulo: "Importação SBPM Sanitas", estado: "previsto" },
  { titulo: "Validação dos dados", estado: "previsto" },
  { titulo: "Módulo Financeiro", estado: "previsto" },
  { titulo: "Módulo Patrimonial", estado: "previsto" },
  { titulo: "Módulo Contábil", estado: "previsto" },
  { titulo: "Homologação", estado: "previsto" },
  { titulo: "Implantação completa", estado: "previsto" },
];

const estadoInfo = {
  concluido: { label: "Concluído", Icon: CheckCircle2, classe: "bg-primary text-primary-foreground border-primary" },
  andamento: { label: "Em andamento", Icon: Clock, classe: "bg-accent text-accent-foreground border-accent" },
  previsto: { label: "Previsto", Icon: CircleDashed, classe: "bg-muted text-muted-foreground border-border" },
} as const;

export default function AdminSobre() {
  return (
    <div className="space-y-6 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Portal da SBPM</h1>
        <p className="text-muted-foreground max-w-3xl">
          O Portal da SBPM é uma ferramenta de gestão administrativa que irá abranger a
          instituição como um todo, integrando informações, processos e módulos em um único
          ambiente.
        </p>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" /> Conteúdo restrito a usuários internos
        </Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" /> Módulos a serem implementados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aImplementar.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-md border p-3">
                <m.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{m.label}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">Planejado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Módulos implementados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {implementados.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-md border p-3">
                <m.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{m.label}</span>
                <Badge className="ml-auto text-[10px]">Ativo</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" /> Situação atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              O que foi desenvolvido até o momento está direcionado principalmente ao público
              externo, formado pelos associados e seus dependentes.
            </p>
            <p>
              Para avançar na implantação dos módulos da Previdência e da Assistência à Saúde,
              será necessária a integração com os sistemas internos da instituição e a importação
              dos dados do SBPM Sanitas.
            </p>
            <p>
              Essa integração permitirá que as informações apresentadas no portal sejam
              atualizadas, consistentes e compatíveis com a base oficial da instituição.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-primary" /> Próximas etapas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              O desenvolvimento dos módulos Financeiro e Patrimonial poderá avançar
              independentemente da integração com os sistemas atuais.
            </p>
            <p>
              Em momento oportuno, os responsáveis por cada setor serão convidados para participar
              de reuniões de levantamento de requisitos e validação dos fluxos de trabalho.
            </p>
            <p>
              O Módulo Contábil terá sua estrutura inicial preparada, mas suas regras definitivas
              serão definidas juntamente com o setor responsável.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linha do tempo do projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l pl-6 space-y-5">
            {etapas.map((e, i) => {
              const info = estadoInfo[e.estado];
              return (
                <li key={e.titulo} className="relative">
                  <span
                    className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border ${info.classe}`}
                  >
                    <info.Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">{e.titulo}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {info.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
