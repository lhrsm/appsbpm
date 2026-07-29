import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, XCircle, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Campo = { id: string; label: string; secret?: boolean; placeholder?: string };
type IntegracaoConfig = { values: Record<string, string>; conectado: boolean };
type State = Record<string, IntegracaoConfig>;

const STORAGE_KEY = "sbpm_integracoes_v2";

type IntegracaoDef = {
  id: string;
  nome: string;
  descricao: string;
  docs: string;
  cor: string;
  campos: Campo[];
  destaque?: boolean;
};

const integracoes: IntegracaoDef[] = [
  {
    id: "zapi",
    nome: "Z-API (WhatsApp)",
    descricao:
      "Envie mensagens via WhatsApp usando a Z-API. Ideal para notificações, aniversários e avisos aos associados.",
    docs: "https://developer.z-api.io",
    cor: "bg-green-100 text-green-700",
    destaque: true,
    campos: [
      { id: "instanceId", label: "Instance ID", placeholder: "3D..." },
      { id: "token", label: "Instance Token", secret: true, placeholder: "Token da instância" },
      { id: "clientToken", label: "Client-Token (Account Security)", secret: true, placeholder: "Opcional" },
    ],
  },
  {
    id: "whatsapp",
    nome: "WhatsApp Business (Meta)",
    descricao: "API oficial do WhatsApp via Meta Business Cloud.",
    docs: "https://developers.facebook.com/docs/whatsapp",
    cor: "bg-green-100 text-green-700",
    campos: [
      { id: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789" },
      { id: "accessToken", label: "Access Token", secret: true },
    ],
  },
  {
    id: "sendgrid",
    nome: "SendGrid",
    descricao: "Envio de e-mails transacionais (informes, boas-vindas, avisos).",
    docs: "https://app.sendgrid.com/settings/api_keys",
    cor: "bg-blue-100 text-blue-700",
    campos: [{ id: "apiKey", label: "API Key", secret: true, placeholder: "SG..." }],
  },
  {
    id: "zapier",
    nome: "Zapier",
    descricao: "Conecte a mais de 5.000 aplicativos via webhooks.",
    docs: "https://zapier.com/apps/webhook",
    cor: "bg-orange-100 text-orange-700",
    campos: [{ id: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.zapier.com/..." }],
  },
  {
    id: "make",
    nome: "Make (Integromat)",
    descricao: "Automações visuais avançadas com centenas de módulos.",
    docs: "https://www.make.com",
    cor: "bg-purple-100 text-purple-700",
    campos: [{ id: "webhookUrl", label: "Webhook URL", placeholder: "https://hook.make.com/..." }],
  },
  {
    id: "slack",
    nome: "Slack",
    descricao: "Notifique canais internos sobre eventos do sistema.",
    docs: "https://api.slack.com/messaging/webhooks",
    cor: "bg-pink-100 text-pink-700",
    campos: [{ id: "webhookUrl", label: "Incoming Webhook URL", placeholder: "https://hooks.slack.com/..." }],
  },
  {
    id: "google_sheets",
    nome: "Google Sheets",
    descricao: "Sincronize associados e limites com uma planilha do Google.",
    docs: "https://developers.google.com/apps-script",
    cor: "bg-emerald-100 text-emerald-700",
    campos: [{ id: "webhookUrl", label: "Webhook (Apps Script) URL", placeholder: "https://script.google.com/..." }],
  },
];

const mask = (v: string) => (v ? v.replace(/.(?=.{4})/g, "•") : "");

export default function ServicosExternosTab() {
  const [state, setState] = useState<State>({});
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setState(JSON.parse(raw));
  }, []);

  const persist = (next: State) => {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const setField = (integId: string, campoId: string, valor: string) => {
    setInputs({ ...inputs, [integId]: { ...(inputs[integId] || {}), [campoId]: valor } });
  };

  const conectar = (integ: IntegracaoDef) => {
    const values = inputs[integ.id] || {};
    const obrigatorios = integ.campos.filter((c) => !c.placeholder?.toLowerCase().includes("opcional"));
    for (const c of obrigatorios) {
      if (!values[c.id]?.trim()) {
        toast.error(`Preencha ${c.label}`);
        return;
      }
    }
    persist({ ...state, [integ.id]: { values, conectado: true } });
    setInputs({ ...inputs, [integ.id]: {} });
    toast.success(`${integ.nome} conectada`);
  };

  const desconectar = (id: string) => {
    const next = { ...state };
    delete next[id];
    persist(next);
    toast.success("Integração desconectada");
  };

  const renderIcon = (id: string) =>
    id === "zapi" || id === "whatsapp" ? <MessageCircle className="w-5 h-5" /> : <Plug className="w-5 h-5" />;

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
            <Card key={integ.id} className={integ.destaque ? "border-primary/40" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integ.cor}`}>
                    {renderIcon(integ.id)}
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
                <CardTitle className="text-base mt-2 flex items-center gap-2">
                  {integ.nome}
                  {integ.destaque && (
                    <Badge variant="secondary" className="text-[10px]">
                      Recomendado
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{integ.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {conectado ? (
                  <>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {integ.campos.map((c) => (
                        <div key={c.id}>
                          <span className="font-medium">{c.label}:</span>{" "}
                          {c.secret ? mask(cfg.values[c.id] || "") : cfg.values[c.id] || "—"}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => desconectar(integ.id)}>
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <>
                    {integ.campos.map((c) => (
                      <div key={c.id}>
                        <Label className="text-xs">{c.label}</Label>
                        <Input
                          value={inputs[integ.id]?.[c.id] || ""}
                          onChange={(e) => setField(integ.id, c.id, e.target.value)}
                          placeholder={c.placeholder}
                          type={c.secret ? "password" : "text"}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => conectar(integ)}>
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

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Como obter as credenciais da Z-API</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>1. Acesse <a href="https://app.z-api.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">app.z-api.io</a> e faça login.</p>
          <p>2. Crie uma instância e escaneie o QR Code com o WhatsApp.</p>
          <p>3. Copie o <strong>Instance ID</strong> e o <strong>Token</strong> da instância.</p>
          <p>4. (Opcional, recomendado) Ative o <strong>Account Security Token</strong> e copie o <strong>Client-Token</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
