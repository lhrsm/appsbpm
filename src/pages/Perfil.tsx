import { useEffect, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import SignaturePad from '@/components/SignaturePad';
import { Loader2, Save, User as UserIcon, Lock, Bell, PenTool, Download, History } from 'lucide-react';
import { toast } from 'sonner';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AcessoRegistro {
  id: string;
  created_at: string;
  metodo_login: string | null;
  user_agent: string | null;
  sucesso: boolean;
}


export default function Perfil() {
  const {
    associado,
    setAssociado,
    dependentes,
    setDependentes,
    isDependente,
    dependenteLogado,
    setDependenteLogado,
  } = useAssociado();

  const alvo = isDependente ? dependenteLogado : associado;

  const [email, setEmail] = useState(alvo?.email || '');
  const [telefone, setTelefone] = useState(alvo?.telefone || '');
  const [endereco, setEndereco] = useState(alvo?.endereco || '');
  const [saving, setSaving] = useState(false);

  if (!alvo || !associado) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum perfil carregado.
        </CardContent>
      </Card>
    );
  }

  const handlePhotoUpdated = (newUrl: string) => {
    if (isDependente && dependenteLogado) {
      const atualizado = { ...dependenteLogado, foto_url: newUrl };
      setDependenteLogado(atualizado);
      setDependentes(dependentes.map((d) => (d.id === atualizado.id ? atualizado : d)));
    } else if (associado) {
      setAssociado({ ...associado, foto_url: newUrl });
    }
  };

  const handleSignatureUpdated = (newUrl: string) => {
    if (isDependente && dependenteLogado) {
      const atualizado = { ...dependenteLogado, assinatura_url: newUrl };
      setDependenteLogado(atualizado);
      setDependentes(dependentes.map((d) => (d.id === atualizado.id ? atualizado : d)));
    } else if (associado) {
      setAssociado({ ...associado, assinatura_url: newUrl });
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cpfEnvio = isDependente ? dependenteLogado?.cpf || undefined : associado.cpf;
      const idEnvio = isDependente ? dependenteLogado!.id : associado.id;
      const { data, error } = await supabase.functions.invoke('update-perfil', {
        body: {
          tipo: isDependente ? 'dependente' : 'associado',
          id: idEnvio,
          matricula_titular: associado.matricula,
          cpf: cpfEnvio,
          campos: {
            email: email.trim(),
            telefone: telefone.trim(),
            endereco: endereco.trim(),
          },
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error(data?.error || 'Falha ao salvar');

      if (isDependente && dependenteLogado) {
        const atualizado = {
          ...dependenteLogado,
          email: email.trim() || null,
          telefone: telefone.trim() || null,
          endereco: endereco.trim() || null,
        };
        setDependenteLogado(atualizado);
        setDependentes(dependentes.map((d) => (d.id === atualizado.id ? atualizado : d)));
      } else {
        setAssociado({
          ...associado,
          email: email.trim() || null,
          telefone: telefone.trim() || null,
          endereco: endereco.trim() || null,
        });
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const payload = {
      exportado_em: new Date().toISOString(),
      tipo: isDependente ? 'dependente' : 'titular',
      titular: {
        nome: associado.nome,
        matricula: associado.matricula,
        cpf: associado.cpf,
        email: associado.email,
        telefone: associado.telefone,
        endereco: associado.endereco,
        data_admissao: associado.data_admissao,
      },
      dependente_logado: isDependente ? dependenteLogado : null,
      dependentes: isDependente ? [] : dependentes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-sbpm-${alvo.nome.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Seus dados foram exportados.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <UserIcon className="h-8 w-8 text-primary" />
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Atualize sua foto, e-mail, telefone e endereço.
        </p>

      </div>

      {/* Foto */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>Clique no ícone da câmera para trocar a foto.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <ProfilePhotoUpload
            currentPhotoUrl={alvo.foto_url}
            userId={alvo.id}
            userType={isDependente ? 'dependente' : 'associado'}
            userName={alvo.nome}
            size="lg"
            onPhotoUpdated={handlePhotoUpdated}
          />
          <div>
            <p className="font-semibold text-lg">{alvo.nome}</p>
            <p className="text-sm text-muted-foreground">
              {isDependente ? 'Dependente' : `Matrícula ${associado.matricula}`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dados cadastrais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
          <CardDescription>
            Campos bloqueados são sincronizados com o sistema interno da SBPM e só podem ser
            alterados pelo setor responsável.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Lock className="h-3 w-3" /> Nome completo</Label>
                <Input value={alvo.nome} disabled />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Lock className="h-3 w-3" /> CPF</Label>
                <Input value={('cpf' in alvo && alvo.cpf) || ''} disabled />
              </div>

              {!isDependente && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Lock className="h-3 w-3" /> Matrícula</Label>
                    <Input value={associado.matricula} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Lock className="h-3 w-3" /> Data de admissão</Label>
                    <Input value={associado.data_admissao || ''} disabled />
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  maxLength={30}
                  placeholder="(71) 9 9999-9999"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Rua, número, bairro, cidade — UF, CEP"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar alterações
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Assinatura digital */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" /> Assinatura digital
          </CardTitle>
          <CardDescription>
            Sua assinatura aparecerá impressa na sua carteirinha. Você pode desenhá-la abaixo com o
            mouse/dedo ou enviar uma imagem transparente (PNG) da assinatura já escaneada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignaturePad
            currentSignatureUrl={alvo.assinatura_url}
            userId={alvo.id}
            userType={isDependente ? 'dependente' : 'associado'}
            onSaved={handleSignatureUpdated}
          />
        </CardContent>
      </Card>



      {/* Notificações push */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notificações push
          </CardTitle>
          <CardDescription>
            Receba avisos importantes da SBPM diretamente neste dispositivo, mesmo com o app fechado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationToggle
            associadoId={isDependente ? null : associado.id}
            dependenteId={isDependente && dependenteLogado ? dependenteLogado.id : null}
          />
        </CardContent>
      </Card>

      {/* Portabilidade de dados (LGPD) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Exportar meus dados
          </CardTitle>
          <CardDescription>
            Direito de portabilidade (LGPD, art. 18). Baixe uma cópia dos seus dados cadastrais
            disponíveis neste portal em formato JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" /> Baixar meus dados (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
