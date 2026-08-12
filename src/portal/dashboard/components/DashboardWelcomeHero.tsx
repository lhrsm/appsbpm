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
      <div className="sbpm-hero-card-overlay !static !inset-auto !w-full !max-w-none !shadow-lg !border-0 !bg-[#168754] !backdrop-blur-none !mb-0 !rounded-2xl md:!rounded-2xl mx-4 md:mx-0 !w-[calc(100%-32px)] md:!w-full min-h-[120px] md:min-h-0 py-4 px-4 md:py-6 md:px-6">
        <div className="sbpm-hero-card-content gap-2 md:gap-4">

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

          <div className="sbpm-hero-badges flex flex-row items-center gap-2">
            <div className="sbpm-hero-badge flex items-center gap-1.5 py-1 px-3 bg-white/12 text-white rounded-full text-[10px] md:text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
              Associado Ativo
            </div>
            <div className="sbpm-hero-badge flex items-center gap-1.5 py-1 px-3 bg-white/12 text-white rounded-full text-[10px] md:text-xs font-medium">
              <Shield size={12} />
              {tipoMilitar}
            </div>
          </div>
        </div>

        <div className="sbpm-hero-stats flex items-center justify-between md:justify-start gap-4 md:gap-12 mt-4 pt-3 border-t border-white/8 w-full">
          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/55 uppercase tracking-wider font-medium">Matrícula</span>
            <span className="sbpm-hero-stat-value text-sm md:text-lg text-white font-bold truncate">{maskMatricula(matricula)}</span>
          </div>
          
          <div className="hidden md:block h-7 w-[1px] bg-white/8" />

          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/55 uppercase tracking-wider font-medium">Situação</span>
            <span className={cn("sbpm-hero-stat-value text-sm md:text-lg font-bold truncate", situacao === 'Regular' ? "text-green-400" : "text-white")}>
              {situacao}
            </span>
          </div>

          <div className="hidden md:block h-7 w-[1px] bg-white/8" />

          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/55 uppercase tracking-wider font-medium">Tempo</span>
            <span className="sbpm-hero-stat-value text-sm md:text-lg text-white font-bold truncate">{calcularTempoAssociacao()}</span>
          </div>
        </div>
      </div>
    </div>

  );
}
