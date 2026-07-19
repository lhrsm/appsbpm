import CrudTable from "./CrudTable";

export default function AdminClinicas() {
  return (
    <CrudTable
      title="Clínicas e Parceiros"
      table="clinicas_parceiros"
      searchField="nome"
      fields={[
        { key: "nome", label: "Nome", required: true },
        { key: "especialidade", label: "Especialidade" },
        { key: "cidade", label: "Cidade", required: true },
        { key: "telefone", label: "Telefone" },
        { key: "email", label: "E-mail" },
        { key: "endereco", label: "Endereço", type: "textarea", hideInTable: true },
        { key: "horario_funcionamento", label: "Horário", hideInTable: true },
        { key: "logo_url", label: "URL da logo", hideInTable: true },
        { key: "ativo", label: "Ativo", type: "boolean", defaultValue: true },
      ]}
    />
  );
}
