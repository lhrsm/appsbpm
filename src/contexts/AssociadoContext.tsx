import { createContext, useContext, useState, ReactNode } from 'react';

export interface Dependente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  tipo: 'conjuge' | 'filho' | 'pai_mae' | 'outro';
  foto_url: string | null;
  ativo: boolean;
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
  data_admissao: string;
  ativo: boolean;
}

interface AssociadoContextType {
  associado: Associado | null;
  dependentes: Dependente[];
  limite: Limite | null;
  historicoLimite: HistoricoLimite[];
  carencias: Carencia[];
  informes: InformeRendimento[];
  setAssociado: (associado: Associado | null) => void;
  setDependentes: (dependentes: Dependente[]) => void;
  setLimite: (limite: Limite | null) => void;
  setHistoricoLimite: (historico: HistoricoLimite[]) => void;
  setCarencias: (carencias: Carencia[]) => void;
  setInformes: (informes: InformeRendimento[]) => void;
  logout: () => void;
}

const AssociadoContext = createContext<AssociadoContextType | undefined>(undefined);

export function AssociadoProvider({ children }: { children: ReactNode }) {
  const [associado, setAssociado] = useState<Associado | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [limite, setLimite] = useState<Limite | null>(null);
  const [historicoLimite, setHistoricoLimite] = useState<HistoricoLimite[]>([]);
  const [carencias, setCarencias] = useState<Carencia[]>([]);
  const [informes, setInformes] = useState<InformeRendimento[]>([]);

  const logout = () => {
    setAssociado(null);
    setDependentes([]);
    setLimite(null);
    setHistoricoLimite([]);
    setCarencias([]);
    setInformes([]);
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
        setAssociado,
        setDependentes,
        setLimite,
        setHistoricoLimite,
        setCarencias,
        setInformes,
        logout,
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
