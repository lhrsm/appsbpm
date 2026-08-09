import { cn } from "@/lib/utils";
import { User, Shield } from 'lucide-react';
import { useAssociado } from "@/contexts/AssociadoContext";
import { maskMatricula } from "@/portal/mask";

/** Hero de boas-vindas do portal (associado e dependente) - Versão Simplificada Premium. */
export function DashboardWelcomeHero() {
  const { associado, identity } = useAssociado();
  
  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const nome = identity?.resolved?.nome || associado?.nome || "Carlos";
  const matricula = associado?.matricula || "2024.001";
  const situacao = (associado?.status === 'regular' || !associado) ? "Regular" : "Pendente";
  
  const calcularTempoAssociacao = () => {
    if (!associado?.data_admissao) return "8 anos";
    const admissao = new Date(associado.data_admissao);
    const hoje = new Date();
    let anos = hoje.getFullYear() - admissao.getFullYear();
    const m = hoje.getMonth() - admissao.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < admissao.getDate())) {
      anos--;
    }
    return `${anos} anos`;
  };

  const tipoMilitar = matricula.startsWith('9') ? 'CBMBA' : 'PMBA';

  return (
    <div className="sbpm-hero-wrapper">
      <section className="sbpm-hero">
        <div className="sbpm-hero-bg">
          <img 
            src="/images/dashboard-hero.jpg" 
            alt="SBPM Institucional" 
            className="w-full h-full object-cover"
            onError={(e) => {
               // Fallback institucional se a imagem não existir
               e.currentTarget.src = "https://www.sbpmbahia.com.br/wp-content/uploads/2021/05/cropped-logo-sbpm-1-192x192.png";
               e.currentTarget.className = "w-full h-full object-contain p-8 bg-slate-100";
            }}
          />
        </div>
        
        <div className="sbpm-hero-overlay" />

        <div className="sbpm-hero-card">
          <div className="sbpm-hero-card-inner">
            <div className="sbpm-hero-user">
              <div className="sbpm-hero-avatar">
                <User size={24} className="text-white" />
              </div>
              
              <div>
                <h1 className="sbpm-hero-name">
                  {saudacao()}, {nome.split(' ')[0]}
                </h1>
                <p className="sbpm-hero-welcome">
                  Bem-vindo ao Portal da SBPM
                </p>
              </div>
            </div>

            <div className="sbpm-hero-badges">
              <div className="sbpm-hero-badge">
                <span className="sbpm-hero-dot" />
                Associado Ativo
              </div>
              <div className="sbpm-hero-badge">
                <Shield size={12} />
                {tipoMilitar}
              </div>
            </div>
          </div>

          <div className="sbpm-hero-stats">
            <div>
              <span className="sbpm-hero-stat-label">Matrícula</span>
              <span className="sbpm-hero-stat-value">{maskMatricula(matricula)}</span>
            </div>
            
            <div className="sbpm-hero-stat-divider" />

            <div>
              <span className="sbpm-hero-stat-label">Situação</span>
              <span className={cn("sbpm-hero-stat-value", situacao === 'Regular' && "text-green-400")}>
                {situacao}
              </span>
            </div>

            <div className="sbpm-hero-stat-divider" />

            <div>
              <span className="sbpm-hero-stat-label">Tempo de associação</span>
              <span className="sbpm-hero-stat-value">{calcularTempoAssociacao()}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
