import ModuleHub from "@/components/admin/ModuleHub";
import { ShieldCheck, Users, UserPlus, HeartHandshake, FileText, Wallet, FolderOpen } from "lucide-react";

export default function AdminPrevidencia() {
  return (
    <ModuleHub
      title="Previdência"
      description="Gestão previdenciária dos associados: cadastros, dependentes, pecúlio, informes de rendimentos e limites."
      icon={ShieldCheck}
      links={[
        { to: "/admin/associados", icon: Users, title: "Associados", description: "Cadastro de titulares.", status: "depende-integracao" },
        { to: "/admin/dependentes", icon: UserPlus, title: "Dependentes", description: "Vínculos e solicitações de inclusão/exclusão.", status: "depende-integracao" },
        { to: "/admin/peculio", icon: HeartHandshake, title: "Pecúlio", description: "Solicitações e beneficiários.", status: "ativo" },
        { to: "/admin/informes", icon: FileText, title: "Informes de Rendimentos", description: "Emissão e publicação anual.", status: "depende-integracao" },
        { to: "/admin/limites", icon: Wallet, title: "Limites", description: "Limite disponível e histórico de uso.", status: "depende-integracao" },
        { to: "/admin/documentos", icon: FolderOpen, title: "Documentos", description: "Documentos disponibilizados ao associado.", status: "ativo" },
      ]}
      notes={[
        "Os dados cadastrais definitivos virão da importação do sistema SBPM Sanitas.",
        "Nenhuma tela deste módulo altera as regras de acesso do portal externo.",
      ]}
    />
  );
}
