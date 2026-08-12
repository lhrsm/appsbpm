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
      <div className="sbpm-hero-card-overlay !static !inset-auto !w-full !max-w-none !shadow-lg !border-0 !bg-[#168754] !backdrop-blur-none !mb-0 !rounded-2xl md:!rounded-2xl mx-4 md:mx-0 !w-[calc(100%-32px)] md:!w-full min-h-[140px] md:min-h-0 py-5 px-5 md:py-6 md:px-6">
        <div className="sbpm-hero-card-content flex flex-col md:flex-row gap-4 md:gap-4 items-start md:items-center">

          <div className="sbpm-hero-user-info flex items-center gap-4 w-full md:w-auto">
            <div className="sbpm-hero-avatar shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md">
              <User className="text-white h-5 w-5 md:h-6 md:w-6" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="sbpm-hero-greeting text-lg md:text-2xl font-bold text-white truncate leading-tight">
                {saudacao()}, {nome.split(' ')[0]}
              </h1>
              <p className="sbpm-hero-subtitle text-[13px] md:text-sm text-white/80 font-medium">
                Bem-vindo ao Portal da SBPM
              </p>
            </div>
          </div>

          <div className="sbpm-hero-badges flex flex-row items-center gap-2 mt-1 md:mt-0">
            <div className="sbpm-hero-badge flex items-center gap-1.5 py-1 px-3 bg-white/12 text-white rounded-full text-[10px] md:text-xs font-medium backdrop-blur-sm border border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
              Associado Ativo
            </div>
            <div className="sbpm-hero-badge flex items-center gap-1.5 py-1 px-3 bg-white/12 text-white rounded-full text-[10px] md:text-xs font-medium backdrop-blur-sm border border-white/10">
              <Shield size={12} className="shrink-0" />
              {tipoMilitar}
            </div>
          </div>
        </div>

        <div className="sbpm-hero-stats flex items-center justify-between md:justify-start gap-4 md:gap-12 mt-5 pt-4 border-t border-white/12 w-full">
          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/60 uppercase tracking-wider font-bold">Matrícula</span>
            <span className="sbpm-hero-stat-value text-[13px] md:text-lg text-white font-bold truncate mt-0.5">{maskMatricula(matricula)}</span>
          </div>
          
          <div className="hidden md:block h-7 w-[1px] bg-white/12" />

          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/60 uppercase tracking-wider font-bold">Situação</span>
            <span className={cn("sbpm-hero-stat-value text-[13px] md:text-lg font-bold truncate mt-0.5", situacao === 'Regular' ? "text-green-300" : "text-white")}>
              {situacao}
            </span>
          </div>

          <div className="hidden md:block h-7 w-[1px] bg-white/12" />

          <div className="sbpm-hero-stat flex flex-col items-start min-w-0">
            <span className="sbpm-hero-stat-label text-[9px] md:text-[10px] text-white/60 uppercase tracking-wider font-bold">Tempo</span>
            <span className="sbpm-hero-stat-value text-[13px] md:text-lg text-white font-bold truncate mt-0.5">{calcularTempoAssociacao()}</span>
          </div>
        </div>
      </div>
    </div>


  );
}
