import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CrudTable from "./CrudTable";

export default function AdminDependentes() {
  const [assocs, setAssocs] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    supabase.from("associados").select("id, nome, matricula").order("nome").then(({ data }) => {
      setAssocs((data ?? []).map((a) => ({ value: a.id, label: `${a.matricula} - ${a.nome}` })));
    });
  }, []);
  return (
    <CrudTable
      title="Dependentes"
      table="dependentes"
      searchField="nome"
      fields={[
        { key: "associado_id", label: "Associado (titular)", type: "select", options: assocs, required: true },
        { key: "nome", label: "Nome", required: true },
        { key: "cpf", label: "CPF" },
        { key: "data_nascimento", label: "Data de nascimento", type: "date" },
        { key: "tipo", label: "Tipo", type: "select", options: [
          { value: "conjuge", label: "Cônjuge" },
          { value: "filho", label: "Filho(a)" },
          { value: "pai", label: "Pai" },
          { value: "mae", label: "Mãe" },
          { value: "outro", label: "Outro" },
        ], defaultValue: "outro" },
        { key: "foto_url", label: "URL da foto", hideInTable: true },
        { key: "ativo", label: "Ativo", type: "boolean", defaultValue: true },
      ]}
    />
  );
}
