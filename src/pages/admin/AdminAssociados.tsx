import CrudTable from "./CrudTable";

export default function AdminAssociados() {
  return (
    <CrudTable
      title="Associados"
      table="associados"
      searchField="nome"
      fields={[
        { key: "matricula", label: "Matrícula", required: true },
        { key: "nome", label: "Nome completo", required: true },
        { key: "cpf", label: "CPF", required: true },
        { key: "email", label: "E-mail" },
        { key: "telefone", label: "Telefone" },
        { key: "data_nascimento", label: "Data de nascimento", type: "date" },
        { key: "data_admissao", label: "Data de admissão", type: "date" },
        { key: "endereco", label: "Endereço", type: "textarea", hideInTable: true },
        { key: "foto_url", label: "URL da foto", hideInTable: true },
        { key: "ativo", label: "Ativo", type: "boolean", defaultValue: true },
      ]}
    />
  );
}
