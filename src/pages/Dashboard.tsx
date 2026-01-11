import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Building2, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X,
  MessageCircle,
  Phone,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Menu completo para titular
const menuItemsTitular = [
  { path: '/dashboard/carteirinha', label: 'Carteirinha', icon: CreditCard },
  { path: '/dashboard/limite', label: 'Limite Disponível', icon: DollarSign },
  { path: '/dashboard/carencias', label: 'Carências', icon: Clock },
  { path: '/dashboard/clinicas', label: 'Clínicas e Parceiros', icon: Building2 },
  { path: '/dashboard/informes', label: 'Informe de Rendimentos', icon: FileText },
  { path: '/dashboard/dependentes', label: 'Dependentes', icon: Users },
];

// Menu restrito para dependentes
const menuItemsDependente = [
  { path: '/dashboard/carteirinha', label: 'Carteirinha', icon: CreditCard },
  { path: '/dashboard/carencias', label: 'Procedimentos', icon: Clock },
  { path: '/dashboard/clinicas', label: 'Clínicas e Parceiros', icon: Building2 },
];

const whatsappContacts = [
  { 
    label: 'Previdência - Tina ou Valéria', 
    number: '5571985496972',
    displayNumber: '(71) 98549-6972',
    color: 'bg-sbpm-green hover:bg-sbpm-green/90'
  },
  { 
    label: 'Assistência à Saúde - Rejane', 
    number: '5571987943414',
    displayNumber: '(71) 98794-3414',
    color: 'bg-sbpm-blue hover:bg-sbpm-blue/90'
  },
  { 
    label: 'Assistência à Saúde - Tânia', 
    number: '5571999234059',
    displayNumber: '(71) 99923-4059',
    color: 'bg-sbpm-blue hover:bg-sbpm-blue/90'
  },
  { 
    label: 'Assistência à Saúde - Fabiane', 
    number: '5571981468013',
    displayNumber: '(71) 98146-8013',
    color: 'bg-sbpm-blue hover:bg-sbpm-blue/90'
  },
  { 
    label: 'Assistência à Saúde - Tiago', 
    number: '5571996340317',
    displayNumber: '(71) 99634-0317',
    color: 'bg-sbpm-blue hover:bg-sbpm-blue/90'
  },
];

export default function Dashboard() {
  const { associado, logout, isDependente, dependenteLogado } = useAssociado();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usar menu apropriado baseado se é dependente ou titular
  const menuItems = isDependente ? menuItemsDependente : menuItemsTitular;

  useEffect(() => {
    if (!associado) {
      navigate('/');
    }
  }, [associado, navigate]);

  // Redirect dependente if trying to access restricted routes
  useEffect(() => {
    if (isDependente) {
      const restrictedPaths = ['/dashboard/limite', '/dashboard/informes', '/dashboard/dependentes'];
      if (restrictedPaths.includes(location.pathname)) {
        navigate('/dashboard/carteirinha');
      }
    }
  }, [isDependente, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!associado) return null;

  // Nome a exibir - do dependente ou do titular
  const nomeExibir = isDependente && dependenteLogado 
    ? dependenteLogado.nome 
    : associado.nome;

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
                Olá, {nomeExibir.split(' ')[0]} | Mat: {associado.matricula}
                {isDependente && <Badge variant="secondary" className="ml-2 text-xs">Dependente</Badge>}
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
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                location.pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Início</span>
            </Link>
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
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    location.pathname === '/dashboard'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Início</span>
                </Link>
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

      {/* WhatsApp Floating Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        {whatsappContacts.map((contact) => (
          <a
            key={contact.number}
            href={`https://wa.me/${contact.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-lg transition-all hover:scale-105',
              contact.color
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">{contact.label}</span>
            <span className="text-xs sm:hidden">{contact.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DashboardHome() {
  const { associado, dependentes, limite, carencias, isDependente, dependenteLogado } = useAssociado();
  
  const limiteDisponivel = limite 
    ? Number(limite.limite_total) - Number(limite.limite_utilizado)
    : 0;

  const limiteTotal = limite ? Number(limite.limite_total) : 0;
  const limiteUtilizado = limite ? Number(limite.limite_utilizado) : 0;
  const percentualUtilizado = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;

  const carenciasLiberadas = carencias.filter(c => c.status === 'liberado').length;
  const carenciasEmEspera = carencias.filter(c => c.status === 'em_carencia').length;

  const tipoLabel: Record<string, string> = {
    conjuge: 'Cônjuge',
    filho: 'Filho(a)',
    pai_mae: 'Pai/Mãe',
    outro: 'Outro',
  };

  // Nome e dados a exibir
  const nomeExibir = isDependente && dependenteLogado 
    ? dependenteLogado.nome 
    : associado?.nome || '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Bem-vindo, {nomeExibir.split(' ')[0]}!
              {isDependente && <Badge variant="secondary" className="ml-2 text-sm">Dependente</Badge>}
            </h2>
            <p className="opacity-90">
              {isDependente 
                ? `Dependente de ${associado?.nome} | Mat: ${associado?.matricula}`
                : `Matrícula: ${associado?.matricula} | Membro desde ${associado?.data_admissao && format(new Date(associado.data_admissao), "MMMM 'de' yyyy", { locale: ptBR })}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Grid Principal - Condicional baseado em isDependente */}
      <div className={cn(
        "grid gap-4",
        isDependente ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {/* Card Limite - Apenas para titular */}
        {!isDependente && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Limite Disponível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-primary">
                  {limiteDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilizado</span>
                    <span className="font-medium">{percentualUtilizado.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentualUtilizado}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {limiteUtilizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {limiteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <Link to="/dashboard/limite">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Carências/Procedimentos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              {isDependente ? 'Procedimentos' : 'Carências'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600">{carenciasLiberadas}</p>
                  <p className="text-xs text-green-700">Liberados</p>
                </div>
                <div className="flex-1 text-center p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{carenciasEmEspera}</p>
                  <p className="text-xs text-amber-700">Em Carência</p>
                </div>
              </div>
              <Link to="/dashboard/carencias">
                <Button variant="outline" size="sm" className="w-full">
                  Ver {isDependente ? 'Procedimentos' : 'Todas'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card Dependentes - Apenas para titular */}
        {!isDependente && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Dependentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-primary">{dependentes.length}</p>
                <div className="space-y-1">
                  {dependentes.slice(0, 2).map((dep) => (
                    <div key={dep.id} className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{dep.nome}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {tipoLabel[dep.tipo]}
                      </Badge>
                    </div>
                  ))}
                  {dependentes.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{dependentes.length - 2} outro(s)
                    </p>
                  )}
                </div>
                <Link to="/dashboard/dependentes">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Clínicas e Parceiros - Para todos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Clínicas e Parceiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Consulte nossa rede de clínicas e parceiros credenciados
              </p>
              <Link to="/dashboard/clinicas">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Rede Credenciada
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className={cn(
        "grid gap-4",
        isDependente ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"
      )}>
        <Link
          to="/dashboard/carteirinha"
          className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col items-center text-center gap-2"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <span className="font-medium text-sm">Carteirinha</span>
        </Link>

        <Link
          to="/dashboard/clinicas"
          className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col items-center text-center gap-2"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <span className="font-medium text-sm">Clínicas</span>
        </Link>

        {/* Informes - Apenas para titular */}
        {!isDependente && (
          <Link
            to="/dashboard/informes"
            className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col items-center text-center gap-2"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium text-sm">Informes</span>
          </Link>
        )}

        <a
          href={`https://wa.me/5571985496972`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col items-center text-center gap-2"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
          <span className="font-medium text-sm">Contato</span>
        </a>
      </div>

      {/* Informações do Dependente logado */}
      {isDependente && dependenteLogado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Meus Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{dependenteLogado.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{dependenteLogado.cpf || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{tipoLabel[dependenteLogado.tipo]}</p>
              </div>
              {dependenteLogado.data_nascimento && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">{format(new Date(dependenteLogado.data_nascimento), "dd/MM/yyyy")}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Titular</p>
                <p className="font-medium">{associado?.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matrícula do Titular</p>
                <p className="font-medium">{associado?.matricula}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Associado - Apenas para titular */}
      {!isDependente && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{associado?.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{associado?.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matrícula</p>
                <p className="font-medium">{associado?.matricula}</p>
              </div>
              {associado?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{associado.email}</p>
                </div>
              )}
              {associado?.telefone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{associado.telefone}</p>
                </div>
              )}
              {associado?.endereco && (
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{associado.endereco}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contatos WhatsApp */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Canais de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whatsappContacts.map((contact) => (
              <a
                key={contact.number}
                href={`https://wa.me/${contact.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{contact.label}</p>
                  <p className="text-sm text-muted-foreground">{contact.displayNumber}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
