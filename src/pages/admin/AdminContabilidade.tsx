import ModuleHub from "@/components/admin/ModuleHub";
import { Calculator, BookOpen, FileSpreadsheet, Scale, Landmark } from "lucide-react";

export default function AdminContabilidade() {
  return (
    <ModuleHub
      title="Contábil"
      description="Plano de contas, lançamentos, conciliação e demonstrativos contábeis da instituição."
      icon={Calculator}
      links={[
        { icon: BookOpen, title: "Plano de contas", description: "Estrutura hierárquica de contas contábeis.", status: "em-breve" },
        { icon: FileSpreadsheet, title: "Lançamentos", description: "Partidas dobradas e integrações com o Financeiro.", status: "em-breve" },
        { icon: Scale, title: "Conciliação", description: "Conciliação bancária e de contas.", status: "em-breve" },
        { icon: Landmark, title: "Demonstrativos", description: "Balancete, DRE e balanço patrimonial.", status: "em-breve" },
      ]}
      notes={[
        "Depende da consolidação prévia do módulo Financeiro e Patrimonial.",
        "Nenhuma estrutura contábil será criada sem migration versionada e aprovação.",
      ]}
    />
  );
}
