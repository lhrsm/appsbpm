import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearPortalToken, getPortalToken, portalCall } from '@/lib/portal';
import { clearPrivateState } from '@/lib/perf/queryClient';
import { closeAllRealtime } from '@/hooks/useRealtimeChannel';

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
  setAssociado: (associado: Associado | null) => void;
  setDependentes: (dependentes: Dependente[]) => void;
  setLimite: (limite: Limite | null) => void;
  setHistoricoLimite: (historico: HistoricoLimite[]) => void;
  setCarencias: (carencias: Carencia[]) => void;
  setInformes: (informes: InformeRendimento[]) => void;
  setIsDependente: (isDependente: boolean) => void;
  setDependenteLogado: (dependente: Dependente | null) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AssociadoContext = createContext<AssociadoContextType | undefined>(undefined);

export function AssociadoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [associado, setAssociado] = useState<Associado | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [limite, setLimite] = useState<Limite | null>(null);
  const [historicoLimite, setHistoricoLimite] = useState<HistoricoLimite[]>([]);
  const [carencias, setCarencias] = useState<Carencia[]>([]);
  const [informes, setInformes] = useState<InformeRendimento[]>([]);
  const [isDependente, setIsDependente] = useState<boolean>(false);
  const [dependenteLogado, setDependenteLogado] = useState<Dependente | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async (isRepairAttempt = false) => {
    const token = getPortalToken();
    if (!token) {
      setInitializing(false);
      return;
    }

    try {
      console.log(`[PortalIdentity] ${isRepairAttempt ? 'Tentando reparo' : 'Iniciando resolução'} de perfil institucional...`);
      
      // Se for uma tentativa de reparo, chama a função de reparo via RPC antes
      if (isRepairAttempt) {
        setError(null);
        setInitializing(true);
        const { data: repairResult, error: rpcError } = await supabase.rpc('repair_portal_identity');
        
        if (rpcError) {
          console.error("[PortalIdentity] Erro RPC no reparo:", rpcError);
          throw new Error("Falha técnica ao tentar reparar o vínculo.");
        }
        
        if (!repairResult?.success) {
          console.warn("[PortalIdentity] Reparo não obteve sucesso:", repairResult?.reason_code);
          setError(`Não foi possível vincular seu cadastro. Código: ${repairResult?.reason_code || 'UNKNOWN'}`);
          setInitializing(false);
          return;
        }
        console.log("[PortalIdentity] Reparo concluído com sucesso:", repairResult.data);
      }

      const data = await portalCall<any>('perfil');
      
      console.log("[PortalIdentity] Resposta do backend:", {
        associadoEncontrado: !!data?.associado,
        dependenteEncontrado: !!data?.dependente,
        totalDependentes: data?.dependentes?.length || 0,
        status: data?.associado?.status,
        error: data?.error
      });

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
        console.error("[PortalIdentity] Perfil não resolvido após chamada.", data?.error);
        
        // Se falhou e não era uma tentativa de reparo, podemos ter um PROFILE_LINK_MISSING implícito
        if (data?.error?.includes('Cadastro institucional não localizado')) {
          setError('PROFILE_LINK_MISSING');
        } else {
          setError(data?.error || 'Não foi possível carregar seu painel institucional.');
        }
      }
    } catch (err: any) {
      console.error("[PortalIdentity] Erro na resolução:", err);
      if (err?.status === 401) {
        clearPortalToken();
      } else {
        setError(err.message || 'Erro de conexão com o servidor institucional.');
      }
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
