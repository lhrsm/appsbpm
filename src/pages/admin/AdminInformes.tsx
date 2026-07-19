import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CrudTable from "./CrudTable";

export default function AdminInformes() {
  const [assocs, setAssocs] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    supabase.from("associados").select("id, nome, matricula").order("nome").then(({ data }) => {
      setAssocs((data ?? []).map((a) => ({ value: a.id, label: `${a.matricula} - ${a.nome}` })));
    });
  }, []);
  return (
    <CrudTable
      title="Informes de Rendimentos"
      table="informes_rendimentos"
      fields={[
        { key: "associado_id", label: "Associado", type: "select", options: assocs, required: true },
        { key: "ano", label: "Ano", type: "number", required: true },
        { key: "arquivo_url", label: "URL do PDF" },
      ]}
    />
  );
}
