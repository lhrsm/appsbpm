import { useEffect, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { portalCall } from '@/lib/portal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, ShieldAlert, History, Mail, FileText, Loader2, Trash2, RefreshCw, Edit, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TipoSolicitacao = 'exclusao' | 'portabilidade' | 'revogacao' | 'correcao';

const TIPOS: { value: TipoSolicitacao; label: string; icon: any; descricao: string }[] = [
  { value: 'exclusao', label: 'Excluir meus dados', icon: Trash2, descricao: 'Solicita a remoção completa dos seus dados pessoais dos nossos sistemas.' },
  { value: 'portabilidade', label: 'Portabilidade', icon: Download, descricao: 'Receba uma cópia estruturada dos seus dados para transferir a outro serviço.' },
  { value: 'revogacao', label: 'Revogar consentimento', icon: RefreshCw, descricao: 'Cancela um consentimento previamente concedido para uso dos seus dados.' },
  { value: 'correcao', label: 'Corrigir dados', icon: Edit, descricao: 'Solicita a correção de dados incorretos ou desatualizados.' },
];

export default function MinhaPrivacidade() {
  const { associado, dependentes, limite, historicoLimite, informes, isDependente, dependenteLogado } = useAssociado();
  const alvo = isDependente ? dependenteLogado : associado;

  const [tipo, setTipo] = useState<TipoSolicitacao>('portabilidade');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [consentimentos, setConsentimentos] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [acessos, setAcessos] = useState<any[]>([]);

  useEffect(() => {
    if (!associado) return;
    portalCall<any>('privacidade')
      .then((res) => {
        setConsentimentos(res.consentimentos || []);
        setSolicitacoes(res.solicitacoes || []);
        setAcessos(res.acessos || []);
      })
      .catch(() => {});
  }, [associado, isDependente, dependenteLogado?.id]);

  if (!associado || !alvo) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Faça login para acessar a Central de Privacidade.
        </CardContent>
      </Card>
    );
  }

  const baixarDados = () => {
    const dados = {
      gerado_em: new Date().toISOString(),
      titular: {
        id: associado.id,
        matricula: associado.matricula,
        nome: associado.nome,
        cpf: associado.cpf,
        email: associado.email,
        telefone: associado.telefone,
        endereco: associado.endereco,
        data_nascimento: associado.data_nascimento,
        data_admissao: associado.data_admissao,
        ativo: associado.status === 'regular',
      },
      dependentes: dependentes.map((d) => ({
        id: d.id, nome: d.nome, cpf: d.cpf, tipo: d.tipo, ativo: d.status === 'regular',
      })),
      limite,
      historico_limite: historicoLimite,
      informes_rendimentos: informes,
      consentimentos,
      solicitacoes_privacidade: solicitacoes,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meus-dados-sbpm-${associado.matricula}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Download iniciado. Arquivo em JSON conforme LGPD Art. 18, V.');
  };

  const enviarSolicitacao = async () => {
    setEnviando(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-privacidade-solicitacao', {
        body: {
          tipo,
          descricao,
          solicitante: {
            nome: alvo.nome,
            email: (associado.email || '') as string,
            documento: (isDependente ? dependenteLogado?.cpf : associado.cpf) || '',
            matricula: associado.matricula,
            telefone: (associado.telefone || '') as string,
          },
          associado_id: associado.id,
          dependente_id: isDependente ? dependenteLogado?.id : '',
        },
      });
      if (error) throw error;
      toast.success('Solicitação enviada. O DPO responderá em até 15 dias úteis.');
      setDescricao('');
      // recarrega histórico
      const atualizado = await portalCall<any>('privacidade').catch(() => null);
      if (atualizado) setSolicitacoes(atualizado.solicitacoes || []);
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao enviar solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      em_analise: 'bg-blue-100 text-blue-800',
      atendida: 'bg-green-100 text-green-800',
      recusada: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[s] || ''}>{s.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          Central de Privacidade
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exerça seus direitos como titular de dados conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
        </p>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="dados">Meus dados</TabsTrigger>
          <TabsTrigger value="acessos">Acessos</TabsTrigger>
          <TabsTrigger value="solicitar">Nova solicitação</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="dpo">Encarregado</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="w-5 h-5" />
                Portabilidade — baixar meus dados
              </CardTitle>
              <CardDescription>
                Baixe um arquivo JSON contendo todos os dados pessoais que a SBPM mantém sobre você e seus dependentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={baixarDados}>
                <Download className="w-4 h-4 mr-2" />
                Baixar meus dados (JSON)
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Base legal: LGPD Art. 18, V — direito à portabilidade dos dados pessoais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5" />
                Meus consentimentos
              </CardTitle>
              <CardDescription>Registros de aceite de termos, políticas e cookies.</CardDescription>
            </CardHeader>
            <CardContent>
              {consentimentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum consentimento registrado.</p>
              ) : (
                <ul className="space-y-2">
                  {consentimentos.map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2">
                      <div>
                        <p className="font-medium capitalize">{c.tipo.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          Versão {c.versao} · {format(new Date(c.aceito_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant={c.aceito ? 'default' : 'secondary'}>
                        {c.aceito ? 'Aceito' : 'Revogado'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acessos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                Histórico de acessos
              </CardTitle>
              <CardDescription>
                Últimos 20 acessos registrados na sua conta. Se notar algum acesso não reconhecido, fale imediatamente com o DPO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {acessos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum acesso registrado ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {acessos.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 rounded border bg-muted/40 px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {format(new Date(a.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.tipo_usuario === 'titular' ? 'Titular' : 'Dependente'} · via {a.metodo_login || 'n/d'}
                          {a.user_agent ? ` · ${a.user_agent.slice(0, 60)}${a.user_agent.length > 60 ? '…' : ''}` : ''}
                        </p>
                      </div>
                      <Badge variant={a.sucesso ? 'default' : 'destructive'}>
                        {a.sucesso ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="solicitar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova solicitação</CardTitle>
              <CardDescription>
                Escolha o direito que deseja exercer. Sua solicitação será encaminhada ao Encarregado de Dados (DPO) e respondida em até 15 dias úteis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                {TIPOS.map((t) => {
                  const Icon = t.icon;
                  const selected = tipo === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipo(t.value)}
                      className={`text-left border rounded-lg p-3 transition-colors ${
                        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t.descricao}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <Label htmlFor="descricao">Detalhes (opcional)</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  maxLength={2000}
                  placeholder="Descreva sua solicitação..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              {tipo === 'exclusao' && (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    A exclusão pode ser limitada quando houver obrigação legal de guarda dos dados (art. 16, LGPD).
                    Dados essenciais para cumprimento de obrigações previdenciárias podem ser retidos pelo prazo legal.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={enviarSolicitacao} disabled={enviando}>
                {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Enviar solicitação ao DPO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minhas solicitações</CardTitle>
              <CardDescription>Todas as solicitações que você já enviou.</CardDescription>
            </CardHeader>
            <CardContent>
              {solicitacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma solicitação registrada.</p>
              ) : (
                <ul className="space-y-3">
                  {solicitacoes.map((s) => (
                    <li key={s.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium capitalize">{TIPOS.find((t) => t.value === s.tipo)?.label || s.tipo}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(s.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {s.descricao && <p className="text-sm mt-1">{s.descricao}</p>}
                          {s.resposta && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <strong>Resposta:</strong> {s.resposta}
                            </div>
                          )}
                        </div>
                        {statusBadge(s.status)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dpo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Encarregado de Proteção de Dados (DPO)
              </CardTitle>
              <CardDescription>
                Contato direto do Encarregado pelo Tratamento de Dados Pessoais da SBPM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">SBPM — Sociedade Beneficente da Polícia Militar da Bahia</p>
                <p className="text-muted-foreground">Encarregado de Dados (LGPD Art. 41)</p>
              </div>
              <div className="space-y-1">
                <p><strong>E-mail:</strong> <a href="mailto:previdencia@sbpmbahia.com.br" className="text-primary hover:underline">previdencia@sbpmbahia.com.br</a></p>
                <p><strong>Telefone:</strong> (71) 98549-6972</p>
                <p><strong>Prazo de resposta:</strong> até 15 dias úteis</p>
              </div>
              <Alert>
                <AlertDescription className="text-xs">
                  Também é possível apresentar reclamação diretamente à Autoridade Nacional de Proteção de Dados (ANPD) através de{' '}
                  <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    gov.br/anpd
                  </a>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
