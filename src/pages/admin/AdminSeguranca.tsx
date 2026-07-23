import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Loader2, KeyRound, Trash2 } from "lucide-react";

type Factor = { id: string; friendly_name?: string | null; status: string; factor_type: string };

export default function AdminSeguranca() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []) as Factor[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const verifiedFactor = factors.find((f) => f.status === "verified");

  const startEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `SBPM Admin ${new Date().toLocaleDateString("pt-BR")}`,
      });
      if (error) throw error;
      setEnrollData({
        factorId: data.id,
        qr: (data as any).totp?.qr_code || "",
        secret: (data as any).totp?.secret || "",
      });
    } catch (err: any) {
      toast.error(err.message || "Falha ao iniciar cadastro do 2FA");
    } finally {
      setEnrolling(false);
    }
  };

  const verify = async () => {
    if (!enrollData) return;
    setVerifying(true);
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });
      if (chErr) throw chErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (vErr) throw vErr;
      toast.success("2FA ativado com sucesso!");
      setEnrollData(null);
      setCode("");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Código inválido. Tente novamente.");
    } finally {
      setVerifying(false);
    }
  };

  const cancelEnroll = async () => {
    if (enrollData) {
      try { await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId }); } catch {}
    }
    setEnrollData(null);
    setCode("");
  };

  const removeFactor = async (factorId: string) => {
    if (!confirm("Remover a autenticação em dois fatores? Você poderá cadastrar novamente depois.")) return;
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("2FA removido.");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Falha ao remover 2FA");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Segurança da conta
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ative a verificação em duas etapas (2FA) para proteger o acesso administrativo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5" />
            Autenticação em dois fatores (TOTP)
          </CardTitle>
          <CardDescription>
            Use um aplicativo autenticador como Google Authenticator, Microsoft Authenticator, Authy ou 1Password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : verifiedFactor ? (
            <div className="space-y-3">
              <Alert>
                <ShieldCheck className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <span>2FA está <strong>ativo</strong> nesta conta.</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </AlertDescription>
              </Alert>
              <Button variant="destructive" size="sm" onClick={() => removeFactor(verifiedFactor.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Remover 2FA
              </Button>
            </div>
          ) : enrollData ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="text-sm space-y-2">
                  <p><strong>1.</strong> Escaneie o QR Code abaixo no seu aplicativo autenticador.</p>
                  <p><strong>2.</strong> Ou digite manualmente o código secreto.</p>
                  <p><strong>3.</strong> Informe o código de 6 dígitos gerado para concluir.</p>
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {enrollData.qr && (
                  <div className="p-3 bg-white rounded border">
                    <img src={enrollData.qr} alt="QR Code para configurar 2FA" className="w-48 h-48" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="text-xs">Código secreto</Label>
                    <Input value={enrollData.secret} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} className="font-mono text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="totp-code">Código de verificação (6 dígitos)</Label>
                    <Input
                      id="totp-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={verify} disabled={verifying || code.length !== 6}>
                      {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      Ativar 2FA
                    </Button>
                    <Button variant="outline" onClick={cancelEnroll} disabled={verifying}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert variant="destructive">
                <ShieldAlert className="w-4 h-4" />
                <AlertDescription>
                  <strong>2FA desativado.</strong> Recomendamos fortemente ativar a verificação em duas etapas.
                </AlertDescription>
              </Alert>
              <Button onClick={startEnroll} disabled={enrolling}>
                {enrolling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Ativar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
