import { defineTool } from "@lovable.dev/mcp-js";

const canais = [
  {
    setor: "Previdência",
    atendente: "Tina ou Valéria",
    whatsapp: "(71) 98549-6972",
  },
  {
    setor: "Assistência à Saúde",
    atendente: "Rejane",
    whatsapp: "(71) 98794-3414",
  },
  {
    setor: "Assistência à Saúde",
    atendente: "Tânia",
    whatsapp: "(71) 99923-4059",
  },
  {
    setor: "Assistência à Saúde",
    atendente: "Fabiane",
    whatsapp: "(71) 98146-8013",
  },
  {
    setor: "Assistência à Saúde",
    atendente: "Tiago",
    whatsapp: "(71) 99634-0317",
  },
  {
    setor: "Centro Médico",
    atendente: "Javanete",
    whatsapp: "(71) 98791-2258",
  },
  {
    setor: "Posto Odontológico",
    atendente: "Márcia",
    whatsapp: "(71) 98791-2263",
  },
];

export default defineTool({
  name: "list_canais_atendimento",
  title: "Listar canais de atendimento",
  description:
    "Lista os canais oficiais de atendimento da SBPM Bahia (WhatsApp por setor e atendente). Dados públicos.",
  inputSchema: {},
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: () => {
    const summary = canais
      .map(
        (c) =>
          `• ${c.setor} — ${c.atendente}: ${c.whatsapp}`
      )
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Canais de atendimento SBPM:\n${summary}\n\nWebsite: https://www.sbpmbahia.com.br`,
        },
      ],
      structuredContent: { canais, website: "https://www.sbpmbahia.com.br" },
    };
  },
});
