import ExternalPortalLayout from "@/portal/ExternalPortalLayout";
export default function LayoutPreview() {
  return (
    <ExternalPortalLayout
      profileType="associate"
      user={{ nome: "João Carlos Silva", matricula: "123456", titularNome: "João Carlos Silva", ativo: true }}
      onLogout={() => {}}
      pageTitle="Carteirinha"
      pageDescription="Consulte sua identificação digital e informações do vínculo."
    >
      <div className="h-64 rounded-xl border bg-card" />
    </ExternalPortalLayout>
  );
}
