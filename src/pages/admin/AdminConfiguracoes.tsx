import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Shield, Bell, Palette, Building, UserPlus, Trash2, PenTool, Upload, Loader2 } from "lucide-react";


type Settings = {
  org_name: string;
  org_cnpj: string;
  org_endereco: string;
  org_email: string;
  org_telefone: string;
  notif_email_novos: boolean;
  notif_email_erros: boolean;
  notif_aniversarios: boolean;
  seguranca_2fa: boolean;
  seguranca_sessao_min: number;
  tema_primario: string;
  idioma: string;
};

const DEFAULTS: Settings = {
  org_name: "SBPM - Sociedade Beneficente da Polícia Militar",
  org_cnpj: "",
  org_endereco: "",
  org_email: "",
  org_telefone: "",
  notif_email_novos: true,
  notif_email_erros: true,
  notif_aniversarios: false,
  seguranca_2fa: false,
  seguranca_sessao_min: 60,
  tema_primario: "verde",
  idioma: "pt-BR",
};

const STORAGE_KEY = "sbpm_admin_settings";

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [presidenteUrl, setPresidenteUrl] = useState<string | null>(null);
  const [presidenteNome, setPresidenteNome] = useState<string>("");
  const [uploadingSig, setUploadingSig] = useState(false);
  const [savingSigMeta, setSavingSigMeta] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSettings({ ...DEFAULTS, ...JSON.parse(saved) }); } catch {}
    }
    loadAdmins();
    loadPresidente();
  }, []);

  const loadPresidente = async () => {
    const { data } = await supabase
      .from("sistema_config")
      .select("chave,valor")
      .in("chave", ["assinatura_presidente_url", "nome_presidente"]);
    const map = Object.fromEntries((data || []).map((r: any) => [r.chave, r.valor]));
    setPresidenteUrl(map.assinatura_presidente_url || null);
    setPresidenteNome(map.nome_presidente || "");
  };

  const uploadAssinaturaPresidente = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem (PNG/JPG)");
    if (file.size > 2 * 1024 * 1024) return toast.error("Máx. 2MB");
    setUploadingSig(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `assinaturas/presidente.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("profile-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(path);
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      const { error } = await supabase
        .from("sistema_config")
        .upsert({ chave: "assinatura_presidente_url", valor: finalUrl }, { onConflict: "chave" });
      if (error) throw error;
      setPresidenteUrl(finalUrl);
      toast.success("Assinatura do Presidente atualizada");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar");
    } finally {
      setUploadingSig(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const salvarNomePresidente = async () => {
    setSavingSigMeta(true);
    try {
      const { error } = await supabase
        .from("sistema_config")
        .upsert({ chave: "nome_presidente", valor: presidenteNome.trim() || null }, { onConflict: "chave" });
      if (error) throw error;
      toast.success("Nome do Presidente salvo");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    } finally {
      setSavingSigMeta(false);
    }
  };

  const removerAssinaturaPresidente = async () => {
    if (!confirm("Remover a assinatura do Presidente?")) return;
    const { error } = await supabase
      .from("sistema_config")
      .upsert({ chave: "assinatura_presidente_url", valor: null }, { onConflict: "chave" });
    if (error) return toast.error(error.message);
    setPresidenteUrl(null);
    toast.success("Assinatura removida");
  };


  const loadAdmins = async () => {
    const { data } = await supabase.from("user_roles").select("*").eq("role", "admin");
    setAdmins(data || []);
  };

  const save = () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas");
    }, 400);
  };

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const removeAdmin = async (id: string) => {
    if (!confirm("Remover permissão de administrador?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Administrador removido");
    loadAdmins();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Ajuste preferências do painel administrativo</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      <Tabs defaultValue="organizacao" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="organizacao"><Building className="w-4 h-4 mr-2" />Organização</TabsTrigger>
          <TabsTrigger value="carteirinha"><PenTool className="w-4 h-4 mr-2" />Carteirinha</TabsTrigger>
          <TabsTrigger value="notificacoes"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
          <TabsTrigger value="seguranca"><Shield className="w-4 h-4 mr-2" />Segurança</TabsTrigger>
          <TabsTrigger value="aparencia"><Palette className="w-4 h-4 mr-2" />Aparência</TabsTrigger>
          <TabsTrigger value="admins"><UserPlus className="w-4 h-4 mr-2" />Administradores</TabsTrigger>
        </TabsList>


        <TabsContent value="organizacao">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Organização</CardTitle>
              <CardDescription>Informações institucionais usadas em documentos e comunicações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Razão Social</Label>
                <Input value={settings.org_name} onChange={(e) => update("org_name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CNPJ</Label>
                  <Input value={settings.org_cnpj} onChange={(e) => update("org_cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={settings.org_telefone} onChange={(e) => update("org_telefone", e.target.value)} placeholder="(71) 0000-0000" />
                </div>
              </div>
              <div>
                <Label>E-mail de contato</Label>
                <Input type="email" value={settings.org_email} onChange={(e) => update("org_email", e.target.value)} />
              </div>
              <div>
                <Label>Endereço</Label>
                <Textarea value={settings.org_endereco} onChange={(e) => update("org_endereco", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha quais alertas você deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { k: "notif_email_novos" as const, t: "Novos associados", d: "Enviar e-mail ao cadastrar novo associado" },
                { k: "notif_email_erros" as const, t: "Erros de sincronização", d: "Alertar quando um sync falhar" },
                { k: "notif_aniversarios" as const, t: "Aniversariantes do dia", d: "Resumo diário de aniversários" },
              ].map((n) => (
                <div key={n.k} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{n.t}</p>
                    <p className="text-sm text-muted-foreground">{n.d}</p>
                  </div>
                  <Switch checked={settings[n.k]} onCheckedChange={(v) => update(n.k, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Controle de acesso ao painel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Autenticação em dois fatores (2FA)</p>
                  <p className="text-sm text-muted-foreground">Exigir código adicional no login</p>
                </div>
                <Switch checked={settings.seguranca_2fa} onCheckedChange={(v) => update("seguranca_2fa", v)} />
              </div>
              <div>
                <Label>Tempo de sessão (minutos)</Label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={settings.seguranca_sessao_min}
                  onChange={(e) => update("seguranca_sessao_min", parseInt(e.target.value) || 60)}
                />
                <p className="text-xs text-muted-foreground mt-1">Após esse período de inatividade, o usuário será desconectado.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cor primária</Label>
                <Select value={settings.tema_primario} onValueChange={(v) => update("tema_primario", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verde">Verde SBPM</SelectItem>
                    <SelectItem value="azul">Azul</SelectItem>
                    <SelectItem value="vermelho">Vermelho</SelectItem>
                    <SelectItem value="amarelo">Amarelo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idioma</Label>
                <Select value={settings.idioma} onValueChange={(v) => update("idioma", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
              <CardDescription>Usuários com acesso ao painel administrativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {admins.length === 0 && <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</p>}
                {admins.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{a.user_id}</p>
                      <p className="text-sm">Papel: <span className="font-medium">{a.role}</span></p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeAdmin(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Label>Convidar novo administrador</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("Peça ao usuário se cadastrar em /admin/login. Depois adicione o papel manualmente pelo banco.");
                      setNewAdminEmail("");
                    }}
                  >
                    Convidar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  O usuário deve primeiro criar uma conta em <code>/admin/login</code>. Em seguida, o papel de admin é atribuído pelo banco.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
