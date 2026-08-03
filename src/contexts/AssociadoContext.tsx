import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearPortalToken, getPortalToken, portalCall } from '@/lib/portal';
import { clearPrivateState } from '@/lib/perf/queryClient';
import { closeAllRealtime } from '@/hooks/useRealtimeChannel';
import { supabase } from '@/integrations/supabase/client';

export interface Dependente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  tipo: 'conjuge' | 'filho' | 'pai_mae' | 'outro';
  foto_url: string | null;
  assinatura_url?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  status: string;
  cep_residencia?: string | null;
  numero_residencia?: string | null;
  complemento_residencia?: string | null;
  bairro_residencia?: string | null;
  cidade_residencia?: string | null;
  estado_residencia?: string | null;
  utiliza_endereco_titular?: boolean;
}


export interface Limite {
  id: string;
  limite_total: number;
  limite_utilizado: number;
  data_renovacao: string | null;
}

export interface HistoricoLimite {
  id: string;
  valor: number;
  descricao: string | null;
  data_utilizacao: string;
}

export interface Carencia {
  id: string;
  procedimento: string;
  status: 'liberado' | 'em_carencia';
  data_liberacao: string | null;
}

export interface InformeRendimento {
  id: string;
  ano: number;
  arquivo_url: string | null;
}

export interface Associado {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  foto_url: string | null;
  assinatura_url?: string | null;
  data_admissao: string;
  status: string;
  patente?: string | null;
  situacao_funcional?: string | null;
  cep_residencia?: string | null;
  numero_residencia?: string | null;
  complemento_residencia?: string | null;
  bairro_residencia?: string | null;
  cidade_residencia?: string | null;
  estado_residencia?: string | null;
}



export interface PortalIdentity {
  resolved: boolean;
  associateId: string | null;
  dependentId: string | null;
  profileType: 'associate' | 'dependent' | null;
  associationStatus: string | null;
  accessLevel: 'full' | 'read_only' | 'blocked' | 'manual_review' | null;
  linkStatus: string | null;
  reasonCode: string | null;
  debug?: any;
}

interface AssociadoContextType {
  associado: Associado | null;
  dependentes: Dependente[];
  limite: Limite | null;
  historicoLimite: HistoricoLimite[];
  carencias: Carencia[];
  informes: InformeRendimento[];
  isDependente: boolean;
  dependenteLogado: Dependente | null;
  initializing: boolean;
  error: string | null;
  identity: PortalIdentity | null;
  setAssociado: (associado: Associado | null) => void;
  setDependentes: (dependentes: Dependente[]) => void;
  setLimite: (limite: Limite | null) => void;
  setHistoricoLimite: (historico: HistoricoLimite[]) => void;
  setCarencias: (carencias: Carencia[]) => void;
  setInformes: (informes: InformeRendimento[]) => void;
  setIsDependente: (isDependente: boolean) => void;
  setDependenteLogado: (dependente: Dependente | null) => void;
  logout: () => void;
  refreshProfile: (isRepairAttempt?: boolean) => Promise<void>;
}

const AssociadoContext = createContext<AssociadoContextType | undefined>(undefined);

export function AssociadoProvider({ children }: { children: ReactNode }) {
  const PORTAL_IDENTITY_FRONTEND_VERSION = "identity-v3-2026-08-03";
  const queryClient = useQueryClient();
  const [associado, setAssociado] = useState<Associado | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [limite, setLimite] = useState<Limite | null>(null);
  const [historicoLimite, setHistoricoLimite] = useState<HistoricoLimite[]>([]);
  const [carencias, setCarencias] = useState<Carencia[]>([]);
  const [informes, setInformes] = useState<InformeRendimento[]>([]);
  const [isDependente, setIsDependente] = useState<boolean>(false);
  const [dependenteLogado, setDependenteLogado] = useState<Dependente | null>(null);
  const [identity, setIdentity] = useState<PortalIdentity | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.info(
      "Portal Identity Frontend Version:",
      PORTAL_IDENTITY_FRONTEND_VERSION
    );
  }, []);


  const mapPortalIdentityResponse = (row: any): PortalIdentity => {
    if (!row) {
      return {
        resolved: false,
        associateId: null,
        dependentId: null,
        profileType: null,
        associationStatus: null,
        accessLevel: null,
        linkStatus: null,
        reasonCode: 'PROFILE_NOT_FOUND'
      };
    }

    // A RPC agora retorna campos padronizados em snake_case (ou camelCase dependendo do driver, mas o Supabase costuma manter snake_case se não for transformado).
    // Contrato Padronizado: resolved, auth_user_id, link_id, associate_id, dependent_id, profile_type, association_status, link_status, access_level, reason_code
    
    // Suporte a ambos para transição suave, mas priorizando o novo contrato
    const associateId = row.associate_id || row.associado_id || null;
    const associationStatus = row.association_status || row.associado_status || null;
    const profileType = (row.profile_type || row.person_type) as any || null;
    const authUserId = row.auth_user_id || row.auth_id || null;
    const linkStatus = row.link_status || null;
    const accessLevel = (row.access_level as any) || (linkStatus === 'active' ? 'full' : 'blocked');
    const reasonCode = row.reason_code || (associateId ? 'READY' : 'PROFILE_LINK_MISSING');
    const resolved = row.resolved ?? Boolean(associateId && linkStatus === 'active');

    return {
      resolved,
      associateId,
      dependentId: row.dependent_id || row.dependente_id || null,
      profileType,
      associationStatus,
      linkStatus,
      accessLevel,
      reasonCode
    };
  };

  const refreshProfile = async (isRepairAttempt: boolean = false) => {
    console.info("[PortalIdentity] refreshProfile start", { isRepairAttempt });
    setInitializing(true);
    setError(null);
    
    try {
      // 1. Verificar Sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[PortalIdentity] Erro ao obter sessão:", sessionError);
        setError('AUTH_ERROR');
        setInitializing(false);
        return;
      }

      if (!session?.user?.id) {
        console.warn("[PortalIdentity] Sessão não encontrada. Aguardando...");
        setIdentity(null);
        setInitializing(false);
        return;
      }

      console.log("[PortalIdentity] Sessão ativa:", session.user.id);
      
      if (isRepairAttempt) {
        console.log("[PortalIdentity] Executando repair_portal_identity...");
        await supabase.rpc('repair_portal_identity');
      }

      // 2. Chamar RPC Institucional
      console.log("[PortalIdentity] Chamando get_my_portal_identity...");
      const { data, error: rpcError, status, statusText } = await supabase.rpc('get_my_portal_identity');
      
      console.log("IDENTITY RPC STATUS", status, statusText);
      
      if (rpcError) {
        console.error("[PortalIdentity] Erro na RPC:", rpcError);
        setError('RPC_ERROR');
        setInitializing(false); // Garantir que não trava no initializing
        return;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.error("[PortalIdentity] Resposta da RPC vazia.");
        setError('RPC_EMPTY_RESPONSE');
        setInitializing(false); // Garantir que não trava no initializing
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      console.log("IDENTITY RPC ROW", row);
      
      const mappedIdentity = mapPortalIdentityResponse(row);
      console.log("MAPPED IDENTITY", mappedIdentity);
      
      setIdentity(mappedIdentity);

      // 3. Avaliar Acesso
      if (mappedIdentity.resolved && mappedIdentity.associateId && mappedIdentity.reasonCode === 'READY') {
        console.log("[PortalIdentity] Calling portalCall('perfil')...");
        try {
          const payload = await portalCall<any>('perfil');
          console.log("[PortalIdentity] portalCall('perfil') result:", payload);
          
          if (payload?.associado) {
            setAssociado(payload.associado);
            setDependentes(payload.dependentes || []);
            setLimite(payload.limite || null);
            setHistoricoLimite(payload.historico || []);
            setInformes(payload.informes || []);
            setIsDependente(Boolean(payload.dependente));
            setDependenteLogado(payload.dependente || null);
            setError(null);
            console.log("[PortalIdentity] Context updated successfully.");
          } else {
            console.error("[PortalIdentity] portalCall returned no associado:", payload);
            setError(payload?.error || 'Erro ao carregar dados do painel.');
          }
        } catch (callErr: any) {
          console.error("[PortalIdentity] portalCall('perfil') failed:", callErr);
          setError(callErr.message || 'Falha na comunicação com o backend.');
        }
      } else {
        console.warn("[PortalIdentity] Identity not ready:", mappedIdentity.reasonCode);
        setError(mappedIdentity.reasonCode || 'PROFILE_LINK_MISSING');
      }
    } catch (err: any) {
      console.error("[PortalIdentity] Erro crítico:", err);
      setError(err.message || 'Erro de conexão.');
    } finally {
      console.info("[PortalIdentity] refreshProfile finished.");
      setInitializing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkInitialSession = async () => {
      console.log("[PortalIdentity] checkInitialSession...");
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session) {
          console.log("[PortalIdentity] Session found in checkInitialSession:", session.user.id);
          refreshProfile();
        } else {
          console.log("[PortalIdentity] No session found in checkInitialSession.");
          setInitializing(false);
        }
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[PortalIdentity] onAuthStateChange event:", event);
      if (mounted) {
        if (session) {
          console.log("[PortalIdentity] onAuthStateChange session found:", session.user.id);
          refreshProfile();
        } else {
          console.log("[PortalIdentity] onAuthStateChange: clear profile");
          setAssociado(null);
          setIdentity(null);
          setInitializing(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = () => {
    // Encerra sessão, cancela requisições/realtime e limpa todo o cache privado
    // para que nenhum dado do usuário anterior fique visível no dispositivo.
    closeAllRealtime();
    clearPortalToken();
    clearPrivateState(queryClient);
    setAssociado(null);
    setIdentity(null);
    setDependentes([]);
    setLimite(null);
    setHistoricoLimite([]);
    setCarencias([]);
    setInformes([]);
    setIsDependente(false);
    setDependenteLogado(null);
  };

  return (
    <AssociadoContext.Provider
      value={{
        associado,
        dependentes,
        limite,
        historicoLimite,
        carencias,
        informes,
        isDependente,
        dependenteLogado,
        initializing,
        error,
        identity,
        setAssociado,
        setDependentes,
        setLimite,
        setHistoricoLimite,
        setCarencias,
        setInformes,
        setIsDependente,
        setDependenteLogado,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AssociadoContext.Provider>
  );
}

export function useAssociado() {
  const context = useContext(AssociadoContext);
  if (context === undefined) {
    throw new Error('useAssociado must be used within an AssociadoProvider');
  }
  return context;
}
