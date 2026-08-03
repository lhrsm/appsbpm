import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { padCpf, padRegistrationNumber } from '@/lib/identity';

/**
 * Migration para normalizar dados de associados e dependentes.
 * Garante que CPF e Matrícula estejam no formato padrão sem pontuação.
 */
export default function MigrationNormalizacao() {
  useEffect(() => {
    const run = async () => {
      console.log('Iniciando normalização de dados...');
      
      // 1. Associados
      const { data: assoc } = await supabase.from('associados').select('id, cpf, matricula');
      for (const a of (assoc || [])) {
        const normCpf = padCpf(a.cpf);
        const normMat = padRegistrationNumber(a.matricula);
        
        if ((normCpf && normCpf !== a.cpf) || (normMat && normMat !== a.matricula)) {
          await supabase.from('associados').update({
            cpf: normCpf || a.cpf,
            matricula: normMat || a.matricula
          }).eq('id', a.id);
        }
      }

      // 2. Dependentes
      const { data: dep } = await supabase.from('dependentes').select('id, cpf');
      for (const d of (dep || [])) {
        const normCpf = padCpf(d.cpf);
        if (normCpf && normCpf !== d.cpf) {
          await supabase.from('dependentes').update({
            cpf: normCpf
          }).eq('id', d.id);
        }
      }

      // 3. Mock Records
      const { data: mock } = await supabase.from('external_identity_mock_records').select('id, cpf_reference, registration_number');
      for (const m of (mock || [])) {
        const normCpf = padCpf(m.cpf_reference);
        const normMat = padRegistrationNumber(m.registration_number);
        
        if ((normCpf && normCpf !== m.cpf_reference) || (normMat && normMat !== m.registration_number)) {
          await supabase.from('external_identity_mock_records').update({
            cpf_reference: normCpf || m.cpf_reference,
            registration_number: normMat || m.registration_number
          }).eq('id', m.id);
        }
      }
      
      console.log('Normalização concluída.');
    };
    
    run();
  }, []);

  return null;
}
