import type { LucideIcon } from "@/design-system/icons";
import type { BadgeTone } from "@/design-system/components/Badge";
import type { PortalProfile } from "@/portal/navigation";

/** Estado de uma seção que carrega dados de forma isolada. */
export interface SectionState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export interface DashboardUser {
  nome: string;
  fotoUrl?: string | null;
  matricula?: string | null;
  titularNome?: string | null;
  vinculoAtivo?: boolean;
  associadoDesde?: string | null;
  parentesco?: string | null;
  atualizadoEm?: string | null;
  tipoMilitar?: string | null;
}

export interface SummaryItem {
  id: string;
  icon: LucideIcon;
  title: string;
  value: string | number | null;
  context?: string;
  status?: { label: string; tone?: BadgeTone };
  route?: string;
  actionLabel?: string;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
}

export interface QuickAction {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  route: string;
  badge?: number;
  profiles: PortalProfile[];
}

export interface ServiceItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  status?: { label: string; tone?: BadgeTone };
  profiles: PortalProfile[];
}

export type PendingPriority = "critica" | "pendente" | "informativa";

export interface PendingItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  date?: string | null;
  priority: PendingPriority;
  statusLabel?: string;
  route?: string;
  actionLabel?: string;
}

export interface RelatedPerson {
  id: string;
  nome: string;
  parentesco?: string | null;
  ativo?: boolean;
  fotoUrl?: string | null;
}

export interface SupportChannel {
  id: string;
  setor: string;
  horario: string;
  canal: string;
  href: string;
  icon: LucideIcon;
}

export type SyncStatus =
  | "atualizado"
  | "aguardando"
  | "processando"
  | "divergencia"
  | "indisponivel"
  | "demonstracao";

export interface ProfileStatusData {
  cadastroAtualizado: boolean;
  emailConfirmado: boolean;
  telefoneConfirmado: boolean;
  doisFatoresAtivo: boolean;
  ultimaRevisao?: string | null;
  origem: string;
  ultimaSincronizacao?: string | null;
  pendencias: string[];
}
