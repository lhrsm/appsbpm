import { cn } from "@/lib/utils";
import { User, Shield, Calendar, Award } from 'lucide-react';
import { useAssociado } from "@/contexts/AssociadoContext";
import { maskMatricula } from "@/portal/mask";

export function DashboardWelcomeHero() {
  const { associado, identity } = useAssociado();
  
  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const nome = identity?.resolved?.nome || associado?.nome || "Associado";
  const matricula = associado?.matricula || "2024.001";
  const situacao = associado?.status === 'regular' ? "Regular" : "Pendente";
  
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
    <section className="dashboard-hero">
      <div className="hero-image-wrapper">
        <img 
          src="/sbpm.jpeg" 
          alt="SBPM Institucional" 
          className="hero-image w-full h-full object-cover"
          onError={(e) => {
             e.currentTarget.src = "https://www.sbpmbahia.com.br/wp-content/uploads/2021/05/cropped-logo-sbpm-1-192x192.png";
          }}
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-card">
        <div className="hero-card-content">
          <div className="user-avatar">
            <User size={24} />
          </div>
          
          <div className="user-info">
            <h1>{saudacao()}, {nome.split(' ')[0]}</h1>
            <p>Bem-vindo ao Portal da SBPM</p>
          </div>

          <div className="user-badges">
            <div className="badge">
              <span className="badge-dot active" />
              Associado Ativo
            </div>
            <div className="badge">
              <Shield size={12} className="mr-1" />
              {tipoMilitar}
            </div>
          </div>
        </div>

        <div className="hero-card-footer">
          <div className="stat">
            <span className="stat-label">Matrícula</span>
            <span className="stat-value">{maskMatricula(matricula)}</span>
          </div>
          
          <div className="stat-divider" />

          <div className="stat">
            <span className="stat-label">Situação</span>
            <span className={cn("stat-value", situacao === 'Regular' && "status-ok")}>
              {situacao}
            </span>
          </div>

          <div className="stat-divider" />

          <div className="stat">
            <span className="stat-label">Tempo de associação</span>
            <span className="stat-value">{calcularTempoAssociacao()}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
