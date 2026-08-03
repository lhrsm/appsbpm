import { useEffect, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { portalCall } from '@/lib/portal';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import SignaturePad from '@/components/SignaturePad';
import { 
  Loader2, Save, User as UserIcon, Lock, Bell, PenTool, Download, 
  History, MapPin, Shield, Users, FileText, CheckCircle2, AlertCircle,
  Clock, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';
import { maskCPF } from '@/lib/format';
import { useProfileSettings } from '@/portal/profile/hooks/useProfileSettings';
import { ProfileFieldDisplay } from '@/portal/profile/ProfileFieldDisplay';
import { ProfileSection } from '@/portal/profile/ProfileSection';
import { CorrectionRequestModal } from '@/portal/profile/CorrectionRequestModal';
import { Badge } from '@/components/ui/badge';

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

  const entityType = isDependente ? 'dependent' : 'associate';
  const alvo = isDependente ? dependenteLogado : associado;
  const { data: settings, isLoading: loadingSettings } = useProfileSettings(entityType);

  // States for Editing
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [email, setEmail] = useState(alvo?.email || '');
  const [telefone, setTelefone] = useState(alvo?.telefone || '');
  const [cep, setCep] = useState(('cep_residencia' in alvo ? (alvo as any).cep_residencia : '') || '');
  const [endereco, setEndereco] = useState(alvo?.endereco || '');
  const [numero, setNumero] = useState(('numero_residencia' in alvo ? (alvo as any).numero_residencia : '') || '');
  const [complemento, setComplemento] = useState(('complemento_residencia' in alvo ? (alvo as any).complemento_residencia : '') || '');
  const [bairro, setBairro] = useState(('bairro_residencia' in alvo ? (alvo as any).bairro_residencia : '') || '');
  const [cidade, setCidade] = useState(('cidade_residencia' in alvo ? (alvo as any).cidade_residencia : '') || '');
  const [estado, setEstado] = useState(('estado_residencia' in alvo ? (alvo as any).estado_residencia : '') || '');

  // Correction Modal State
  const [correctionModal, setCorrectionModal] = useState<{
    isOpen: boolean;
    fieldKey: string;
    fieldName: string;
    currentValue: string;
  }>({
    isOpen: false,
    fieldKey: '',
    fieldName: '',
    currentValue: ''
  });

  const [saving, setSaving] = useState(false);
  const [acessos, setAcessos] = useState<AcessoRegistro[]>([]);
  const [loadingAcessos, setLoadingAcessos] = useState(true);

  useEffect(() => {
    if (!alvo) return;
    setEmail(alvo.email || '');
    setTelefone(alvo.telefone || '');
    setCep(('cep_residencia' in alvo ? (alvo as any).cep_residencia : '') || '');
    setEndereco(alvo.endereco || '');
    setNumero(('numero_residencia' in alvo ? (alvo as any).numero_residencia : '') || '');
    setComplemento(('complemento_residencia' in alvo ? (alvo as any).complemento_residencia : '') || '');
    setBairro(('bairro_residencia' in alvo ? (alvo as any).bairro_residencia : '') || '');
    setCidade(('cidade_residencia' in alvo ? (alvo as any).cidade_residencia : '') || '');
    setEstado(('estado_residencia' in alvo ? (alvo as any).estado_residencia : '') || '');
  }, [alvo]);

  useEffect(() => {
    (async () => {
      if (!alvo) return;
      setLoadingAcessos(true);
      const { itens } = await portalCall<{ itens: AcessoRegistro[] }>('acessos').catch(() => ({ itens: [] }));
      setAcessos((itens || []).slice(0, 5));
      setLoadingAcessos(false);
    })();
  }, [alvo?.id]);

  if (!alvo || !associado) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          Carregando perfil...
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

  const handleSave = async (section: 'contact' | 'address') => {
    setSaving(true);
    try {
      const idEnvio = isDependente ? dependenteLogado!.id : associado.id;
      const campos = section === 'contact' 
        ? { email: email.trim(), telefone: telefone.trim() }
        : { 
            endereco: endereco.trim(),
            cep_residencia: cep.trim(),
            numero_residencia: numero.trim(),
            complemento_residencia: complemento.trim(),
            bairro_residencia: bairro.trim(),
            cidade_residencia: cidade.trim(),
            estado_residencia: estado.trim(),
          };

      const { data, error } = await supabase.functions.invoke('update-perfil', {
        body: {
          tipo: isDependente ? 'dependente' : 'associado',
          id: idEnvio,
          matricula_titular: associado.matricula,
          cpf: isDependente ? dependenteLogado?.cpf : associado.cpf,
          campos,
        },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Falha ao salvar');

      // Update local state
      const updateData = (prev: any) => ({ ...prev, ...campos });
      if (isDependente && dependenteLogado) {
        setDependenteLogado(updateData(dependenteLogado));
        setDependentes(dependentes.map(d => d.id === dependenteLogado.id ? updateData(d) : d));
      } else {
        setAssociado(updateData(associado));
      }

      toast.success('Perfil atualizado com sucesso!');
      if (section === 'contact') setIsEditingContact(false);
      else setIsEditingAddress(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (fieldKey: string): any => {
    return (alvo as any).sync_status || 'updated';
  };

  const openCorrection = (key: string, name: string, val: any) => {
    setCorrectionModal({
      isOpen: true,
      fieldKey: key,
      fieldName: name,
      currentValue: String(val || '')
    });
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <CorrectionRequestModal 
        {...correctionModal} 
        onClose={() => setCorrectionModal(prev => ({ ...prev, isOpen: false }))} 
      />

      {/* Header / Resumo */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-xl border shadow-sm">
        <ProfilePhotoUpload
          currentPhotoUrl={alvo.foto_url}
          userId={alvo.id}
          userType={isDependente ? 'dependente' : 'associado'}
          userName={alvo.nome}
          size="lg"
          onPhotoUpdated={handlePhotoUpdated}
        />
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold">{alvo.nome}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {!isDependente && (
              <>
                <Badge variant="outline">{associado.matricula}</Badge>
                <Badge variant="secondary">{associado.patente || 'Sem Patente'}</Badge>
                <Badge className={associado.status === 'Regular' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {associado.status}
                </Badge>
              </>
            )}
            {isDependente && (
              <Badge variant="outline">Dependente de {associado.nome}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
             <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="functional">Funcional</TabsTrigger>
          <TabsTrigger value="contact">Contato/Endereço</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileSection title="Informações Essenciais">
              <div className="space-y-4">
                 <ProfileFieldDisplay 
                    label="Nome Completo" 
                    value={alvo.nome} 
                    onCorrectionRequest={() => openCorrection('nome', 'Nome Completo', alvo.nome)}
                 />
                 <ProfileFieldDisplay 
                    label="CPF" 
                    value={maskCPF(alvo.cpf || '')} 
                    onCorrectionRequest={() => openCorrection('cpf', 'CPF', alvo.cpf)}
                 />
                 {!isDependente && (
                   <>
                    <ProfileFieldDisplay label="Matrícula" value={associado.matricula} />
                    <ProfileFieldDisplay label="Graduação/Patente" value={associado.patente} />
                   </>
                 )}
              </div>
            </ProfileSection>

            <ProfileSection title="Acessos Recentes">
               {loadingAcessos ? (
                 <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
               ) : (
                 <div className="space-y-3">
                   {acessos.map(acesso => (
                     <div key={acesso.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded border-l-2 border-primary">
                        <div className="flex flex-col">
                           <span className="font-medium text-xs text-muted-foreground">{acesso.metodo_login || 'Portal'}</span>
                           <span>{new Date(acesso.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        <Badge variant={acesso.sucesso ? 'default' : 'destructive'} className="text-[10px]">
                          {acesso.sucesso ? 'Sucesso' : 'Falhou'}
                        </Badge>
                     </div>
                   ))}
                   {acessos.length === 0 && <p className="text-center text-muted-foreground text-sm">Nenhum acesso registrado.</p>}
                 </div>
               )}
            </ProfileSection>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <ProfileSection title="Dados Pessoais" description="Dados sincronizados com a fonte oficial CAMS">
            <div className="grid md:grid-cols-2 gap-4">
              <ProfileFieldDisplay label="Nome Completo" value={alvo.nome} />
              <ProfileFieldDisplay label="CPF" value={maskCPF(alvo.cpf || '')} />
              <ProfileFieldDisplay label="RG" value={(alvo as any).rg_civil} onCorrectionRequest={() => openCorrection('rg_civil', 'RG', (alvo as any).rg_civil)} />
              <ProfileFieldDisplay label="Data de Nascimento" value={alvo.data_nascimento} onCorrectionRequest={() => openCorrection('data_nascimento', 'Data de Nascimento', alvo.data_nascimento)} />
              <ProfileFieldDisplay label="Estado Civil" value={(alvo as any).estado_civil} onCorrectionRequest={() => openCorrection('estado_civil', 'Estado Civil', (alvo as any).estado_civil)} />
              <ProfileFieldDisplay label="Sexo" value={(alvo as any).sexo} />
            </div>
          </ProfileSection>
        </TabsContent>

        <TabsContent value="functional" className="space-y-6">
          <ProfileSection title="Dados Funcionais">
             {!isDependente ? (
               <div className="grid md:grid-cols-2 gap-4">
                  <ProfileFieldDisplay label="Matrícula" value={associado.matricula} />
                  <ProfileFieldDisplay label="Situação Funcional" value={(associado as any).situacao_funcional} />
                  <ProfileFieldDisplay label="Data de Admissão" value={associado.data_admissao} />
                  <ProfileFieldDisplay label="Posto / Graduação" value={associado.patente} onCorrectionRequest={() => openCorrection('posto_graduacao_id', 'Posto/Graduação', associado.patente)} />
                  
                  {((associado as any).situacao_funcional === 'ativo' || (associado as any).situacao_funcional === 'servico_ativo') && (
                    <div className="md:col-span-2 space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Shield className="h-5 w-5 text-primary" />
                           <span className="font-semibold">Unidade Operacional</span>
                         </div>
                         <Button variant="outline" size="sm" className="h-8">Alterar Unidade</Button>
                      </div>
                      <p className="text-sm">Sua lotação atual é registrada como: <strong>{ (associado as any).unidade_id || 'Não informada' }</strong></p>
                    </div>
                  )}
               </div>
             ) : (
               <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  <p>Dados funcionais são aplicáveis apenas ao associado titular.</p>
               </div>
             )}
          </ProfileSection>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <ProfileSection 
            title="Informações de Contato" 
            isEditable 
            isEditing={isEditingContact}
            onEditToggle={() => setIsEditingContact(true)}
            onCancel={() => setIsEditingContact(false)}
            onSave={() => handleSave('contact')}
            loading={saving}
          >
            {isEditingContact ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp / Telefone</Label>
                  <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <ProfileFieldDisplay label="E-mail" value={alvo.email} isLocked={false} />
                <ProfileFieldDisplay label="WhatsApp / Telefone" value={alvo.telefone} isLocked={false} />
              </div>
            )}
          </ProfileSection>

          <ProfileSection 
            title="Endereço de Residência" 
            isEditable 
            isEditing={isEditingAddress}
            onEditToggle={() => setIsEditingAddress(true)}
            onCancel={() => setIsEditingAddress(false)}
            onSave={() => handleSave('address')}
            loading={saving}
          >
            {isEditingAddress ? (
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input value={cep} onChange={(e) => setCep(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>UF</Label>
                      <Input value={estado} onChange={(e) => setEstado(e.target.value)} />
                    </div>
                  </div>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <ProfileFieldDisplay label="CEP" value={cep} isLocked={false} />
                <ProfileFieldDisplay label="Logradouro" value={endereco} isLocked={false} />
                <ProfileFieldDisplay label="Número" value={numero} isLocked={false} />
                <ProfileFieldDisplay label="Bairro" value={bairro} isLocked={false} />
                <ProfileFieldDisplay label="Cidade" value={cidade} isLocked={false} />
                <ProfileFieldDisplay label="Estado" value={estado} isLocked={false} />
              </div>
            )}
          </ProfileSection>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" /> Assinatura digital
              </CardTitle>
              <CardDescription>Aparecerá na sua carteirinha digital.</CardDescription>
            </CardHeader>
            <CardContent>
              <SignaturePad
                currentSignatureUrl={alvo.assinatura_url}
                userId={alvo.id}
                userType={isDependente ? 'dependente' : 'associado'}
                onSaved={(url) => {
                   if (isDependente && dependenteLogado) setDependenteLogado({...dependenteLogado, assinatura_url: url});
                   else setAssociado({ ...associado, assinatura_url: url });
                }}
              />
            </CardContent>
          </Card>
          
          <ProfileSection title="Documentos Enviados" description="Histórico de documentos anexados ao portal">
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <FileText className="h-10 w-10 mb-4 opacity-20" />
                <p>Nenhum documento encontrado.</p>
             </div>
          </ProfileSection>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notificações push
              </CardTitle>
              <CardDescription>Receba avisos importantes da SBPM diretamente neste dispositivo.</CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationToggle
                associadoId={isDependente ? null : associado.id}
                dependenteId={isDependente && dependenteLogado ? dependenteLogado.id : null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
