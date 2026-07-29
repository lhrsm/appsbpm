import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export const BUCKET_PATRIMONIO = 'patrimonio-anexos';

export type PatStatus =
  | 'em_uso' | 'disponivel' | 'em_manutencao' | 'emprestado'
  | 'em_transferencia' | 'inservivel' | 'baixado' | 'extraviado';

export const PAT_STATUS: Record<PatStatus, { label: string; className: string }> = {
  em_uso: { label: 'Em uso', className: 'bg-green-600 text-white' },
  disponivel: { label: 'Disponível', className: 'bg-blue-600 text-white' },
  em_manutencao: { label: 'Em manutenção', className: 'bg-yellow-500 text-white' },
  emprestado: { label: 'Emprestado', className: 'bg-purple-600 text-white' },
  em_transferencia: { label: 'Em transferência', className: 'bg-cyan-600 text-white' },
  inservivel: { label: 'Inservível', className: 'bg-orange-600 text-white' },
  baixado: { label: 'Baixado', className: 'bg-gray-500 text-white' },
  extraviado: { label: 'Extraviado', className: 'bg-destructive text-destructive-foreground' },
};

export const CONSERVACAO = [
  { value: 'novo', label: 'Novo' },
  { value: 'otimo', label: 'Ótimo' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'ruim', label: 'Ruim' },
  { value: 'inservivel', label: 'Inservível' },
];

export const MOV_TIPOS = [
  { value: 'transferencia', label: 'Transferência' },
  { value: 'emprestimo', label: 'Empréstimo' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'cessao', label: 'Cessão' },
  { value: 'manutencao', label: 'Envio para manutenção' },
  { value: 'retorno_manutencao', label: 'Retorno de manutenção' },
  { value: 'outro', label: 'Outro' },
];

export const APROVACAO: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Aguardando aprovação', className: 'bg-yellow-500 text-white' },
  aprovado: { label: 'Aprovada', className: 'bg-green-600 text-white' },
  reprovado: { label: 'Reprovada', className: 'bg-destructive text-destructive-foreground' },
};

export const INV_STATUS: Record<string, { label: string; className: string }> = {
  planejado: { label: 'Planejado', className: 'bg-muted text-muted-foreground' },
  em_andamento: { label: 'Em andamento', className: 'bg-blue-600 text-white' },
  encerrado: { label: 'Encerrado', className: 'bg-green-600 text-white' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
};

export const ITEM_STATUS: Record<string, { label: string; className: string }> = {
  esperado: { label: 'Aguardando conferência', className: 'bg-muted text-muted-foreground' },
  localizado: { label: 'Localizado', className: 'bg-green-600 text-white' },
  nao_localizado: { label: 'Não localizado', className: 'bg-destructive text-destructive-foreground' },
  divergente: { label: 'Divergência', className: 'bg-yellow-500 text-white' },
  nao_cadastrado: { label: 'Sem cadastro', className: 'bg-orange-600 text-white' },
};

export const MOTIVOS_BAIXA = [
  'Obsolescência', 'Inservibilidade', 'Extravio', 'Furto ou roubo',
  'Doação', 'Venda / leilão', 'Sinistro', 'Devolução ao cedente', 'Outro',
];

export const brl = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const dataBR = (d?: string | null) =>
  d ? new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR') : '—';

export const dataHoraBR = (d?: string | null) =>
  d ? new Date(d).toLocaleString('pt-BR') : '—';

/** Depreciação linear acumulada e valor contábil atual. */
export function depreciacao(bem: {
  valor?: number | null;
  data_aquisicao?: string | null;
  vida_util_meses?: number | null;
  taxa_depreciacao?: number | null;
}) {
  const valor = Number(bem.valor || 0);
  if (!valor || !bem.data_aquisicao) return { meses: 0, acumulada: 0, atual: valor };
  const inicio = new Date(`${bem.data_aquisicao.slice(0, 10)}T12:00:00`);
  const hoje = new Date();
  const meses = Math.max(
    0,
    (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth()),
  );
  let acumulada = 0;
  if (bem.vida_util_meses && bem.vida_util_meses > 0) {
    acumulada = Math.min(valor, (valor / bem.vida_util_meses) * meses);
  } else if (bem.taxa_depreciacao) {
    acumulada = Math.min(valor, valor * (Number(bem.taxa_depreciacao) / 100) * (meses / 12));
  }
  return { meses, acumulada, atual: Math.max(0, valor - acumulada) };
}

const baixar = (blob: Blob, nome: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportarCSV = (nome: string, head: string[], rows: (string | number)[][]) => {
  const csv = [head, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  baixar(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), `${nome}.csv`);
};

export const exportarXLSX = (nome: string, head: string[], rows: (string | number)[][]) => {
  const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cell = (v: any) =>
    typeof v === 'number'
      ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
      : `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Dados"><Table>
<Row>${head.map((h) => `<Cell><Data ss:Type="String">${esc(h)}</Data></Cell>`).join('')}</Row>
${rows.map((r) => `<Row>${r.map(cell).join('')}</Row>`).join('\n')}
</Table></Worksheet></Workbook>`;
  baixar(new Blob([xml], { type: 'application/vnd.ms-excel' }), `${nome}.xls`);
};

export const exportarPDF = (
  titulo: string,
  head: string[],
  rows: (string | number)[][],
  subtitulo?: string,
) => {
  const doc = new jsPDF({ orientation: head.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  doc.setFontSize(9);
  doc.text(`SBPM • Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 22);
  if (subtitulo) doc.text(subtitulo, 14, 27);
  autoTable(doc, {
    head: [head],
    body: rows.map((r) => r.map((c) => String(c ?? ''))),
    startY: subtitulo ? 31 : 27,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [21, 94, 57] },
  });
  doc.save(`${titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/** URL pública de consulta do bem via QR Code. */
export const urlQR = (token: string) => `${window.location.origin}/bem/${token}`;

export const gerarQRDataUrl = (token: string) =>
  QRCode.toDataURL(urlQR(token), { width: 512, margin: 1 });

/** Folha de etiquetas QR (A4, 3 colunas) para impressão. */
export async function gerarEtiquetasPDF(
  bens: { numero_patrimonial: string; descricao: string; qr_token: string }[],
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const cols = 3;
  const w = 65;
  const h = 45;
  let x = 10;
  let y = 12;
  for (let i = 0; i < bens.length; i++) {
    const b = bens[i];
    const img = await gerarQRDataUrl(b.qr_token);
    doc.setDrawColor(200);
    doc.rect(x, y, w, h);
    doc.addImage(img, 'PNG', x + 3, y + 6, 32, 32);
    doc.setFontSize(8);
    doc.text('SBPM • Patrimônio', x + 38, y + 12);
    doc.setFontSize(11);
    doc.text(b.numero_patrimonial, x + 38, y + 19);
    doc.setFontSize(7);
    doc.text(doc.splitTextToSize(b.descricao || '', 24), x + 38, y + 25);
    if ((i + 1) % cols === 0) {
      x = 10;
      y += h + 4;
    } else {
      x += w + 3;
    }
    if (y + h > 285) {
      doc.addPage();
      x = 10;
      y = 12;
    }
  }
  doc.save('etiquetas-patrimonio.pdf');
}

/** Termo de responsabilidade em PDF. */
export function gerarTermoPDF(dados: {
  numero?: string | null;
  bem: { numero_patrimonial: string; descricao: string; marca?: string | null; modelo?: string | null; numero_serie?: string | null; valor?: number | null };
  responsavel?: string | null;
  unidade?: string | null;
  setor?: string | null;
  observacoes?: string | null;
}) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('TERMO DE RESPONSABILIDADE PATRIMONIAL', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Sociedade Beneficente da Polícia Militar da Bahia — SBPM', 105, 27, { align: 'center' });
  if (dados.numero) doc.text(`Termo nº ${dados.numero}`, 105, 33, { align: 'center' });

  autoTable(doc, {
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 9 },
    body: [
      ['Número patrimonial', dados.bem.numero_patrimonial],
      ['Descrição', dados.bem.descricao],
      ['Marca / modelo', [dados.bem.marca, dados.bem.modelo].filter(Boolean).join(' / ') || '—'],
      ['Número de série', dados.bem.numero_serie || '—'],
      ['Valor', brl(Number(dados.bem.valor || 0))],
      ['Responsável', dados.responsavel || '—'],
      ['Unidade / setor', [dados.unidade, dados.setor].filter(Boolean).join(' / ') || '—'],
    ],
  });

  const y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      'Declaro ter recebido o bem acima descrito, comprometendo-me a zelar por sua guarda e conservação, ' +
        'utilizá-lo exclusivamente em atividades institucionais e comunicar imediatamente à área de patrimônio ' +
        'qualquer dano, extravio ou necessidade de movimentação. A devolução deverá ocorrer nas mesmas condições, ' +
        'ressalvado o desgaste natural de uso.',
      180,
    ),
    14,
    y,
  );
  if (dados.observacoes) doc.text(doc.splitTextToSize(`Observações: ${dados.observacoes}`, 180), 14, y + 24);

  doc.text('__________________________________', 20, y + 55);
  doc.text('Responsável pelo bem', 30, y + 61);
  doc.text('__________________________________', 115, y + 55);
  doc.text('Setor de Patrimônio — SBPM', 125, y + 61);
  doc.text(`Salvador/BA, ${new Date().toLocaleDateString('pt-BR')}`, 14, y + 75);
  doc.save(`termo-${dados.bem.numero_patrimonial}.pdf`);
}

/** Upload de arquivos para o bucket privado do patrimônio. */
export async function uploadAnexos(prefixo: string, files: FileList | File[]) {
  const out: { path: string; nome: string; tipo: string; tamanho: number }[] = [];
  for (const file of Array.from(files)) {
    const path = `${prefixo}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET_PATRIMONIO).upload(path, file);
    if (error) throw error;
    out.push({ path, nome: file.name, tipo: file.type, tamanho: file.size });
  }
  return out;
}

export async function abrirAnexo(path: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET_PATRIMONIO)
    .createSignedUrl(path, 60 * 10);
  if (error || !data) throw error ?? new Error('Falha ao gerar link');
  window.open(data.signedUrl, '_blank', 'noopener');
}
