import ModuleHub from "@/components/admin/ModuleHub";
import { Boxes, Building, Wrench, ClipboardList, QrCode, TrendingDown } from "lucide-react";

export default function AdminPatrimonio() {
  return (
    <ModuleHub
      title="Patrimonial"
      description="Controle de bens móveis e imóveis da instituição, localização, responsáveis, manutenção e depreciação."
      icon={Boxes}
      links={[
        { icon: Boxes, title: "Bens móveis", description: "Inventário, número de tombamento e responsável.", status: "em-breve" },
        { icon: Building, title: "Imóveis", description: "Cadastro de imóveis, matrículas e contratos.", status: "em-breve" },
        { icon: ClipboardList, title: "Inventário", description: "Campanhas de conferência periódica.", status: "em-breve" },
        { icon: Wrench, title: "Manutenções", description: "Ordens de serviço e histórico por bem.", status: "em-breve" },
        { icon: TrendingDown, title: "Depreciação", description: "Cálculo e relatórios contábeis de depreciação.", status: "em-breve" },
        { icon: QrCode, title: "Etiquetas QR", description: "Geração de etiquetas para identificação.", status: "em-breve" },
      ]}
      notes={[
        "Este módulo não depende da integração com o SBPM Sanitas e pode ser desenvolvido desde já.",
        "As tabelas propostas estão descritas em docs/ARQUITETURA.md e serão criadas por migrations versionadas.",
      ]}
    />
  );
}
