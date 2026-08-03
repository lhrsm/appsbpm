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

    return {
      resolved: row.resolved === true,
      associateId: row.associate_id ?? null,
      dependentId: row.dependent_id ?? null,
      profileType: row.profile_type ?? null,
      associationStatus: row.association_status ?? null,
      linkStatus: row.link_status ?? null,
      accessLevel: row.access_level ?? null,
      reasonCode: row.reason_code ?? null
    };
  };

  const refreshProfile = async (isRepairAttempt: boolean = false) => {
    setInitializing(true);
    setError(null);
    
    try {
      console.log(`[PortalIdentity] ACTIVE PROVIDER FILE: src/contexts/AssociadoContext.tsx`);
      console.log(`[PortalIdentity] ${isRepairAttempt ? 'Iniciando reparo' : 'Resolvendo identidade'} via get_my_portal_identity()...`);
      
      if (isRepairAttempt) {
        const { data: repairResult, error: rpcError } = await supabase.rpc('repair_portal_identity');
        if (rpcError) throw rpcError;
        console.log("[PortalIdentity] Resultado do reparo:", repairResult);
      }

      const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_portal_identity');
      
      if (rpcError) {
        console.error("[PortalIdentity] Erro na RPC de identidade:", rpcError);
        setError('TECHNICAL_ERROR');
        return;
      }

      console.log("RAW RPC DATA", rpcData);
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      console.log("RPC ROW", row);

      const mappedIdentity = mapPortalIdentityResponse(row);
      console.log("MAPPED IDENTITY", mappedIdentity);
      
      console.log("STATE BEFORE SET", identity);
      setIdentity(mappedIdentity);
      console.log("STATE AFTER SET", mappedIdentity);


      if (
        mappedIdentity.resolved && 
        mappedIdentity.associateId && 
        mappedIdentity.reasonCode === 'READY'
      ) {
        // Carrega o perfil completo usando o payload centralizado
        const data = await portalCall<any>('perfil');
        
        if (data?.associado) {
          setAssociado(data.associado);
          setDependentes(data.dependentes || []);
          setLimite(data.limite || null);
          setHistoricoLimite(data.historico || []);
          setInformes(data.informes || []);
          setIsDependente(Boolean(data.dependente));
          setDependenteLogado(data.dependente || null);
          setError(null);
        } else {
          console.error("[PortalIdentity] Falha ao carregar payload do perfil.");
          setError(data?.error || 'Erro ao carregar dados do painel.');
        }
        return;
      }

      // Se não resolveu ou não está READY
      if (!mappedIdentity.resolved) {
        // Invariante institucional: se reasonCode é READY, resolved DEVE ser true
        if (mappedIdentity.reasonCode === 'READY') {
          console.error("[PortalIdentity] Inconsistência Crítica: reasonCode READY mas resolved false", mappedIdentity);
          setError('IDENTITY_INCONSISTENCY');
          return;
        }

        setError('PROFILE_LINK_MISSING');
      } else {
        // Invariante institucional: se resolved é true mas associateId está nulo
        if (!mappedIdentity.associateId) {
          console.error("[PortalIdentity] Inconsistência Crítica: resolved true mas associateId ausente", mappedIdentity);
          setError('ADAPTER_ERROR');
          return;
        }
        
        setError(mappedIdentity.reasonCode || 'ACCESS_DENIED');
      }
    } catch (err: any) {
      console.error("[PortalIdentity] Erro crítico:", err);
      setError(err.message || 'Erro de conexão.');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    refreshProfile();
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
