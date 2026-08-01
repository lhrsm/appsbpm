// Geração e validação das perguntas de identidade (modelo institucional,
// uma pergunta por tela, alternativas de múltipla escolha).
// As respostas corretas nunca trafegam para o cliente: ficam apenas em hash.

export interface DesafioPublico {
  ordem: number;
  total: number;
  chave: string;
  pergunta: string;
  ajuda?: string;
  opcoes: string[];
}

interface PerguntaGerada {
  chave: string;
  pergunta: string;
  ajuda?: string;
  correta: string;
  distratores: string[];
}

export const MAX_ERROS = 2;
export const TOTAL_PERGUNTAS = 3;

export const normalizarResposta = (v: string) =>
  (v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const embaralhar = <T,>(arr: T[]): T[] => {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const ano = (data?: string | null) => (data ? String(new Date(`${data}T12:00:00`).getFullYear()) : null);

const anoPorExtenso = (data?: string | null) => {
  if (!data) return null;
  const d = new Date(`${data}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const primeiroNome = (nome?: string | null) => (nome || '').trim().split(/\s+/)[0] || null;

const PARENTESCOS: Record<string, string> = {
  conjuge: 'Cônjuge / companheiro(a)',
  filho: 'Filho(a)',
  pai_mae: 'Pai ou mãe',
  outro: 'Outro',
};

const cpfDigitos = (v?: string | null) => (v || '').replace(/\D/g, '');

/**
 * Monta o banco de perguntas a partir dos dados reais do cadastro,
 * usando registros de outras pessoas apenas como alternativas incorretas.
 */
export async function gerarPerguntas(
  admin: any,
  cpf: string,
  personType: 'associate' | 'dependent',
): Promise<PerguntaGerada[]> {
  const variantes = [cpf, cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')];

  let associado: any = null;
  let dependente: any = null;

  if (personType === 'associate') {
    associado = (
      await admin
        .from('associados')
        .select('id, nome, matricula, data_nascimento, patente, cidade, data_admissao')
        .in('cpf', variantes)
        .maybeSingle()
    ).data;
  } else {
    dependente = (
      await admin
        .from('dependentes')
        .select('id, associado_id, nome, data_nascimento, tipo')
        .in('cpf', variantes)
        .maybeSingle()
    ).data;
    if (dependente) {
      associado = (
        await admin
          .from('associados')
          .select('id, nome, matricula, data_nascimento, patente, cidade, data_admissao')
          .eq('id', dependente.associado_id)
          .maybeSingle()
      ).data;
    }
  }

  if (!associado && !dependente) return [];

  const perguntas: PerguntaGerada[] = [];

  const outros = (
    await admin.from('associados').select('nome, patente, cidade, matricula').limit(60)
  ).data as any[] | null;

  const distintos = (campo: string, exceto?: string | null, max = 3) => {
    const vistos = new Set<string>();
    const lista: string[] = [];
    for (const o of embaralhar(outros || [])) {
      const v = (o?.[campo] || '').toString().trim();
      if (!v) continue;
      if (exceto && normalizarResposta(v) === normalizarResposta(exceto)) continue;
      if (vistos.has(normalizarResposta(v))) continue;
      vistos.add(normalizarResposta(v));
      lista.push(v);
      if (lista.length >= max) break;
    }
    return lista;
  };

  // 1. Ano de nascimento (sempre disponível)
  const nascimento = personType === 'dependent' ? dependente?.data_nascimento : associado?.data_nascimento;
  const anoNasc = ano(nascimento);
  if (anoNasc) {
    const base = Number(anoNasc);
    const alternativas = embaralhar([base - 3, base - 1, base + 2, base + 4])
      .slice(0, 3)
      .map(String);
    perguntas.push({
      chave: 'ano_nascimento',
      pergunta: 'Em que ano você nasceu?',
      correta: anoNasc,
      distratores: alternativas,
    });
  }

  if (personType === 'associate' && associado) {
    if (associado.patente) {
      const d = distintos('patente', associado.patente);
      if (d.length >= 2) {
        perguntas.push({
          chave: 'patente',
          pergunta: 'Qual é o seu posto ou graduação registrado na SBPM?',
          correta: associado.patente,
          distratores: d,
        });
      }
    }

    if (associado.cidade) {
      const d = distintos('cidade', associado.cidade);
      if (d.length >= 2) {
        perguntas.push({
          chave: 'cidade',
          pergunta: 'Qual destas cidades consta no seu endereço cadastrado?',
          correta: associado.cidade,
          distratores: d,
        });
      }
    }

    const matricula = (associado.matricula || '').toString().trim();
    if (matricula.length >= 3) {
      const finalReal = matricula.slice(-3);
      const gerar = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000).padStart(3, '0');
      const falsos = new Set<string>();
      while (falsos.size < 3) {
        const c = gerar();
        if (c !== finalReal) falsos.add(c);
      }
      perguntas.push({
        chave: 'matricula_final',
        pergunta: 'Quais são os três últimos caracteres da sua matrícula?',
        correta: finalReal,
        distratores: [...falsos],
      });
    }

    const deps = (
      await admin.from('dependentes').select('nome').eq('associado_id', associado.id).limit(5)
    ).data as any[] | null;

    if (deps && deps.length) {
      const nomeDep = primeiroNome(deps[0].nome);
      const outrosDeps = (
        await admin.from('dependentes').select('nome').neq('associado_id', associado.id).limit(40)
      ).data as any[] | null;
      const falsos = embaralhar(
        [...new Set((outrosDeps || []).map((d) => primeiroNome(d.nome)).filter(Boolean) as string[])].filter(
          (n) => normalizarResposta(n) !== normalizarResposta(nomeDep || ''),
        ),
      ).slice(0, 3);
      if (nomeDep && falsos.length >= 2) {
        perguntas.push({
          chave: 'dependente',
          pergunta: 'Qual destes nomes pertence a um dependente do seu cadastro?',
          correta: nomeDep,
          distratores: falsos,
        });
      }
    }

    const admissao = anoPorExtenso(associado.data_admissao);
    if (admissao) {
      const d = new Date(`${associado.data_admissao}T12:00:00`);
      const falsos = embaralhar([-14, -7, 5, 11])
        .slice(0, 3)
        .map((m) => {
          const alt = new Date(d);
          alt.setMonth(alt.getMonth() + m);
          return alt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        });
      perguntas.push({
        chave: 'admissao',
        pergunta: 'Em que mês e ano você passou a ser associado da SBPM?',
        correta: admissao,
        distratores: falsos,
      });
    }
  }

  if (personType === 'dependent' && dependente) {
    if (associado?.nome) {
      const correta = associado.nome;
      const falsos = distintos('nome', correta);
      if (falsos.length >= 2) {
        perguntas.push({
          chave: 'titular',
          pergunta: 'Qual é o nome do associado titular ao qual você está vinculado?',
          correta,
          distratores: falsos,
        });
      }
    }

    const tipo = PARENTESCOS[dependente.tipo as string];
    if (tipo) {
      const falsos = Object.values(PARENTESCOS).filter((v) => v !== tipo).slice(0, 3);
      perguntas.push({
        chave: 'parentesco',
        pergunta: 'Qual é o seu grau de parentesco com o titular no cadastro da SBPM?',
        correta: tipo,
        distratores: falsos,
      });
    }

    const mat = (associado?.matricula || '').toString().trim();
    if (mat.length >= 3) {
      const finalReal = mat.slice(-3);
      const falsos = new Set<string>();
      while (falsos.size < 3) {
        const c = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000).padStart(3, '0');
        if (c !== finalReal) falsos.add(c);
      }
      perguntas.push({
        chave: 'matricula_titular',
        pergunta: 'Quais são os três últimos caracteres da matrícula do titular?',
        correta: finalReal,
        distratores: [...falsos],
      });
    }
  }

  return embaralhar(perguntas).slice(0, TOTAL_PERGUNTAS);
}

export const montarOpcoes = (p: PerguntaGerada) => embaralhar([p.correta, ...p.distratores.slice(0, 3)]);

export const publicar = (row: any, total: number): DesafioPublico => ({
  ordem: row.ordem,
  total,
  chave: row.chave,
  pergunta: row.pergunta,
  opcoes: Array.isArray(row.opcoes) ? row.opcoes : [],
});

export { cpfDigitos };
