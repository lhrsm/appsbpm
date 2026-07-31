import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw, FlaskConical } from 'lucide-react';
import PermissionGuard from '@/components/admin/PermissionGuard';

const statusCores: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/10 text-destructive',
  deceased: 'bg-muted text-muted-foreground',
  manual_review: 'bg-amber-100 text-amber-800',
};

const vazio = {
  cpf_reference: '',
  birth_date: '',
  registration_number: '',
  full_name: '',
  mother_name: '',
  person_type: 'associate',
  status: 'active',
  email_hint: '',
};

export default function AdminValidacaoExterna() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [form, setForm] = useState({ ...vazio });
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

  const carregar = async () => {
    setCarregando(true);
    const [r, l, v] = await Promise.all([
      supabase.from('external_identity_mock_records' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('external_auth_audit_logs' as any).select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('external_account_links' as any).select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setRegistros((r.data as any[]) || []);
    setLogs((l.data as any[]) || []);
    setVinculos((v.data as any[]) || []);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const salvar = async () => {
    const payload = { ...form, cpf_reference: form.cpf_reference.replace(/\D/g, '') };
    const { error } = await supabase.from('external_identity_mock_records' as any).insert(payload as any);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Registro fictício criado' });
    setForm({ ...vazio });
    setAberto(false);
    carregar();
  };

  return (
    <PermissionGuard modulo="integracoes" acao="visualizar">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Validação externa de identidade</h1>
            <p className="text-sm text-muted-foreground">
              Base fictícia para testes do primeiro acesso, vínculos criados e trilha de auditoria.
            </p>
          </div>
          <Button variant="outline" onClick={carregar} disabled={carregando}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>

        <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Enquanto a API institucional não estiver disponível, a validação usa estes registros fictícios. Ao ativar
              o provedor oficial, o fluxo do associado permanece idêntico — apenas a fonte dos dados muda.
            </span>
          </CardContent>
        </Card>

        <Tabs defaultValue="mock">
          <TabsList>
            <TabsTrigger value="mock">Base fictícia</TabsTrigger>
            <TabsTrigger value="vinculos">Acessos criados</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="mock" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Registros de teste</CardTitle>
                  <CardDescription>{registros.length} registro(s)</CardDescription>
                </div>
                <Dialog open={aberto} onOpenChange={setAberto}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Novo registro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Novo registro fictício</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['cpf_reference', 'CPF (somente números)'],
                        ['birth_date', 'Data de nascimento'],
                        ['registration_number', 'Matrícula'],
                        ['full_name', 'Nome completo'],
                        ['mother_name', 'Nome da mãe'],
                        ['email_hint', 'E-mail de referência'],
                      ].map(([key, label]) => (
                        <div className="space-y-1" key={key}>
                          <Label htmlFor={key}>{label}</Label>
                          <Input
                            id={key}
                            type={key === 'birth_date' ? 'date' : 'text'}
                            value={(form as any)[key]}
                            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <Label htmlFor="person_type">Tipo</Label>
                        <select
                          id="person_type"
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                          value={form.person_type}
                          onChange={(e) => setForm((p) => ({ ...p, person_type: e.target.value }))}
                        >
                          <option value="associate">Associado</option>
                          <option value="dependent">Dependente</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="status">Situação</Label>
                        <select
                          id="status"
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                          value={form.status}
                          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                          <option value="blocked">Bloqueado</option>
                          <option value="deceased">Falecido</option>
                          <option value="manual_review">Revisão manual</option>
                        </select>
                      </div>
                    </div>
                    <Button onClick={salvar} className="w-full">Salvar registro</Button>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Nascimento</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registros.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.full_name}</TableCell>
                        <TableCell className="font-mono text-xs">{r.cpf_reference}</TableCell>
                        <TableCell>{r.birth_date}</TableCell>
                        <TableCell>{r.registration_number ?? '—'}</TableCell>
                        <TableCell>{r.person_type === 'associate' ? 'Associado' : 'Dependente'}</TableCell>
                        <TableCell>
                          <Badge className={statusCores[r.status] ?? ''} variant="secondary">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!registros.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro cadastrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vinculos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Acessos criados</CardTitle>
                <CardDescription>Contas do portal vinculadas a uma identidade institucional.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Último acesso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vinculos.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.email}</TableCell>
                        <TableCell>{v.person_type === 'associate' ? 'Associado' : 'Dependente'}</TableCell>
                        <TableCell>{v.registration_number ?? '—'}</TableCell>
                        <TableCell><Badge variant="secondary">{v.status}</Badge></TableCell>
                        <TableCell>{v.last_login_at ? new Date(v.last_login_at).toLocaleString('pt-BR') : 'Nunca'}</TableCell>
                      </TableRow>
                    ))}
                    {!vinculos.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum acesso criado ainda.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Trilha de auditoria</CardTitle>
                <CardDescription>Últimos 50 eventos do fluxo de acesso externo.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Provedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap">{new Date(l.created_at).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{l.event_type}</TableCell>
                        <TableCell><Badge variant="secondary">{l.result}</Badge></TableCell>
                        <TableCell>{l.provider ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {!logs.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">Sem eventos registrados.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
