import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import sbpmLogo from "@/assets/sbpm-logo.png";
import AuthBackgroundLayout from "@/components/AuthBackgroundLayout";


export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) checkAdmin(data.session.user.id);
    });
  }, []);

  const checkAdmin = async (userId: string) => {
    const [{ data: role }, { data: prev }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("previdencia_admins").select("user_id").eq("user_id", userId).maybeSingle(),
    ]);
    if (role || prev) navigate("/admin");
  };

  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const finalizeAdminCheck = async (userId: string) => {
    const [{ data: role }, { data: prev }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("previdencia_admins").select("user_id").eq("user_id", userId).maybeSingle(),
    ]);
    if (!role && !prev) {
      await supabase.auth.signOut();
      throw new Error("Este usuário não tem permissão de administrador.");
    }
    toast.success("Bem-vindo!");
    navigate("/admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada. Um administrador precisa liberar seu acesso.");
        if (data.user && email.toLowerCase() !== "previdencia@sbpmbahia.com.br") {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" as const });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Verifica se o usuário precisa completar 2FA
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totp = factors?.totp?.find((f) => f.status === "verified");
          if (totp) {
            const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
            if (chErr) throw chErr;
            setMfaFactorId(totp.id);
            setMfaChallengeId(ch.id);
            toast.info("Informe o código do seu app autenticador.");
            setLoading(false);
            return;
          }
        }

        await finalizeAdminCheck(data.user.id);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const submitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !mfaChallengeId) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode.trim(),
      });
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      if (u.user) await finalizeAdminCheck(u.user.id);
    } catch (err: any) {
      toast.error(err.message ?? "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackgroundLayout align="center">
      <Card className="auth-card w-full max-w-md">

        <CardHeader className="text-center">
          <img
            src={sbpmLogo}
            alt="SBPM - Sociedade Beneficente da Polícia Militar"
            className="mx-auto h-24 w-auto object-contain mix-blend-multiply mb-2"
          />
          <CardTitle>Painel Administrativo SBPM</CardTitle>
          <CardDescription>
            {mode === "login" ? "Acesse com seu e-mail e senha" : "Criar nova conta administrativa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaChallengeId ? (
            <form onSubmit={submitMfa} className="space-y-4">
              <div>
                <Label htmlFor="mfa">Código do autenticador</Label>
                <Input
                  id="mfa"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
                {loading ? "Verificando..." : "Verificar código"}
              </Button>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMfaChallengeId(null);
                  setMfaFactorId(null);
                  setMfaCode("");
                }}
                className="w-full text-sm text-muted-foreground hover:text-primary"
              >
                Cancelar e voltar
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="w-full text-sm text-muted-foreground hover:text-primary"
              >
                {mode === "login" ? "Criar nova conta administrativa" : "Já tenho conta"}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthBackgroundLayout>

  );
}
