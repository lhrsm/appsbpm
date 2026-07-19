import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type IntegracaoConfig = { apiKey?: string; webhookUrl?: string; conectado: boolean };
type State = Record<string, IntegracaoConfig>;

const STORAGE_KEY = "sbpm_integracoes";

const integracoes = [
  {
    id: "whatsapp",
    nome: "WhatsApp Business",
    descricao: "Envie mensagens automáticas para associados via API oficial do WhatsApp.",
    campo: "apiKey" as const,
    label: "Token de acesso",
    docs: "https://developers.facebook.com/docs/whatsapp",
    cor: "bg-green-100 text-green-700",
  },
  {
    id: "sendgrid",
    nome: "SendGrid",
    descricao: "Envio de e-mails transacionais (informes, boas-vindas, avisos).",
    campo: "apiKey" as const,
    label: "API Key",
    docs: "https://app.sendgrid.com/settings/api_keys",
    cor: "bg-blue-100 text-blue-700",
  },
  {
    id: "zapier",
    nome: "Zapier",
    descricao: "Conecte a mais de 5.000 aplicativos via webhooks.",
    campo: "webhookUrl" as const,
    label: "Webhook URL",
    docs: "https://zapier.com/apps/webhook",
    cor: "bg-orange-100 text-orange-700",
  },
  {
    id: "make",
    nome: "Make (Integromat)",
    descricao: "Automações visuais avançadas com centenas de módulos.",
    campo: "webhookUrl" as const,
    label: "Webhook URL",
    docs: "https://www.make.com",
    cor: "bg-purple-100 text-purple-700",
  },
  {
    id: "slack",
    nome: "Slack",
    descricao: "Notifique canais internos sobre eventos do sistema.",
    campo: "webhookUrl" as const,
    label: "Incoming Webhook URL",
    docs: "https://api.slack.com/messaging/webhooks",
    cor: "bg-pink-100 text-pink-700",
  },
  {
    id: "google_sheets",
    nome: "Google Sheets",
    descricao: "Sincronize associados e limites com uma planilha do Google.",
    campo: "webhookUrl" as const,
    label: "Webhook (Apps Script) URL",
    docs: "https://developers.google.com/apps-script",
    cor: "bg-emerald-100 text-emerald-700",
  },
];

export default function AdminIntegracoes() {
  const [state, setState] = useState<State>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setState(JSON.parse(raw));
  }, []);

  const persist = (next: State) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const conectar = (id: string, campo: "apiKey" | "webhookUrl") => {
    const valor = inputs[id]?.trim();
    if (!valor) {
      toast.error("Preencha o valor antes de conectar");
      return;
    }
    persist({ ...state, [id]: { [campo]: valor, conectado: true } });
    setInputs({ ...inputs, [id]: "" });
    toast.success("Integração conectada");
  };

  const desconectar = (id: string) => {
    const next = { ...state };
    delete next[id];
    persist(next);
    toast.success("Integração desconectada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="w-6 h-6 text-primary" /> Integrações
        </h1>
        <p className="text-muted-foreground">
          Conecte serviços externos para expandir os recursos do portal SBPM.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {integracoes.map((integ) => {
          const cfg = state[integ.id];
          const conectado = cfg?.conectado;
          return (
            <Card key={integ.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integ.cor}`}>
                    <Plug className="w-5 h-5" />
                  </div>
                  {conectado ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="w-3 h-3 mr-1" /> Desconectado
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{integ.nome}</CardTitle>
                <CardDescription>{integ.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {conectado ? (
                  <>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{integ.label}:</span>{" "}
                      {(cfg[integ.campo] || "").replace(/.(?=.{4})/g, "•")}
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => desconectar(integ.id)}>
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs">{integ.label}</Label>
                      <Input
                        value={inputs[integ.id] || ""}
                        onChange={(e) => setInputs({ ...inputs, [integ.id]: e.target.value })}
                        placeholder={integ.campo === "apiKey" ? "Cole a chave aqui" : "https://..."}
                        type={integ.campo === "apiKey" ? "password" : "url"}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => conectar(integ.id, integ.campo)}>
                        Conectar
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={integ.docs} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
