import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn, Info } from "lucide-react";

/**
 * Modo Quiosque — terminal na sede da SBPM.
 * - Login rápido por matrícula.
 * - Auto-logout após 60s de inatividade.
 * - Limpa toda storage ao sair.
 */
const IDLE_MS = 60_000;

export default function Quiosque() {
  const navigate = useNavigate();
  const [mat, setMat] = useState("");
  const [loading, setLoading] = useState(false);
  const idleRef = useRef<number | null>(null);

  const resetIdle = () => {
    if (idleRef.current) window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(async () => {
      try { await supabase.auth.signOut(); } catch { /* noop */ }
      localStorage.clear();
      sessionStorage.clear();
      setMat("");
      toast.info("Sessão encerrada por inatividade");
    }, IDLE_MS);
  };

  useEffect(() => {
    resetIdle();
    const evs = ["mousemove", "keydown", "touchstart", "click"];
    evs.forEach((e) => window.addEventListener(e, resetIdle));
    return () => {
      evs.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleRef.current) window.clearTimeout(idleRef.current);
    };
  }, []);

  const entrar = async () => {
    const v = mat.replace(/\D/g, "");
    if (!v) return toast.error("Digite a matrícula");
    setLoading(true);
    const { data } = await supabase.from("associados").select("id, matricula").eq("matricula", v).maybeSingle();
    setLoading(false);
    if (!data) return toast.error("Matrícula não localizada");
    sessionStorage.setItem("kiosk_associado", data.id);
    navigate("/dashboard/carteirinha");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Terminal SBPM</CardTitle>
          <p className="text-sm text-muted-foreground">Modo quiosque — acesso rápido</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            autoFocus
            inputMode="numeric"
            placeholder="Sua matrícula"
            value={mat}
            onChange={(e) => setMat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
            className="text-center text-2xl h-14 tracking-widest"
          />
          <Button className="w-full h-12 text-base" onClick={entrar} disabled={loading}>
            <LogIn className="w-5 h-5 mr-2" /> Entrar
          </Button>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Sua sessão será encerrada automaticamente após 60 segundos de inatividade para proteger seus dados.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
