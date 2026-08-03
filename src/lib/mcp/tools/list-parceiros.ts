import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_parceiros",
  title: "Listar clínicas e parceiros",
  description:
    "Lista todas as clínicas, laboratórios e parceiros conveniados da SBPM (Sociedade Beneficente da Polícia Militar da Bahia). Inclui nome, especialidade, cidade, endereço, telefone e horário de funcionamento. Dados públicos.",
  inputSchema: {
    cidade: z
      .string()
      .optional()
      .describe(
        "Filtrar por cidade (opcional). Ex.: 'Salvador', 'Feira de Santana'."
      ),
    especialidade: z
      .string()
      .optional()
      .describe(
        "Filtrar por especialidade (opcional). Ex.: 'Laboratório', 'Ortopedia'."
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Número máximo de resultados. Padrão: 100."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ cidade, especialidade, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    let query = supabase
      .from("clinicas_parceiros")
      .select(
        "nome, especialidade, cidade, endereco, telefone, email, horario_funcionamento, logo_url"
      )
      .eq("ativo", true)
      .order("cidade", { ascending: true })
      .order("nome", { ascending: true })
      .limit(Math.min(Math.max(limit ?? 100, 1), 500));

    if (cidade) query = query.ilike("cidade", `%${cidade}%`);
    if (especialidade)
      query = query.ilike("especialidade", `%${especialidade}%`);

    const { data, error } = await query;
    if (error) {
      return {
        content: [{ type: "text", text: `Erro: ${error.message}` }],
        isError: true,
      };
    }

    const rows = data ?? [];
    const summary =
      rows.length === 0
        ? "Nenhum parceiro encontrado com os filtros informados."
        : rows
            .map(
              (r) =>
                `• ${r.nome} — ${r.especialidade ?? "—"} — ${r.cidade}${
                  r.telefone ? ` — ☎ ${r.telefone}` : ""
                }${r.endereco ? ` — ${r.endereco}` : ""}`
            )
            .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `${rows.length} parceiro(s) encontrado(s):\n${summary}`,
        },
      ],
      structuredContent: { parceiros: rows, total: rows.length },
    };
  },
});
