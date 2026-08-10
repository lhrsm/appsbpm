import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AuthCard } from "@/design-system/components";
import { toast } from "sonner";
import sbpmLogo from "@/assets/sbpm-logo.png";
import AuthBackgroundLayout from "@/components/AuthBackgroundLayout";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres.");
    if (password !== confirm) return toast.error("As senhas não conferem.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      navigate("/admin/login");
    } catch (err: any) {
      toast.error(err.message ?? "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackgroundLayout align="center">
      <AuthCard>
        <CardHeader className="text-center">
          <img src={sbpmLogo} alt="SBPM" className="mx-auto h-24 w-auto object-contain mb-2" />
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            {ready
              ? "Escolha uma nova senha de acesso"
              : "Abra esta página pelo link enviado ao seu e-mail para continuar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                disabled={!ready || loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
                disabled={!ready || loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!ready || loading}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="w-full text-sm text-muted-foreground hover:text-primary"
            >
              Voltar ao login
            </button>
          </form>
        </CardContent>
      </AuthCard>
    </AuthBackgroundLayout>
  );
}
