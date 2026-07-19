import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CrudTable from "./CrudTable";

export default function AdminLimites() {
  const [assocs, setAssocs] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    supabase.from("associados").select("id, nome, matricula").order("nome").then(({ data }) => {
      setAssocs((data ?? []).map((a) => ({ value: a.id, label: `${a.matricula} - ${a.nome}` })));
    });
  }, []);
  return (
    <CrudTable
      title="Limites"
      table="limites"
      fields={[
        { key: "associado_id", label: "Associado", type: "select", options: assocs, required: true },
        { key: "limite_total", label: "Limite total (R$)", type: "number", required: true, defaultValue: 0 },
        { key: "limite_utilizado", label: "Limite utilizado (R$)", type: "number", defaultValue: 0 },
        { key: "data_renovacao", label: "Data de renovação", type: "date" },
      ]}
    />
  );
}
