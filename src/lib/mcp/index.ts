import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listParceirosTool from "./tools/list-parceiros";
import listCidadesTool from "./tools/list-cidades";
import canaisAtendimentoTool from "./tools/canais-atendimento";

// OAuth issuer must point at the direct Supabase host built from the project
// ref (never SUPABASE_URL, which on Lovable Cloud is the .lovable.cloud proxy).
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "sbpm-bahia-mcp",
  title: "SBPM Bahia — Parceiros e Atendimento",
  version: "0.1.0",
  instructions:
    "Ferramentas de consulta pública da SBPM (Sociedade Beneficente da Polícia Militar da Bahia): lista de clínicas e parceiros conveniados por cidade e especialidade, cidades atendidas e canais oficiais de atendimento (WhatsApp por setor). Não exponha dados por usuário.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listParceirosTool, listCidadesTool, canaisAtendimentoTool],
});
