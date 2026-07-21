import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Users, UserPlus, Wallet, Clock, Building2, FileText, LayoutDashboard, Zap, Plug, RefreshCw, Settings, Cake, Megaphone, Upload, ShieldCheck, HeartHandshake } from "lucide-react";
import { toast } from "sonner";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "Início", end: true },
  { to: "/admin/associados", icon: Users, label: "Associados" },
  { to: "/admin/dependentes", icon: UserPlus, label: "Dependentes" },
  { to: "/admin/aniversariantes", icon: Cake, label: "Aniversariantes" },
  { to: "/admin/comunicados", icon: Megaphone, label: "Comunicados" },
  { to: "/admin/limites", icon: Wallet, label: "Limites" },
  { to: "/admin/carencias", icon: Clock, label: "Carências" },
  { to: "/admin/clinicas", icon: Building2, label: "Clínicas & Parceiros" },
  { to: "/admin/informes", icon: FileText, label: "Informes" },
  { to: "/admin/peculio", icon: HeartHandshake, label: "Pecúlio" },
  { to: "/admin/importar", icon: Upload, label: "Importar CSV" },
  { to: "/admin/sincronizacao", icon: RefreshCw, label: "Sincronização" },
  { to: "/admin/automacoes", icon: Zap, label: "Automações" },
  { to: "/admin/integracoes", icon: Plug, label: "Integrações" },
  { to: "/admin/auditoria", icon: ShieldCheck, label: "Auditoria" },
  { to: "/admin/configuracoes", icon: Settings, label: "Configurações" },
];

const PREVIDENCIA_ALLOWED = new Set([
  "/admin",
  "/admin/associados",
  "/admin/dependentes",
  "/admin/peculio",
  "/admin/informes",
]);

export default function AdminLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isPrevidencia, setIsPrevidencia] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate("/admin/login");
      const uid = data.session.user.id;
      const [{ data: role }, { data: prev }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
        supabase.from("previdencia_admins").select("user_id").eq("user_id", uid).maybeSingle(),
      ]);
      if (!role && !prev) {
        await supabase.auth.signOut();
        return navigate("/admin/login");
      }
      setIsPrevidencia(!role && !!prev);
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) navigate("/admin/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/admin/login");
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  const visibleNav = isPrevidencia ? nav.filter((n) => PREVIDENCIA_ALLOWED.has(n.to)) : nav;

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg text-primary">SBPM Admin</h1>
          <p className="text-xs text-muted-foreground">Painel de gestão</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
        </nav>
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
