import { cn } from "@/lib/utils";
import { User, Shield } from 'lucide-react';
import { useAssociado } from "@/contexts/AssociadoContext";
import { maskMatricula } from "@/portal/mask";

/** Hero de boas-vindas do portal (associado e dependente) - Versão Definitiva Premium. */
export function DashboardWelcomeHero() {
  const { associado, identity } = useAssociado();
  
  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const nome = (identity?.resolved && typeof identity.resolved === 'object' && 'nome' in (identity.resolved as any)) 
    ? (identity.resolved as any).nome 
    : associado?.nome || "Carlos";
    
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
    <div className="animate-slide-up-in">
      <div className="sbpm-hero-card-overlay !static !inset-auto !w-full !max-w-none !shadow-lg !border-0 !bg-[#168754] !backdrop-blur-none !mb-0 !rounded-2xl md:!rounded-2xl mx-4 md:mx-0 !w-[calc(100%-32px)] md:!w-full min-h-[140px] md:min-h-0">
        <div className="sbpm-hero-card-content">
          <div className="sbpm-hero-user-info">
            <div className="sbpm-hero-avatar">
              <User size={24} />
            </div>
            
            <div>
              <h1 className="sbpm-hero-greeting">
                {saudacao()}, {nome.split(' ')[0]}
              </h1>
              <p className="sbpm-hero-subtitle">
                Bem-vindo ao Portal da SBPM
              </p>
            </div>
          </div>

          <div className="sbpm-hero-badges">
            <div className="sbpm-hero-badge">
              <span className="sbpm-hero-status-dot" />
              Associado Ativo
            </div>
            <div className="sbpm-hero-badge">
              <Shield size={12} className="mr-1" />
              {tipoMilitar}
            </div>
          </div>
        </div>

        <div className="sbpm-hero-stats">
          <div className="sbpm-hero-stat">
            <span className="sbpm-hero-stat-label">Matrícula</span>
            <span className="sbpm-hero-stat-value">{maskMatricula(matricula)}</span>
          </div>
          
          <div className="sbpm-hero-stat-divider" />

          <div className="sbpm-hero-stat">
            <span className="sbpm-hero-stat-label">Situação</span>
            <span className={cn("sbpm-hero-stat-value", situacao === 'Regular' && "sbpm-hero-status-ok")}>
              {situacao}
            </span>
          </div>

          <div className="sbpm-hero-stat-divider" />

          <div className="sbpm-hero-stat">
            <span className="sbpm-hero-stat-label">Tempo de associação</span>
            <span className="sbpm-hero-stat-value">{calcularTempoAssociacao()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
