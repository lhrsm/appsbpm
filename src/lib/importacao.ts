import * as XLSX from "xlsx";

/** ---------------------------------------------------------------
 * Camada de importação genérica (fonte-agnóstica).
 * O frontend não conhece nenhum sistema específico: ele só conhece
 * "entidades destino" e um mapeamento coluna do arquivo -> campo.
 * --------------------------------------------------------------- */

export type CampoTipo = "texto" | "cpf" | "email" | "telefone" | "data" | "numero" | "booleano";

export type CampoDef = {
  id: string;
  label: string;
  tipo: CampoTipo;
  obrigatorio?: boolean;
  /** aliases de cabeçalho para auto-mapeamento */
  aliases?: string[];
};

export type EntidadeDef = {
  id: string;
  label: string;
  tabela: string;
  /** campo usado para detectar duplicidade */
  chave: string;
  descricao: string;
  campos: CampoDef[];
};

export const ENTIDADES: EntidadeDef[] = [
  {
    id: "associados",
    label: "Associados",
    tabela: "associados",
    chave: "matricula",
    descricao: "Cadastro de titulares. Duplicidade verificada pela matrícula.",
    campos: [
      { id: "matricula", label: "Matrícula", tipo: "texto", obrigatorio: true, aliases: ["matricula", "matrícula", "mat"] },
      { id: "nome", label: "Nome", tipo: "texto", obrigatorio: true, aliases: ["nome", "nome completo", "associado"] },
      { id: "cpf", label: "CPF", tipo: "cpf", obrigatorio: true, aliases: ["cpf", "documento"] },
      { id: "data_admissao", label: "Data de admissão", tipo: "data", obrigatorio: true, aliases: ["data_admissao", "admissao", "admissão", "data de admissão"] },
      { id: "patente", label: "Patente", tipo: "texto", aliases: ["patente", "posto", "graduacao", "graduação"] },
      { id: "email", label: "E-mail", tipo: "email", aliases: ["email", "e-mail"] },
      { id: "telefone", label: "Telefone", tipo: "telefone", aliases: ["telefone", "celular", "fone"] },
      { id: "data_nascimento", label: "Data de nascimento", tipo: "data", aliases: ["data_nascimento", "nascimento", "data de nascimento"] },
      { id: "cep", label: "CEP", tipo: "texto", aliases: ["cep"] },
      { id: "cidade", label: "Cidade", tipo: "texto", aliases: ["cidade", "municipio", "município"] },
      { id: "endereco", label: "Endereço", tipo: "texto", aliases: ["endereco", "endereço", "logradouro"] },
      { id: "ativo", label: "Ativo", tipo: "booleano", aliases: ["ativo", "situacao", "situação", "status"] },
    ],
  },
  {
    id: "dependentes",
    label: "Dependentes",
    tabela: "dependentes",
    chave: "cpf",
    descricao: "Dependentes vinculados por matrícula do titular. Duplicidade verificada pelo CPF.",
    campos: [
      { id: "associado_matricula", label: "Matrícula do titular", tipo: "texto", obrigatorio: true, aliases: ["associado_matricula", "matricula", "matrícula", "matricula_titular"] },
      { id: "nome", label: "Nome", tipo: "texto", obrigatorio: true, aliases: ["nome", "dependente"] },
      { id: "cpf", label: "CPF", tipo: "cpf", obrigatorio: true, aliases: ["cpf"] },
      { id: "tipo", label: "Parentesco", tipo: "texto", aliases: ["tipo", "parentesco", "grau"] },
      { id: "data_nascimento", label: "Data de nascimento", tipo: "data", aliases: ["data_nascimento", "nascimento"] },
      { id: "email", label: "E-mail", tipo: "email", aliases: ["email", "e-mail"] },
      { id: "telefone", label: "Telefone", tipo: "telefone", aliases: ["telefone", "celular"] },
      { id: "ativo", label: "Ativo", tipo: "booleano", aliases: ["ativo", "status"] },
    ],
  },
  {
    id: "clinicas_parceiros",
    label: "Clínicas e parceiros",
    tabela: "clinicas_parceiros",
    chave: "nome",
    descricao: "Rede credenciada. Duplicidade verificada pelo nome do parceiro.",
    campos: [
      { id: "nome", label: "Nome", tipo: "texto", obrigatorio: true, aliases: ["nome", "parceiro", "clinica", "clínica"] },
      { id: "cidade", label: "Cidade", tipo: "texto", obrigatorio: true, aliases: ["cidade", "municipio"] },
      { id: "especialidade", label: "Especialidade", tipo: "texto", aliases: ["especialidade", "categoria"] },
      { id: "estado", label: "Estado", tipo: "texto", aliases: ["estado", "uf"] },
      { id: "endereco", label: "Endereço", tipo: "texto", aliases: ["endereco", "endereço"] },
      { id: "telefone", label: "Telefone", tipo: "telefone", aliases: ["telefone", "fone"] },
      { id: "whatsapp", label: "WhatsApp", tipo: "telefone", aliases: ["whatsapp", "zap"] },
      { id: "email", label: "E-mail", tipo: "email", aliases: ["email", "e-mail"] },
      { id: "ativo", label: "Ativo", tipo: "booleano", aliases: ["ativo", "status"] },
    ],
  },
];

export const getEntidade = (id: string) => ENTIDADES.find((e) => e.id === id)!;

/** ---------------- Leitura de arquivos ---------------- */

export type ArquivoLido = { colunas: string[]; linhas: Record<string, any>[] };

const normHeader = (h: string) => String(h ?? "").trim();

export async function lerArquivo(file: File): Promise<ArquivoLido> {
  const nome = file.name.toLowerCase();

  if (nome.endsWith(".json")) {
    const texto = await file.text();
    const parsed = JSON.parse(texto);
    const arr: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
        ? parsed.data
        : Array.isArray(parsed?.items)
          ? parsed.items
          : [parsed];
    const colunas = Array.from(new Set(arr.flatMap((o) => Object.keys(o ?? {}))));
    return { colunas, linhas: arr.map((o) => ({ ...o })) };
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true, raw: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return { colunas: [], linhas: [] };
  const matriz = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "", blankrows: false, raw: false });
  if (!matriz.length) return { colunas: [], linhas: [] };
  const colunas = (matriz[0] as any[]).map((c, i) => normHeader(c) || `coluna_${i + 1}`);
  const linhas = matriz.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    colunas.forEach((c, i) => (obj[c] = (row as any[])[i] ?? ""));
    return obj;
  });
  return { colunas, linhas };
}

/** ---------------- Auto-mapeamento ---------------- */

const slug = (s: string) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

export function autoMapear(colunas: string[], entidade: EntidadeDef): Record<string, string> {
  const map: Record<string, string> = {};
  for (const campo of entidade.campos) {
    const alvos = new Set([slug(campo.id), slug(campo.label), ...(campo.aliases ?? []).map(slug)]);
    const achou = colunas.find((c) => alvos.has(slug(c)));
    if (achou) map[campo.id] = achou;
  }
  return map;
}

/** ---------------- Normalização e validação ---------------- */

export const soDigitos = (v: any) => String(v ?? "").replace(/\D/g, "");

export function cpfValido(cpf: string) {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function parseData(v: any): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const ano = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${ano}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

export function parseBooleano(v: any): boolean | null {
  if (v === "" || v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "sim", "s", "ativo", "regular", "yes", "y"].includes(s)) return true;
  if (["0", "false", "nao", "não", "n", "inativo", "no", "desativado"].includes(s)) return false;
  return null;
}

const TIPOS_DEPENDENTE: Record<string, string> = {
  conjuge: "conjuge",
  esposa: "conjuge",
  esposo: "conjuge",
  companheiro: "conjuge",
  companheira: "conjuge",
  filho: "filho",
  filha: "filho",
  pai: "pai_mae",
  mae: "pai_mae",
  pai_mae: "pai_mae",
  outro: "outro",
};

export type ErroLinha = { campo?: string; mensagem: string; severidade: "erro" | "alerta" };
export type LinhaProcessada = {
  linha: number;
  originais: Record<string, any>;
  normalizados: Record<string, any>;
  chave: string | null;
  erros: ErroLinha[];
  status: "valido" | "erro" | "duplicado";
};

export function processarLinha(
  entidade: EntidadeDef,
  mapeamento: Record<string, string>,
  original: Record<string, any>,
  numeroLinha: number,
): LinhaProcessada {
  const erros: ErroLinha[] = [];
  const out: Record<string, any> = {};

  for (const campo of entidade.campos) {
    const coluna = mapeamento[campo.id];
    const bruto = coluna ? original[coluna] : undefined;
    const vazio = bruto == null || String(bruto).trim() === "";

    if (vazio) {
      if (campo.obrigatorio) erros.push({ campo: campo.id, mensagem: `${campo.label} é obrigatório`, severidade: "erro" });
      continue;
    }

    const valor = String(bruto).trim();
    switch (campo.tipo) {
      case "cpf": {
        const d = soDigitos(valor);
        if (!cpfValido(d)) erros.push({ campo: campo.id, mensagem: `CPF inválido (${valor})`, severidade: "erro" });
        out[campo.id] = d;
        break;
      }
      case "email": {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          erros.push({ campo: campo.id, mensagem: `E-mail inválido (${valor})`, severidade: "alerta" });
        } else out[campo.id] = valor.toLowerCase();
        break;
      }
      case "telefone":
        out[campo.id] = soDigitos(valor);
        break;
      case "data": {
        const d = parseData(valor);
        if (!d) {
          erros.push({
            campo: campo.id,
            mensagem: `${campo.label} em formato inválido (${valor}). Use dd/mm/aaaa ou aaaa-mm-dd`,
            severidade: campo.obrigatorio ? "erro" : "alerta",
          });
        } else out[campo.id] = d;
        break;
      }
      case "numero": {
        const n = Number(valor.replace(/\./g, "").replace(",", "."));
        if (Number.isNaN(n)) erros.push({ campo: campo.id, mensagem: `${campo.label} não é numérico`, severidade: "erro" });
        else out[campo.id] = n;
        break;
      }
      case "booleano": {
        const b = parseBooleano(valor);
        if (b === null) erros.push({ campo: campo.id, mensagem: `${campo.label} não reconhecido (${valor})`, severidade: "alerta" });
        else out[campo.id] = b;
        break;
      }
      default:
        out[campo.id] = valor;
    }
  }

  if (entidade.id === "dependentes" && out.tipo) {
    out.tipo = TIPOS_DEPENDENTE[slug(String(out.tipo))] ?? "outro";
  }

  const chaveBruta = out[entidade.chave];
  const chave = chaveBruta == null ? null : String(chaveBruta).trim().toLowerCase();

  return {
    linha: numeroLinha,
    originais: original,
    normalizados: out,
    chave,
    erros,
    status: erros.some((e) => e.severidade === "erro") ? "erro" : "valido",
  };
}

export function marcarDuplicidades(linhas: LinhaProcessada[], chavesExistentes: Set<string>) {
  const vistas = new Set<string>();
  for (const l of linhas) {
    if (l.status === "erro" || !l.chave) continue;
    if (vistas.has(l.chave)) {
      l.status = "duplicado";
      l.erros.push({ campo: undefined, mensagem: "Registro duplicado dentro do próprio arquivo", severidade: "alerta" });
    } else if (chavesExistentes.has(l.chave)) {
      l.status = "duplicado";
      l.erros.push({ campo: undefined, mensagem: "Já existe um registro com esta chave na base", severidade: "alerta" });
    }
    vistas.add(l.chave);
  }
  return linhas;
}
