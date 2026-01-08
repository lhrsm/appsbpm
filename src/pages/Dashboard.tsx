import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Building2, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';

const menuItems = [
  { path: '/dashboard/carteirinha', label: 'Carteirinha', icon: CreditCard },
  { path: '/dashboard/limite', label: 'Limite Disponível', icon: DollarSign },
  { path: '/dashboard/carencias', label: 'Carências', icon: Clock },
  { path: '/dashboard/clinicas', label: 'Clínicas e Parceiros', icon: Building2 },
  { path: '/dashboard/informes', label: 'Informe de Rendimentos', icon: FileText },
  { path: '/dashboard/dependentes', label: 'Dependentes', icon: Users },
];

export default function Dashboard() {
  const { associado, logout } = useAssociado();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!associado) {
      navigate('/');
    }
  }, [associado, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!associado) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={sbpmLogo}
              alt="SBPM"
              className="h-10 w-10 rounded-full object-cover bg-white p-0.5"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">Portal do Associado</h1>
              <p className="text-xs opacity-90">
                Olá, {associado.nome.split(' ')[0]} | Mat: {associado.matricula}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex text-primary-foreground hover:bg-primary/80"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-64 min-h-[calc(100vh-64px)] bg-card border-r shadow-sm">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </Button>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 h-full w-64 bg-card shadow-xl pt-16 animate-fade-in">
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 mt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </Button>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {location.pathname === '/dashboard' ? (
            <DashboardHome />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardHome() {
  const { associado, limite } = useAssociado();
  
  const limiteDisponivel = limite 
    ? Number(limite.limite_total) - Number(limite.limite_utilizado)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Bem-vindo, {associado?.nome.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">
          Acesse suas informações através do menu ao lado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/dashboard/carteirinha"
          className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <CreditCard className="h-10 w-10 text-primary mb-3" />
          <h3 className="font-semibold text-lg">Carteirinha Digital</h3>
          <p className="text-muted-foreground text-sm">
            Visualize e baixe sua carteirinha
          </p>
        </Link>

        <Link
          to="/dashboard/limite"
          className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <DollarSign className="h-10 w-10 text-primary mb-3" />
          <h3 className="font-semibold text-lg">Limite Disponível</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {limiteDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </Link>

        <Link
          to="/dashboard/clinicas"
          className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
          <Building2 className="h-10 w-10 text-primary mb-3" />
          <h3 className="font-semibold text-lg">Clínicas e Parceiros</h3>
          <p className="text-muted-foreground text-sm">
            Encontre clínicas conveniadas
          </p>
        </Link>
      </div>
    </div>
  );
}
