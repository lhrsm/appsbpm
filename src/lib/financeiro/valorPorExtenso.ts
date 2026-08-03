/**
 * Serviço de conversão de valores monetários para extenso.
 * Regras institucionais SBPM para cheques e documentos financeiros.
 */

const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const dezena1 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function converterCentena(valor: number): string {
  if (valor === 0) return "";
  if (valor === 100) return "cem";

  let extenso = "";
  const c = Math.floor(valor / 100);
  const d = Math.floor((valor % 100) / 10);
  const u = valor % 10;

  if (c > 0) extenso += centenas[c];

  if (d > 0 || u > 0) {
    if (c > 0) extenso += " e ";
    
    if (d === 1) {
      extenso += dezena1[u];
    } else {
      if (d > 1) extenso += dezenas[d];
      if (u > 0) {
        if (d > 1) extenso += " e ";
        extenso += unidades[u];
      }
    }
  }

  return extenso;
}

/**
 * Converte um valor numérico para extenso (BRL).
 * @param valor O valor em reais (ex: 1250.40)
 */
export function valorPorExtenso(valor: number): string {
  if (valor === 0) return "zero reais";
  if (valor < 0) return "valor negativo";
  if (valor > 999999999.99) return "valor acima do limite permitido";

  const partes = valor.toFixed(2).split(".");
  const inteiro = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);

  let extenso = "";

  const milhoes = Math.floor(inteiro / 1000000);
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  const resto = inteiro % 1000;

  if (milhoes > 0) {
    extenso += converterCentena(milhoes);
    extenso += milhoes === 1 ? " milhão" : " milhões";
  }

  if (milhares > 0) {
    if (extenso !== "") extenso += ", ";
    extenso += converterCentena(milhares);
    extenso += " mil";
  }

  if (resto > 0) {
    if (extenso !== "") {
      // Regra de "e" em vez de vírgula para centenas simples
      if (resto < 100 || resto % 100 === 0) extenso += " e ";
      else extenso += ", ";
    }
    extenso += converterCentena(resto);
  }

  // Moeda
  if (inteiro > 0) {
    extenso += inteiro === 1 ? " real" : " reais";
  }

  // Centavos
  if (centavos > 0) {
    if (extenso !== "") extenso += " e ";
    extenso += converterCentena(centavos);
    extenso += centavos === 1 ? " centavo" : " centavos";
  }

  return extenso.trim();
}
