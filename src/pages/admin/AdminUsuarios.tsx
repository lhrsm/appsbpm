import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePermissoes } from "@/hooks/usePermissoes";
import { ACOES, MODULOS, labelAcao, labelModulo, type PermAcao } from "@/lib/permissoes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { KeyRound, Plus, ShieldCheck, History, Pencil, Lock } from "lucide-react";

type Perfil = {
  codigo: string; nome: string; descricao: string | null; nivel: number;
  interno: boolean; gerencia_usuarios: boolean; somente_leitura: boolean;
};
type UsuarioInterno = {
  user_id: string; nome: string; email: string; setor: string | null;
  perfil_codigo: string; ativo: boolean; ultimo_acesso: string | null; created_at: string;
};
type PermUsuario = { id: string; user_id: string; modulo: string; pagina: string; acao: string; concedido: boolean };
type LogRow = { id: string; alvo_user_id: string | null; ator_user_id: string | null; acao: string; detalhes: Record<string, unknown> | null; created_at: string };

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");

export default function AdminUsuarios() {
  const { userId, podeGerenciarUsuarios, perfil: meuPerfil, recarregar } = usePermissoes();
  const [loading, setLoading] = useState(true);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioInterno[]>([]);
  const [permsPorUsuario, setPermsPorUsuario] = useState<PermUsuario[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [busca, setBusca] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioInterno | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", setor: "", perfil_codigo: "operador" });
  const [salvando, setSalvando] = useState(false);

  const [permsOpen, setPermsOpen] = useState(false);
  const [alvo, setAlvo] = useState<UsuarioInterno | null>(null);
  const [novaPerm, setNovaPerm] = useState<{ modulo: string; acao: PermAcao; concedido: boolean }>({
    modulo: "financeiro", acao: "visualizar", concedido: true,
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    const [p, u, up, lg] = await Promise.all([
      supabase.from("perfis").select("*").order("nivel", { ascending: false }),
      supabase.from("usuarios_internos").select("*").order("nome"),
      supabase.from("usuario_permissoes").select("*"),
      supabase.from("acessos_permissoes_log").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setPerfis((p.data as Perfil[]) ?? []);
    setUsuarios((u.data as UsuarioInterno[]) ?? []);
    setPermsPorUsuario((up.data as PermUsuario[]) ?? []);
    setLogs((lg.data as LogRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const perfisInternos = useMemo(() => perfis.filter((p) => p.interno), [perfis]);
  const nomePerfil = useCallback(
    (c: string) => perfis.find((p) => p.codigo === c)?.nome ?? c, [perfis]);
  const nomeUsuario = useCallback(
    (id: string | null) => usuarios.find((u) => u.user_id === id)?.nome ?? (id ? `${id.slice(0, 8)}…` : "sistema"),
    [usuarios]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u.nome, u.email, u.setor ?? "", nomePerfil(u.perfil_codigo)].join(" ").toLowerCase().includes(q));
  }, [usuarios, busca, nomePerfil]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", email: "", setor: "", perfil_codigo: "operador" });
    setFormOpen(true);
  };
  const abrirEdicao = (u: UsuarioInterno) => {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, setor: u.setor ?? "", perfil_codigo: u.perfil_codigo });
    setFormOpen(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.email.trim()) return toast.error("Informe nome e e-mail");
    setSalvando(true);
    try {
      if (editando) {
        const patch: { nome: string; setor: string | null; perfil_codigo?: string } = {
          nome: form.nome.trim(),
          setor: form.setor.trim() || null,
        };
        if (editando.user_id !== userId) patch.perfil_codigo = form.perfil_codigo;
        const { error } = await supabase.from("usuarios_internos").update(patch).eq("user_id", editando.user_id);
        if (error) throw error;
        toast.success("Usuário atualizado");
      } else {
        const { data, error } = await supabase.functions.invoke("admin-usuarios", {
          body: {
            email: form.email.trim().toLowerCase(),
            nome: form.nome.trim(),
            redirectTo: `${window.location.origin}/redefinir-senha`,
          },
        });
        if (error) throw error;
        const uid = (data as { user_id?: string })?.user_id;
        if (!uid) throw new Error("Não foi possível criar o acesso");
        const { error: insErr } = await supabase.from("usuarios_internos").insert({
          user_id: uid,
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          setor: form.setor.trim() || null,
          perfil_codigo: form.perfil_codigo,
          created_by: userId,
        });
        if (insErr) throw insErr;
        toast.success((data as { convidado?: boolean })?.convidado
          ? "Convite enviado por e-mail"
          : "Usuário vinculado ao painel");
      }
      setFormOpen(false);
      await carregar();
      await recarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar usuário");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (u: UsuarioInterno) => {
    const { error } = await supabase.from("usuarios_internos").update({ ativo: !u.ativo }).eq("user_id", u.user_id);
    if (error) return toast.error(error.message);
    toast.success(u.ativo ? "Usuário inativado" : "Usuário ativado");
    await carregar();
  };

  const abrirPerms = (u: UsuarioInterno) => { setAlvo(u); setPermsOpen(true); };

  const adicionarPerm = async () => {
    if (!alvo) return;
    const { error } = await supabase.from("usuario_permissoes").upsert(
      {
        user_id: alvo.user_id,
        modulo: novaPerm.modulo,
        pagina: "*",
        acao: novaPerm.acao,
        concedido: novaPerm.concedido,
        concedido_por: userId,
      },
      { onConflict: "user_id,modulo,pagina,acao" },
    );
    if (error) return toast.error(error.message);
    toast.success("Permissão registrada");
    await carregar();
  };

  const removerPerm = async (id: string) => {
    const { error } = await supabase.from("usuario_permissoes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Permissão removida");
    await carregar();
  };

  const permsDoAlvo = permsPorUsuario.filter((p) => p.user_id === alvo?.user_id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Usuários e Permissões</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Perfis, setores e permissões granulares dos usuários internos. Todas as regras são validadas
            no banco de dados (RLS) — esconder botões não concede nem impede acesso.
          </p>
        </div>
        {podeGerenciarUsuarios && (
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar usuário
          </Button>
        )}
      </header>

      {!podeGerenciarUsuarios && (
        <Card className="border-dashed">
          <CardContent className="flex items-start gap-3 py-4">
            <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Seu perfil ({meuPerfil?.nome ?? "—"}) permite apenas consultar esta página. A gestão de usuários
              é restrita ao Superadministrador e ao Administrador institucional.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4 pt-4">
          <Input
            placeholder="Buscar por nome, e-mail, setor ou perfil..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-sm"
            aria-label="Buscar usuários"
          />
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : filtrados.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum usuário interno encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead>Último acesso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtrados.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="font-medium text-sm">
                              {u.nome}
                              {u.user_id === userId && (
                                <Badge variant="secondary" className="ml-2 text-[10px]">você</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </TableCell>
                          <TableCell className="text-sm">{u.setor ?? "—"}</TableCell>
                          <TableCell><Badge className="text-[10px]">{nomePerfil(u.perfil_codigo)}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={u.ativo ? "default" : "outline"} className="text-[10px]">
                              {u.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmt(u.ultimo_acesso)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {podeGerenciarUsuarios && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => abrirEdicao(u)} aria-label={`Editar ${u.nome}`}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm" onClick={() => abrirPerms(u)}
                                  aria-label={`Permissões de ${u.nome}`} disabled={u.user_id === userId}
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm" onClick={() => alternarAtivo(u)}
                                  disabled={u.user_id === userId}
                                >
                                  {u.ativo ? "Inativar" : "Ativar"}
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfis" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {perfis.map((p) => (
              <Card key={p.codigo}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                      <CardTitle className="text-base">{p.nome}</CardTitle>
                    </div>
                    <Badge variant={p.interno ? "default" : "outline"} className="text-[10px]">
                      {p.interno ? "Interno" : "Portal"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{p.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1">
                  {p.gerencia_usuarios && <Badge variant="secondary" className="text-[10px]">gerencia usuários</Badge>}
                  {p.somente_leitura && <Badge variant="secondary" className="text-[10px]">somente leitura</Badge>}
                  <Badge variant="outline" className="text-[10px]">nível {p.nivel}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">Histórico de alterações</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Mudanças de perfil, ativações, inativações e concessão/remoção de permissões (100 últimos registros).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Usuário afetado</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs whitespace-nowrap">{fmt(l.created_at)}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{l.acao.replace(/_/g, " ")}</Badge></TableCell>
                          <TableCell className="text-xs">{nomeUsuario(l.alvo_user_id)}</TableCell>
                          <TableCell className="text-xs">{nomeUsuario(l.ator_user_id)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                            {l.detalhes ? JSON.stringify(l.detalhes) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Criar / editar usuário */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar usuário" : "Adicionar usuário"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Atualize os dados cadastrais, o setor e o perfil de acesso."
                : "Um convite será enviado por e-mail para o usuário definir a senha."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="u-nome">Nome</Label>
              <Input id="u-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">E-mail institucional</Label>
              <Input id="u-email" type="email" value={form.email} disabled={!!editando}
                onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-setor">Setor</Label>
              <Input id="u-setor" value={form.setor} placeholder="Previdência, Financeiro, Patrimônio..."
                onChange={(e) => setForm({ ...form, setor: e.target.value })} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-perfil">Perfil</Label>
              <Select
                value={form.perfil_codigo}
                onValueChange={(v) => setForm({ ...form, perfil_codigo: v })}
                disabled={!!editando && editando.user_id === userId}
              >
                <SelectTrigger id="u-perfil"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {perfisInternos.map((p) => (
                    <SelectItem key={p.codigo} value={p.codigo}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!!editando && editando.user_id === userId && (
                <p className="text-xs text-muted-foreground">
                  Você não pode alterar o próprio nível de acesso.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissões específicas */}
      <Dialog open={permsOpen} onOpenChange={setPermsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permissões específicas — {alvo?.nome}</DialogTitle>
            <DialogDescription>
              Exceções que complementam ou bloqueiam o que o perfil {alvo ? nomePerfil(alvo.perfil_codigo) : ""} já concede.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="p-modulo">Módulo</Label>
              <Select value={novaPerm.modulo} onValueChange={(v) => setNovaPerm({ ...novaPerm, modulo: v })}>
                <SelectTrigger id="p-modulo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-acao">Ação</Label>
              <Select value={novaPerm.acao} onValueChange={(v) => setNovaPerm({ ...novaPerm, acao: v as PermAcao })}>
                <SelectTrigger id="p-acao"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACOES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch id="p-concedido" checked={novaPerm.concedido}
                onCheckedChange={(v) => setNovaPerm({ ...novaPerm, concedido: v })} />
              <Label htmlFor="p-concedido" className="text-xs">
                {novaPerm.concedido ? "Conceder" : "Bloquear"}
              </Label>
            </div>
            <Button onClick={adicionarPerm}>Aplicar</Button>
          </div>

          <div className="max-h-64 overflow-auto border rounded-md">
            {permsDoAlvo.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">Nenhuma exceção cadastrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permsDoAlvo.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{labelModulo(p.modulo)}</TableCell>
                      <TableCell className="text-sm">{labelAcao(p.acao)}</TableCell>
                      <TableCell>
                        <Badge variant={p.concedido ? "default" : "destructive"} className="text-[10px]">
                          {p.concedido ? "Concedida" : "Bloqueada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removerPerm(p.id)}>Remover</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
