import ModuleHub from "@/components/admin/ModuleHub";
import { Stethoscope, Building2, Star, Clock, Ticket, Megaphone } from "lucide-react";

export default function AdminSaude() {
  return (
    <ModuleHub
      title="Assistência à Saúde"
      description="Rede credenciada, autorizações, carências e relacionamento assistencial com associados e dependentes."
      icon={Stethoscope}
      links={[
        { to: "/admin/clinicas", icon: Building2, title: "Clínicas & Parceiros", description: "Rede credenciada e categorias.", status: "ativo" },
        { to: "/admin/avaliacoes", icon: Star, title: "Avaliações", description: "Moderação das avaliações da rede.", status: "ativo" },
        { to: "/admin/carencias", icon: Clock, title: "Carências", description: "Controle interno de carências.", status: "depende-integracao" },
        { to: "/admin/solicitacoes", icon: Ticket, title: "Solicitações", description: "Atendimentos e chamados assistenciais.", status: "ativo" },
        { to: "/admin/comunicados", icon: Megaphone, title: "Comunicados", description: "Avisos segmentados por público.", status: "ativo" },
        { icon: Stethoscope, title: "Autorizações de procedimentos", description: "Fluxo de autorização/guias.", status: "em-breve" },
      ]}
      notes={[
        "Carências e utilização dependem da importação do SBPM Sanitas.",
        "A opção 'Carências' permanece oculta no portal externo, conforme decisão anterior.",
      ]}
    />
  );
}
