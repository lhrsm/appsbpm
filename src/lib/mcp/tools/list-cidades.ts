import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_cidades_atendidas",
  title: "Listar cidades atendidas",
  description:
    "Lista todas as cidades onde a SBPM possui clínicas ou parceiros conveniados, com a contagem de parceiros por cidade. Dados públicos.",
  inputSchema: {},
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data, error } = await supabase
      .from("clinicas_parceiros")
      .select("cidade")
      .eq("ativo", true);

    if (error) {
      return {
        content: [{ type: "text", text: `Erro: ${error.message}` }],
        isError: true,
      };
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      counts.set(row.cidade, (counts.get(row.cidade) ?? 0) + 1);
    }

    const cidades = Array.from(counts.entries())
      .map(([cidade, total]) => ({ cidade, total }))
      .sort((a, b) => a.cidade.localeCompare(b.cidade));

    const summary = cidades
      .map((c) => `• ${c.cidade} — ${c.total} parceiro(s)`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `${cidades.length} cidade(s) atendida(s):\n${summary}`,
        },
      ],
      structuredContent: { cidades },
    };
  },
});