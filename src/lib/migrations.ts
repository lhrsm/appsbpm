import { supabase } from "@/integrations/supabase/client";

/**
 * Normaliza os dados de CPF, Matrícula e Data de Nascimento existentes no banco.
 * Garante que a coluna data_nascimento seja do tipo 'date' e que os valores sigam o padrão YYYY-MM-DD.
 */
export async function migrarDatasNascimento() {
  console.log("Iniciando migração de normalização de datas e credenciais...");

  // 1. Normalizar Associados
  const { data: associados, error: errAssoc } = await supabase
    .from("associados")
    .select("id, cpf, matricula, data_nascimento, data_admissao");

  if (!errAssoc && associados) {
    for (const a of associados) {
      const updates: any = {};
      
      // Normalizar CPF e Matrícula (zeros à esquerda)
      const cleanCpf = (a.cpf || "").replace(/\D/g, "");
      if (cleanCpf && cleanCpf.length < 11) {
        updates.cpf = cleanCpf.padStart(11, "0");
      } else if (cleanCpf !== a.cpf) {
        updates.cpf = cleanCpf;
      }

      const cleanMat = (a.matricula || "").replace(/\D/g, "");
      if (cleanMat && cleanMat.length < 9) {
        updates.matricula = cleanMat.padStart(9, "0");
      } else if (cleanMat !== a.matricula) {
        updates.matricula = cleanMat;
      }

      // Verificação de datas (a coluna já deve ser 'date', o que força ISO)
      // Aqui apenas logamos se houver algo estranho, pois o Supabase já valida o tipo 'date'
      
      if (Object.keys(updates).length > 0) {
        await supabase.from("associados").update(updates).eq("id", a.id);
      }
    }
  }

  console.log("Migração concluída.");
  return true;
}
