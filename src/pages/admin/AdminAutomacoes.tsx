import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Zap, Play, Trash2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Automacao = {
  id: string;
  nome: string;
  descricao: string;
  webhookUrl: string;
  evento: string;
  mensagem?: string;
  ativa: boolean;
  criadaEm: string;
};

const STORAGE_KEY = "sbpm_automacoes";

const eventos = [
  { value: "novo_associado", label: "Novo associado cadastrado" },
  { value: "novo_dependente", label: "Novo dependente cadastrado" },
  { value: "nova_clinica", label: "Nova clínica cadastrada" },
  { value: "novo_parceiro", label: "Novo parceiro cadastrado" },
  { value: "aniversario_associado", label: "Aniversário do associado" },
  { value: "aniversario_dependente", label: "Aniversário do dependente" },
  { value: "renovacao_proxima", label: "Renovação próxima (30 dias)" },
  { value: "mudanca_contribuicao", label: "Mudança na contribuição" },
  { value: "limite_atualizado", label: "Limite atualizado" },
  { value: "limite_baixo", label: "Limite disponível baixo (< 20%)" },
  { value: "informe_disponivel", label: "Informe de rendimentos disponível" },
  { value: "carteirinha_emitida", label: "Nova carteirinha emitida" },
  { value: "manual", label: "Disparo manual" },
];

type Modelo = {
  id: string;
  nome: string;
  descricao: string;
  evento: string;
  mensagem: string;
};

const modelos: Modelo[] = [
  {
    id: "m1",
    nome: "Boas-vindas ao novo associado",
    descricao: "Envia mensagem de boas-vindas quando um associado é cadastrado.",
    evento: "novo_associado",
    mensagem:
      "Olá {{nome}}! 🎉 Seja bem-vindo(a) à SBPM. Sua matrícula é {{matricula}}. Acesse o portal em https://appsbpm.lovable.app para consultar seus benefícios.",
  },
  {
    id: "m2",
    nome: "Aniversário do associado",
    descricao: "Mensagem automática no dia do aniversário do titular.",
    evento: "aniversario_associado",
    mensagem:
      "🎂 Feliz aniversário, {{nome}}! A família SBPM deseja um dia especial e muito saúde para você e sua família.",
  },
  {
    id: "m3",
    nome: "Aniversário do dependente",
    descricao: "Envia parabéns aos dependentes no dia do aniversário.",
    evento: "aniversario_dependente",
    mensagem:
      "🎉 A SBPM parabeniza {{nome_dependente}} pelo aniversário! Titular: {{nome_titular}}. Desejamos muitas felicidades!",
  },
  {
    id: "m4",
    nome: "Nova clínica na rede",
    descricao: "Comunica aos associados quando uma nova clínica é adicionada.",
    evento: "nova_clinica",
    mensagem:
      "🏥 Nova unidade na rede SBPM! {{nome_clinica}} em {{cidade}} - {{especialidade}}. Contato: {{telefone}}.",
  },
  {
    id: "m5",
    nome: "Novo parceiro conveniado",
    descricao: "Divulga novos parceiros comerciais e descontos.",
    evento: "novo_parceiro",
    mensagem:
      "🤝 Novo parceiro SBPM: {{nome_parceiro}} em {{cidade}}. Aproveite os benefícios exclusivos para associados!",
  },
  {
    id: "m6",
    nome: "Renovação de contribuição próxima",
    descricao: "Aviso 30 dias antes do vencimento anual.",
    evento: "renovacao_proxima",
    mensagem:
      "⏰ Olá {{nome}}, sua renovação SBPM se aproxima (vencimento em {{data_renovacao}}). Fique em dia com sua contribuição para continuar aproveitando todos os benefícios.",
  },
  {
    id: "m7",
    nome: "Mudança na contribuição",
    descricao: "Notifica alterações no valor da contribuição mensal.",
    evento: "mudanca_contribuicao",
    mensagem:
      "📢 {{nome}}, informamos que sua contribuição SBPM foi ajustada para R$ {{valor_novo}} a partir de {{data_inicio}}. Dúvidas: Previdência (71) 98549-6972.",
  },
  {
    id: "m8",
    nome: "Limite disponível baixo",
    descricao: "Alerta quando o associado usa mais de 80% do limite.",
    evento: "limite_baixo",
    mensagem:
      "⚠️ {{nome}}, seu limite SBPM disponível está em {{percentual}}%. Planeje suas próximas utilizações consultando o app.",
  },
  {
    id: "m9",
    nome: "Novo dependente cadastrado",
    descricao: "Confirma inclusão de dependente ao titular.",
    evento: "novo_dependente",
    mensagem:
      "✅ {{nome_titular}}, o dependente {{nome_dependente}} foi incluído com sucesso. A carteirinha já está disponível no app.",
  },
  {
    id: "m10",
    nome: "Informe de rendimentos disponível",
    descricao: "Avisa quando o informe anual é liberado.",
    evento: "informe_disponivel",
    mensagem:
      "📄 {{nome}}, seu Informe de Rendimentos {{ano}} já está disponível no portal SBPM para declaração do Imposto de Renda.",
  },
];

export default function AdminAutomacoes() {
  const [items, setItems] = useState<Automacao[]>([]);
  const [form, setForm] = useState({ nome: "", descricao: "", webhookUrl: "", evento: "manual", mensagem: "" });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setItems(JSON.parse(raw));
  }, []);

  const persist = (list: Automacao[]) => {
    setItems(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const criar = () => {
    if (!form.nome || !form.webhookUrl) {
      toast.error("Preencha nome e URL do webhook");
      return;
    }
    try {
      new URL(form.webhookUrl);
    } catch {
      toast.error("URL do webhook inválida");
      return;
    }
    const nova: Automacao = {
      id: crypto.randomUUID(),
      nome: form.nome,
      descricao: form.descricao,
      webhookUrl: form.webhookUrl,
      evento: form.evento,
      ativa: true,
      criadaEm: new Date().toISOString(),
    };
    persist([nova, ...items]);
    setForm({ nome: "", descricao: "", webhookUrl: "", evento: "manual" });
    toast.success("Automação criada");
  };

  const toggle = (id: string) => {
    persist(items.map((i) => (i.id === id ? { ...i, ativa: !i.ativa } : i)));
  };

  const remover = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    toast.success("Automação removida");
  };

  const disparar = async (a: Automacao) => {
    try {
      await fetch(a.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          automacao: a.nome,
          evento: a.evento,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });
      toast.success("Webhook disparado. Verifique o histórico no Zapier/Make.");
    } catch {
      toast.error("Falha ao disparar webhook");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Automações
        </h1>
        <p className="text-muted-foreground">
          Conecte webhooks do Zapier, Make ou n8n para automatizar tarefas quando eventos ocorrerem no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" /> Nova automação
          </CardTitle>
          <CardDescription>
            Crie um Zap ou cenário com gatilho "Webhook" e cole a URL abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Notificar novo associado no Slack"
              />
            </div>
            <div>
              <Label>Evento gatilho</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={form.evento}
                onChange={(e) => setForm({ ...form, evento: e.target.value })}
              >
                {eventos.map((ev) => (
                  <option key={ev.value} value={ev.value}>
                    {ev.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>URL do webhook</Label>
            <Input
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="O que essa automação faz?"
            />
          </div>
          <Button onClick={criar}>
            <Plus className="w-4 h-4 mr-2" /> Criar automação
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Automações cadastradas ({items.length})</h2>
        {items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma automação cadastrada ainda.
            </CardContent>
          </Card>
        )}
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{a.nome}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {eventos.find((e) => e.value === a.evento)?.label || a.evento}
                  </span>
                </div>
                {a.descricao && <p className="text-sm text-muted-foreground">{a.descricao}</p>}
                <p className="text-xs text-muted-foreground truncate mt-1">{a.webhookUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={a.ativa} onCheckedChange={() => toggle(a.id)} />
                <Button size="sm" variant="outline" onClick={() => disparar(a)} disabled={!a.ativa}>
                  <Play className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remover(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
