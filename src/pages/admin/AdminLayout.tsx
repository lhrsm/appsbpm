import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LogOut, Users, UserPlus, Wallet, Clock, Building2, FileText, LayoutDashboard, Zap, Plug, RefreshCw, Settings, Cake, Megaphone, Upload, ShieldCheck, HeartHandshake, KeyRound, Bell, Ticket, FolderOpen, DollarSign, Search, Calendar, HelpCircle, Star, BarChart3, TrendingUp, Palette, FileSignature, Menu, Info } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import AdminNotificationsBell from "@/components/AdminNotificationsBell";
import { PermissoesProvider, usePermissoes } from "@/hooks/usePermissoes";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { rotaParaModulo } from "@/lib/permissoes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Visão Geral", end: true },
  { to: "/admin/previdencia", icon: ShieldCheck, label: "Previdência" },
  { to: "/admin/saude", icon: HeartHandshake, label: "Assistência à Saúde" },
  { to: "/admin/financeiro", icon: DollarSign, label: "Financeiro" },
  { to: "/admin/patrimonio", icon: Building2, label: "Patrimônio" },
  { to: "/admin/contabilidade", icon: FileSignature, label: "Contabilidade" },
  { to: "/admin/rh", icon: UserPlus, label: "Recursos Humanos" },
  { to: "/admin/associados", icon: Users, label: "Associados" },
  { to: "/admin/dependentes", icon: UserPlus, label: "Dependentes" },
  { to: "/admin/integracoes", icon: Plug, label: "Integrações" },
  { to: "/admin/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/admin/auditoria", icon: ShieldCheck, label: "Auditoria" },
  { to: "/admin/usuarios", icon: KeyRound, label: "Usuários e Permissões" },
  { to: "/admin/configuracoes", icon: Settings, label: "Configurações" },
  { to: "/admin/tutoriais", icon: BookOpen, label: "Tutoriais e Ajuda" },
  { to: "/admin/sobre", icon: Info, label: "Sobre o Portal" },
];

const navOperacional = [
  { to: "/admin/painel", icon: TrendingUp, label: "Painel analítico" },
  { to: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { to: "/admin/comunicados", icon: Megaphone, label: "Comunicados" },
  { to: "/admin/eventos", icon: Calendar, label: "Eventos" },
  { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { to: "/admin/avaliacoes", icon: Star, label: "Avaliações" },
  { to: "/admin/notificacoes", icon: Bell, label: "Notificações Push" },
  { to: "/admin/solicitacoes", icon: Ticket, label: "Solicitações" },
  { to: "/admin/documentos", icon: FolderOpen, label: "Documentos" },
  { to: "/admin/limites", icon: Wallet, label: "Limites" },
  { to: "/admin/carencias", icon: Clock, label: "Carências" },
  { to: "/admin/clinicas", icon: Building2, label: "Clínicas & Parceiros" },
  { to: "/admin/informes", icon: FileText, label: "Informes" },
  { to: "/admin/peculio", icon: HeartHandshake, label: "Pecúlio" },
  { to: "/admin/importar", icon: Upload, label: "Importações" },
  { to: "/admin/sincronizacao", icon: RefreshCw, label: "Sincronização" },
  { to: "/admin/automacoes", icon: Zap, label: "Automações" },
  { to: "/admin/privacidade", icon: ShieldCheck, label: "Privacidade (LGPD)" },
  { to: "/admin/seguranca", icon: KeyRound, label: "Segurança (2FA)" },
  { to: "/admin/assinatura-icp", icon: FileSignature, label: "Assinatura ICP-Brasil" },
  { to: "/admin/componentes", icon: Palette, label: "Componentes (UI)" },
];

function AdminLayoutInner() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading: permsLoading, perfil, pode } = usePermissoes();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate("/admin/login");
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) navigate("/admin/login");
    });
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("keydown", onKey);
    };
  }, [navigate]);

  // Perfil interno é obrigatório para permanecer na área administrativa
  useEffect(() => {
    if (permsLoading) return;
    if (!perfil || !perfil.interno) {
      supabase.auth.signOut().then(() => navigate("/admin/login"));
    }
  }, [permsLoading, perfil, navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/admin/login");
  };

  if (!ready || permsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const permitido = (to: string) => {
    const modulo = rotaParaModulo(to);
    return modulo === "*" ? !!perfil?.interno : pode(modulo, "visualizar");
  };

  const visibleNav = nav.filter((n) => permitido(n.to));
  const visibleOperacional = navOperacional.filter((n) => permitido(n.to));
  const allNav = [...visibleNav, ...visibleOperacional];


  const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-4 border-b flex items-start justify-between gap-2">
        <div>
          <h1 className="font-bold text-lg text-primary">SBPM Admin</h1>
          <p className="text-xs text-muted-foreground">Painel de gestão</p>
        </div>
        <div className="flex items-center gap-1">
          <AdminNotificationsBell />
          <ThemeToggle />
        </div>
      </div>
      <div className="px-3 pt-3">
        <button
          onClick={() => { setSearchOpen(true); onNavigate?.(); }}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-md bg-muted hover:bg-muted/70 text-sm text-muted-foreground transition"
          aria-label="Buscar (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] font-mono border rounded px-1.5 py-0.5">Ctrl K</kbd>
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navegação administrativa">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Institucional
        </p>
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={(item as { end?: boolean }).end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
        {visibleOperacional.length > 0 && (
          <>
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Operacional
            </p>
            {visibleOperacional.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/30 w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r flex-col shrink-0">
        <SidebarInner />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 flex flex-col">
          <SidebarInner onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 h-14 px-3 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-primary">SBPM Admin</span>
          <div className="flex items-center gap-1">
            <AdminNotificationsBell />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <PermissionGuard>
            <Outlet />
          </PermissionGuard>
        </main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Buscar página do admin..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {allNav.map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setSearchOpen(false);
                  navigate(item.to);
                }}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <PermissoesProvider>
      <AdminLayoutInner />
    </PermissoesProvider>
  );
}
