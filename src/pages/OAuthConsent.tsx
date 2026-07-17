import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import sbpmLogo from "@/assets/sbpm-logo.jpeg";

// Local typed wrapper for the beta supabase.auth.oauth namespace so this
// compiles without waiting on the SDK types.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{
    data:
      | {
          client?: { name?: string; client_uri?: string };
          redirect_url?: string;
          redirect_to?: string;
          scopes?: string[];
        }
      | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function getOAuth(): OAuthNs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase.auth as any).oauth as OAuthNs;
}

function isSafeRelativePath(p: string) {
  return p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\");
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<{
    client?: { name?: string; client_uri?: string };
    scopes?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Requisição inválida: authorization_id ausente.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const nextRaw =
          window.location.pathname + window.location.search;
        const next = isSafeRelativePath(nextRaw) ? nextRaw : "/";
        window.location.href = "/?next=" + encodeURIComponent(next);
        return;
      }

      const { data, error } = await getOAuth().getAuthorizationDetails(
        authorizationId
      );
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data ?? {});
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const oauth = getOAuth();
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou uma URL de redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <img
              src={sbpmLogo}
              alt="SBPM"
              className="h-24 w-auto object-contain mix-blend-multiply"
            />
          </div>
          <CardTitle className="text-xl">Autorização de acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !details ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground">
                <span className="font-semibold">
                  {details.client?.name ?? "Um aplicativo"}
                </span>{" "}
                está solicitando acesso à sua conta SBPM para usar as
                ferramentas públicas (lista de parceiros, cidades atendidas e
                canais de atendimento).
              </p>
              <p className="text-xs text-muted-foreground">
                Você pode revogar esse acesso a qualquer momento.
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={busy}
                  onClick={() => decide(true)}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Autorizar"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Negar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
