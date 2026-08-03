import { PortalLoadingState } from "@/portal/components/PortalStates";
import { useAssociado } from "@/contexts/AssociadoContext";
import { Button } from "@/components/ui/button";

export default function DashboardRecovery() {
  const { associado, logout } = useAssociado();

  if (!associado) {
    return <PortalLoadingState message="Recuperação: Aguardando dados..." />;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Portal da SBPM</h1>
      <p className="mt-4">Dashboard de recuperação carregado com sucesso.</p>
      <div className="mt-6 p-4 border rounded bg-muted/20">
        <p>Usuário: {associado.nome}</p>
        <p>Matrícula: {associado.matricula}</p>
      </div>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Button variant="destructive" onClick={logout}>Sair</Button>
      </div>
      <div className="mt-12 text-[10px] text-muted-foreground font-mono">
        Build: recovery-dashboard-2026-08-03
      </div>
    </main>
  );
}
