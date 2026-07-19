import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CrudTable from "./CrudTable";

export default function AdminCarencias() {
  const [assocs, setAssocs] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    supabase.from("associados").select("id, nome, matricula").order("nome").then(({ data }) => {
      setAssocs((data ?? []).map((a) => ({ value: a.id, label: `${a.matricula} - ${a.nome}` })));
    });
  }, []);
  return (
    <CrudTable
      title="Carências"
      table="carencias"
      searchField="procedimento"
      fields={[
        { key: "associado_id", label: "Associado", type: "select", options: assocs, required: true },
        { key: "procedimento", label: "Procedimento", required: true },
        { key: "status", label: "Status", type: "select", options: [
          { value: "em_carencia", label: "Em carência" },
          { value: "liberado", label: "Liberado" },
        ], defaultValue: "em_carencia" },
        { key: "data_liberacao", label: "Data de liberação", type: "date" },
      ]}
    />
  );
}
