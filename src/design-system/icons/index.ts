/**
 * Biblioteca única de ícones do portal.
 *
 * REGRA: nunca importar `lucide-react` diretamente em páginas novas.
 * A mesma função deve sempre usar o mesmo ícone em toda a plataforma.
 */
import {
  User,
  Users,
  UserPlus,
  IdCard,
  FileText,
  FolderOpen,
  HeartPulse,
  ShieldCheck,
  Wallet,
  DollarSign,
  Building2,
  FileSignature,
  Briefcase,
  LayoutDashboard,
  Bell,
  Megaphone,
  Calendar,
  HelpCircle,
  Star,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Loader2,
  Info,
  AlertTriangle,
  CircleCheck,
  CircleX,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Printer,
  Inbox,
  BarChart3,
  TrendingUp,
  BookOpen,
  Ticket,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

/** Mapa canônico função → ícone. */
export const icons = {
  // Identidade e pessoas
  perfil: User,
  associados: Users,
  dependentes: UserPlus,
  carteirinha: IdCard,

  // Domínios institucionais
  previdencia: ShieldCheck,
  saude: HeartPulse,
  financeiro: DollarSign,
  patrimonio: Building2,
  contabilidade: FileSignature,
  rh: Briefcase,
  lgpd: Lock,

  // Conteúdo
  documento: FileText,
  pasta: FolderOpen,
  limite: Wallet,
  dashboard: LayoutDashboard,
  relatorio: BarChart3,
  analytics: TrendingUp,
  tutorial: BookOpen,
  solicitacao: Ticket,
  componentes: Palette,

  // Comunicação
  notificacao: Bell,
  comunicado: Megaphone,
  email: Mail,
  telefone: Phone,
  whatsapp: MessageCircle,
  endereco: MapPin,

  // Tempo / agenda
  agenda: Calendar,
  horario: Clock,

  // Ações
  buscar: Search,
  filtrar: Filter,
  adicionar: Plus,
  editar: Pencil,
  excluir: Trash2,
  baixar: Download,
  enviar: Upload,
  atualizar: RefreshCw,
  imprimir: Printer,
  abrirExterno: ExternalLink,
  configuracoes: Settings,
  sair: LogOut,
  menu: Menu,
  fechar: X,
  confirmar: Check,

  // Navegação
  proximo: ChevronRight,
  anterior: ChevronLeft,
  expandir: ChevronDown,
  recolher: ChevronUp,

  // Estados
  carregando: Loader2,
  info: Info,
  alerta: AlertTriangle,
  sucesso: CircleCheck,
  erro: CircleX,
  vazio: Inbox,
  ajuda: HelpCircle,
  avaliacao: Star,

  // Segurança
  senha: KeyRound,
  mostrar: Eye,
  ocultar: EyeOff,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/** Resolve um ícone pelo nome canônico. */
export function getIcon(name: IconName): LucideIcon {
  return icons[name];
}
