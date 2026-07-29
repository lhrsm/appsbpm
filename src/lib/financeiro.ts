import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const brl = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export type FinStatus = 'rascunho' | 'pendente' | 'aprovado' | 'pago' | 'cancelado' | 'estornado';
export type FinNatureza = 'receita' | 'despesa';

export const FIN_STATUS: Record<FinStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  pendente: { label: 'Aguardando aprovação', className: 'bg-yellow-500 text-white' },
  aprovado: { label: 'Aprovado', className: 'bg-blue-600 text-white' },
  pago: { label: 'Liquidado', className: 'bg-green-600 text-white' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
  estornado: { label: 'Estornado', className: 'bg-orange-600 text-white' },
};

export const FORMAS_PAGAMENTO = [
  'Boleto', 'PIX', 'Transferência', 'Cartão de crédito', 'Cartão de débito',
  'Dinheiro', 'Cheque', 'Débito automático', 'Outro',
];

/** Situação exibida considerando vencimento (não persistida). */
export const situacaoVencimento = (l: { status: string; vencimento: string }) => {
  if (['pago', 'cancelado', 'estornado'].includes(l.status)) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  if (l.vencimento < hoje) return 'vencido';
  return null;
};

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

/** XLSX via SpreadsheetML — abre no Excel/LibreOffice sem dependência extra. */
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
  nome: string,
  titulo: string,
  head: string[],
  rows: (string | number)[][],
  resumo?: string[],
) => {
  const doc = new jsPDF({ orientation: head.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  doc.setFontSize(9);
  doc.text('SBPM — Sociedade Beneficente da Polícia Militar', 14, 22);
  doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')}`, 14, 27);
  autoTable(doc, {
    startY: 32,
    head: [head],
    body: rows.map((r) => r.map((c) => String(c ?? ''))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 122, 62] },
  });
  if (resumo?.length) {
    let y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    resumo.forEach((linha) => {
      doc.text(linha, 14, y);
      y += 6;
    });
  }
  doc.save(`${nome}.pdf`);
};
