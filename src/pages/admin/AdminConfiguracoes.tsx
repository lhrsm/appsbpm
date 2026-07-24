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
import DrawSignatureCanvas from "@/components/DrawSignatureCanvas";


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

const SIGNATARIOS_DEFAULT: { slug: string; cargoPadrao: string }[] = [
  { slug: "presidente", cargoPadrao: "Presidente" },
  { slug: "vice_presidente", cargoPadrao: "Vice-Presidente" },
  { slug: "superintendente_saude", cargoPadrao: "Superintendente de Promoção da Saúde" },
];

type Signatario = { slug: string; nome: string; cargo: string; url: string | null };

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [signatarios, setSignatarios] = useState<Signatario[]>(
    SIGNATARIOS_DEFAULT.map((s) => ({ slug: s.slug, nome: "", cargo: s.cargoPadrao, url: null }))
  );
  const [signatarioAtivo, setSignatarioAtivo] = useState<string>("presidente");
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSettings({ ...DEFAULTS, ...JSON.parse(saved) }); } catch {}
    }
    loadAdmins();
    loadSignatarios();
  }, []);

  const loadSignatarios = async () => {
    const { data } = await supabase.from("sistema_config").select("chave,valor");
    const map = Object.fromEntries((data || []).map((r: any) => [r.chave, r.valor]));

    const legacyUrl = map.assinatura_presidente_url || null;
    const legacyNome = map.nome_presidente || "";

    setSignatarios(
      SIGNATARIOS_DEFAULT.map((s) => ({
        slug: s.slug,
        nome: map[`signatario_${s.slug}_nome`] || (s.slug === "presidente" ? legacyNome : ""),
        cargo: map[`signatario_${s.slug}_cargo`] || s.cargoPadrao,
        url: map[`signatario_${s.slug}_url`] || (s.slug === "presidente" ? legacyUrl : null),
      }))
    );
    setSignatarioAtivo(map.signatario_ativo || "presidente");
  };

  const updateSignatarioLocal = (slug: string, patch: Partial<Signatario>) =>
    setSignatarios((prev) => prev.map((s) => (s.slug === slug ? { ...s, ...patch } : s)));

  const salvarDadosSignatario = async (slug: string) => {
    const sig = signatarios.find((s) => s.slug === slug);
    if (!sig) return;
    setSavingSlug(slug);
    try {
      const rows = [
        { chave: `signatario_${slug}_nome`, valor: sig.nome.trim() || null },
        { chave: `signatario_${slug}_cargo`, valor: sig.cargo.trim() || null },
      ];
      const { error } = await supabase.from("sistema_config").upsert(rows, { onConflict: "chave" });
      if (error) throw error;
      if (slug === "presidente") {
        await supabase
          .from("sistema_config")
          .upsert({ chave: "nome_presidente", valor: sig.nome.trim() || null }, { onConflict: "chave" });
      }
      toast.success("Dados salvos");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    } finally {
      setSavingSlug(null);
    }
  };

  const persistirAssinaturaBlob = async (slug: string, blob: Blob, ext = "png", contentType = "image/png") => {
    const path = `assinaturas/${slug}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("profile-photos")
      .upload(path, blob, { upsert: true, contentType });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(path);
    const finalUrl = `${publicUrl}?t=${Date.now()}`;
    const rows = [{ chave: `signatario_${slug}_url`, valor: finalUrl }];
    if (slug === "presidente") rows.push({ chave: "assinatura_presidente_url", valor: finalUrl });
    const { error } = await supabase.from("sistema_config").upsert(rows, { onConflict: "chave" });
    if (error) throw error;
    updateSignatarioLocal(slug, { url: finalUrl });
    return finalUrl;
  };

  const uploadAssinatura = async (slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Selecione uma imagem (PNG/JPG)");
    if (file.size > 2 * 1024 * 1024) return toast.error("Máx. 2MB");
    setUploadingSlug(slug);
    try {
      const ext = file.name.split(".").pop() || "png";
      await persistirAssinaturaBlob(slug, file, ext, file.type);
      toast.success("Assinatura atualizada");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar");
    } finally {
      setUploadingSlug(null);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const salvarAssinaturaDesenhada = async (slug: string, blob: Blob) => {
    setUploadingSlug(slug);
    try {
      await persistirAssinaturaBlob(slug, blob);
      toast.success("Assinatura desenhada salva");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar assinatura");
    } finally {
      setUploadingSlug(null);
    }
  };

  const removerAssinatura = async (slug: string) => {
    if (!confirm("Remover esta assinatura?")) return;
    const rows = [{ chave: `signatario_${slug}_url`, valor: null }];
    if (slug === "presidente") rows.push({ chave: "assinatura_presidente_url", valor: null });
    const { error } = await supabase.from("sistema_config").upsert(rows, { onConflict: "chave" });
    if (error) return toast.error(error.message);
    updateSignatarioLocal(slug, { url: null });
    toast.success("Assinatura removida");
  };

  const definirAtivo = async (slug: string) => {
    const sig = signatarios.find((s) => s.slug === slug);
    if (!sig?.url) return toast.error("Envie uma imagem antes de ativar");
    const { error } = await supabase
      .from("sistema_config")
      .upsert({ chave: "signatario_ativo", valor: slug }, { onConflict: "chave" });
    if (error) return toast.error(error.message);
    setSignatarioAtivo(slug);
    toast.success("Assinatura ativa atualizada — já aparece nas carteirinhas");
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

        <TabsContent value="carteirinha">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PenTool className="w-5 h-5" /> Assinaturas da Carteirinha</CardTitle>
              <CardDescription>
                Cadastre até 3 signatários (Presidente, Vice-Presidente e Superintendente de Promoção da Saúde)
                e escolha qual assinatura será exibida nas carteirinhas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {signatarios.map((sig) => {
                const ativo = signatarioAtivo === sig.slug;
                return (
                  <div key={sig.slug} className={`rounded-lg border p-4 space-y-4 ${ativo ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{sig.cargo || sig.slug}</span>
                        {ativo && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Ativo na carteirinha</span>}
                      </div>
                      <Button
                        size="sm"
                        variant={ativo ? "secondary" : "outline"}
                        onClick={() => definirAtivo(sig.slug)}
                        disabled={ativo || !sig.url}
                      >
                        {ativo ? "Selecionado" : "Usar esta assinatura"}
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Nome</Label>
                        <Input
                          value={sig.nome}
                          onChange={(e) => updateSignatarioLocal(sig.slug, { nome: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Cargo (rótulo)</Label>
                        <Input
                          value={sig.cargo}
                          onChange={(e) => updateSignatarioLocal(sig.slug, { cargo: e.target.value })}
                          placeholder="Ex: Vice-Presidente"
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="w-56 h-20 border rounded-md bg-muted/30 flex items-center justify-center overflow-hidden">
                        {sig.url ? (
                          <img src={sig.url} alt={`Assinatura ${sig.cargo}`} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem assinatura</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`file-sig-${sig.slug}`} className="cursor-pointer">
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-accent text-sm">
                            {uploadingSlug === sig.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {uploadingSlug === sig.slug ? "Enviando..." : "Enviar imagem"}
                          </div>
                          <input
                            id={`file-sig-${sig.slug}`}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => uploadAssinatura(sig.slug, e)}
                            disabled={uploadingSlug === sig.slug}
                          />
                        </Label>
                        {sig.url && (
                          <Button variant="outline" size="sm" onClick={() => removerAssinatura(sig.slug)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Remover
                          </Button>
                        )}
                      </div>
                      <div className="ml-auto">
                        <Button size="sm" onClick={() => salvarDadosSignatario(sig.slug)} disabled={savingSlug === sig.slug}>
                          {savingSlug === sig.slug ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Salvar nome/cargo
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                PNG/JPG/WebP, até 2MB. Recomendado: 600×200px com fundo transparente.
              </p>
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
