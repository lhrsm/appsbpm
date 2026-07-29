import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PermAcao } from "@/lib/permissoes";

type Perfil = {
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: number;
  interno: boolean;
  gerencia_usuarios: boolean;
  somente_leitura: boolean;
};

type Regra = { modulo: string; pagina: string; acao: string; concedido: boolean };

type Ctx = {
  loading: boolean;
  userId: string | null;
  perfil: Perfil | null;
  perfilCodigo: string | null;
  regras: Regra[];
  pode: (modulo: string, acao: PermAcao, pagina?: string) => boolean;
  podeGerenciarUsuarios: boolean;
  recarregar: () => Promise<void>;
};

const PermissoesContext = createContext<Ctx>({
  loading: true,
  userId: null,
  perfil: null,
  perfilCodigo: null,
  regras: [],
  pode: () => false,
  podeGerenciarUsuarios: false,
  recarregar: async () => {},
});

export const usePermissoes = () => useContext(PermissoesContext);

export function PermissoesProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [regras, setRegras] = useState<Regra[]>([]);

  const carregar = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setPerfil(null);
      setRegras([]);
      setLoading(false);
      return;
    }

    const { data: codigo } = await supabase.rpc("perfil_ativo", { _user_id: uid });
    if (!codigo) {
      setPerfil(null);
      setRegras([]);
      setLoading(false);
      return;
    }

    const [perfilRes, perfilPermRes, userPermRes] = await Promise.all([
      supabase.from("perfis").select("*").eq("codigo", codigo).maybeSingle(),
      supabase.from("perfil_permissoes").select("modulo,pagina,acao").eq("perfil_codigo", codigo),
      supabase.from("usuario_permissoes").select("modulo,pagina,acao,concedido").eq("user_id", uid),
    ]);

    setPerfil((perfilRes.data as Perfil) ?? null);
    setRegras([
      ...((perfilPermRes.data ?? []).map((r) => ({ ...r, concedido: true })) as Regra[]),
      ...((userPermRes.data ?? []) as Regra[]),
    ]);
    setLoading(false);

    // Registra o último acesso do usuário interno (validado no banco)
    void supabase.rpc("registrar_acesso_interno");
  }, []);

  useEffect(() => {
    void carregar();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void carregar();
    });
    return () => sub.subscription.unsubscribe();
  }, [carregar]);

  const pode = useCallback(
    (modulo: string, acao: PermAcao, pagina = "*") => {
      const override = regras.find(
        (r) => r.modulo === modulo && r.acao === acao && (r.pagina === pagina || r.pagina === "*") && r.concedido === false,
      );
      if (override) return false;
      return regras.some(
        (r) =>
          r.concedido &&
          (r.modulo === modulo || r.modulo === "*") &&
          r.acao === acao &&
          (r.pagina === pagina || r.pagina === "*"),
      );
    },
    [regras],
  );

  const value = useMemo<Ctx>(
    () => ({
      loading,
      userId,
      perfil,
      perfilCodigo: perfil?.codigo ?? null,
      regras,
      pode,
      podeGerenciarUsuarios: !!perfil?.gerencia_usuarios,
      recarregar: carregar,
    }),
    [loading, userId, perfil, regras, pode, carregar],
  );

  return <PermissoesContext.Provider value={value}>{children}</PermissoesContext.Provider>;
}
