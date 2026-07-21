import { useState, useRef } from 'react';
import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, User, Users, Maximize2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';

interface CarteirinhaCardProps {
  nome: string;
  matricula: string;
  cpf: string;
  tipo: 'titular' | 'dependente';
  tipoParentesco?: string;
  fotoUrl?: string | null;
  dataExpedicao: string;
  dataValidade: string;
  nomeTitular?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

function CarteirinhaCard({ 
  nome, 
  matricula, 
  cpf, 
  tipo, 
  tipoParentesco,
  fotoUrl,
  dataExpedicao, 
  dataValidade,
  nomeTitular,
  cardRef 
}: CarteirinhaCardProps) {
  const formatCpf = (cpf: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div
      ref={cardRef}
      className="w-full max-w-lg bg-white border-2 border-gray-300 rounded-3xl shadow-xl overflow-hidden"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header com Logo/Foto e Título */}
      <div className="flex items-start p-4 border-b border-gray-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            {fotoUrl ? (
              <img 
                src={fotoUrl} 
                alt={nome} 
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <img 
                src={sbpmLogo} 
                alt="SBPM" 
                className="h-16 w-16 object-contain"
              />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800 text-center">
              Assistência Ambulatorial
            </h2>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="flex gap-4">
            <div>
              <span className="text-gray-600">Matrícula: </span>
              <span className="font-semibold">{matricula}</span>
            </div>
            <div>
              <span className="text-gray-600">Expedição: </span>
              <span className="font-semibold">{dataExpedicao}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corpo do Cartão */}
      <div className="p-4 space-y-3">
        {/* Nome e CPF */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              {nome}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {tipo === 'titular' ? 'Associado' : tipoParentesco || 'Dependente'}
            </p>
            {tipo === 'dependente' && nomeTitular && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-800 uppercase">
                  {nomeTitular}
                </p>
                <p className="text-xs text-gray-600">Associado</p>
              </div>
            )}
          </div>
          <div className="text-right text-sm space-y-1">
            <div>
              <span className="text-gray-600">CPF.: </span>
              <span className="font-semibold">{formatCpf(cpf)}</span>
            </div>
            <div>
              <span className="text-gray-600">Validade: </span>
              <span className="font-semibold">{dataValidade}</span>
            </div>
          </div>
        </div>

        {/* Linhas de Assinatura */}
        <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-200">
          <div className="text-center flex-1">
            <div className="border-t border-gray-400 w-40 mx-auto mb-1"></div>
            <p className="text-xs text-gray-600">Presidente</p>
          </div>
          <div className="text-center flex-1">
            <div className="border-t border-gray-400 w-40 mx-auto mb-1"></div>
            <p className="text-xs text-gray-600">Assinatura Associado</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Carteirinha() {
  const { associado, dependentes, isDependente, dependenteLogado } = useAssociado();
  const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tipoLabel: Record<string, string> = {
    conjuge: 'Cônjuge',
    filho: 'Filho(a)',
    pai_mae: 'Pai/Mãe',
    outro: 'Outro',
  };

  const hoje = new Date();
  const dataExpedicao = format(hoje, 'dd/MM/yyyy', { locale: ptBR });
  
  // Validade: 1 ano a partir de hoje
  const dataValidade = format(
    new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate()),
    'dd/MM/yyyy',
    { locale: ptBR }
  );

  const handleDownloadPDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Se é dependente logado, usa os dados do dependente logado
    // Se é titular, usa os dados do selecionado ou do titular
    const currentData = isDependente && dependenteLogado 
      ? { nome: dependenteLogado.nome, cpf: dependenteLogado.cpf, tipo: tipoLabel[dependenteLogado.tipo], isDep: true }
      : selectedDependente 
        ? { nome: selectedDependente.nome, cpf: selectedDependente.cpf, tipo: tipoLabel[selectedDependente.tipo], isDep: true }
        : { nome: associado?.nome || '', cpf: associado?.cpf || '', tipo: 'Associado', isDep: false };

    const formatCpf = (cpf: string) => {
      if (!cpf) return '';
      const cleaned = cpf.replace(/\D/g, '');
      if (cleaned.length !== 11) return cpf;
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carteirinha SBPM</title>
          <style>
            @page {
              size: 85.6mm 53.98mm;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body { 
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              width: 85.6mm;
              height: 53.98mm;
            }
            .card {
              width: 85.6mm;
              height: 53.98mm;
              border: 1px solid #ccc;
              border-radius: 6mm;
              overflow: hidden;
              background: white;
            }
            .header {
              display: flex;
              align-items: flex-start;
              padding: 3mm;
              border-bottom: 0.5px solid #ddd;
            }
            .logo {
              width: 12mm;
              height: 12mm;
              object-fit: contain;
              margin-right: 2mm;
            }
            .title {
              flex: 1;
              text-align: center;
              font-size: 8pt;
              font-weight: bold;
              color: #333;
            }
            .header-info {
              text-align: right;
              font-size: 6pt;
            }
            .header-info div {
              margin-bottom: 1mm;
            }
            .body {
              padding: 3mm;
            }
            .name {
              font-size: 9pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #111;
              margin-bottom: 1mm;
            }
            .type {
              font-size: 6pt;
              color: #666;
              margin-bottom: 2mm;
            }
            .titular-info {
              margin-top: 2mm;
            }
            .titular-name {
              font-size: 7pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            .titular-label {
              font-size: 5pt;
              color: #666;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              font-size: 6pt;
              margin-top: 2mm;
            }
            .info-row span {
              color: #666;
            }
            .info-row strong {
              color: #333;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              padding: 2mm 3mm;
              border-top: 0.5px solid #ddd;
              margin-top: auto;
            }
            .signature {
              text-align: center;
              width: 35mm;
            }
            .signature-line {
              border-top: 0.5px solid #666;
              margin-bottom: 1mm;
            }
            .signature-label {
              font-size: 5pt;
              color: #666;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <img src="${window.location.origin}/sbpm-logo.jpeg" class="logo" />
              <div class="title">Assistência Ambulatorial</div>
              <div class="header-info">
                <div><span>Matrícula: </span><strong>${associado?.matricula}</strong></div>
                <div><span>Expedição: </span><strong>${dataExpedicao}</strong></div>
              </div>
            </div>
            <div class="body">
              <div class="name">${currentData.nome}</div>
              <div class="type">${currentData.tipo}</div>
              ${currentData.isDep ? `
                <div class="titular-info">
                  <div class="titular-name">${associado?.nome}</div>
                  <div class="titular-label">Associado</div>
                </div>
              ` : ''}
              <div class="info-row">
                <div><span>CPF.: </span><strong>${formatCpf(currentData.cpf || '')}</strong></div>
                <div><span>Validade: </span><strong>${dataValidade}</strong></div>
              </div>
            </div>
            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Presidente</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Assinatura Associado</div>
              </div>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!associado) return null;

  // Se é dependente logado, mostra apenas a carteirinha dele
  if (isDependente && dependenteLogado) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Minha Carteirinha</h2>
          <p className="text-muted-foreground">
            Sua carteirinha de identificação junto à SBPM
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group relative w-full max-w-lg cursor-zoom-in transition-transform hover:scale-[1.02]"
            aria-label="Ampliar carteirinha"
          >
            <CarteirinhaCard
              cardRef={cardRef}
              nome={dependenteLogado.nome}
              matricula={associado.matricula}
              cpf={dependenteLogado.cpf || ''}
              tipo="dependente"
              tipoParentesco={tipoLabel[dependenteLogado.tipo]}
              fotoUrl={dependenteLogado.foto_url}
              dataExpedicao={dataExpedicao}
              dataValidade={dataValidade}
              nomeTitular={associado.nome}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4" />
            </div>
          </button>

          <Button onClick={handleDownloadPDF} className="w-full max-w-lg">
            <Download className="h-4 w-4 mr-2" />
            Baixar Carteirinha (PDF)
          </Button>
        </div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] border-0 p-0 overflow-y-auto bg-transparent shadow-none">
            <DialogTitle className="sr-only">Carteirinha ampliada</DialogTitle>
            <DialogDescription className="sr-only">Visualização ampliada da carteirinha</DialogDescription>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Fechar"
              className="sticky top-3 float-right z-50 mr-3 rounded-full bg-black/60 hover:bg-black/80 text-white p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center p-4 sm:p-8">
              <div className="w-full max-w-2xl [&>div]:max-w-none">
                <CarteirinhaCard
                  nome={dependenteLogado.nome}
                  matricula={associado.matricula}
                  cpf={dependenteLogado.cpf || ''}
                  tipo="dependente"
                  tipoParentesco={tipoLabel[dependenteLogado.tipo]}
                  fotoUrl={dependenteLogado.foto_url}
                  dataExpedicao={dataExpedicao}
                  dataValidade={dataValidade}
                  nomeTitular={associado.nome}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>


      </div>
    );
  }

  // Visão do titular - pode ver sua carteirinha e dos dependentes
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Carteirinha Digital</h2>
        <p className="text-muted-foreground">
          Sua carteirinha de identificação junto à SBPM
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Carteirinha Display */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group relative w-full max-w-lg cursor-zoom-in transition-transform hover:scale-[1.02]"
            aria-label="Ampliar carteirinha"
          >
            <CarteirinhaCard
              cardRef={cardRef}
              nome={selectedDependente?.nome || associado.nome}
              matricula={associado.matricula}
              cpf={selectedDependente?.cpf || associado.cpf}
              tipo={selectedDependente ? 'dependente' : 'titular'}
              tipoParentesco={selectedDependente ? tipoLabel[selectedDependente.tipo] : undefined}
              fotoUrl={selectedDependente ? selectedDependente.foto_url : associado?.foto_url}
              dataExpedicao={dataExpedicao}
              dataValidade={dataValidade}
              nomeTitular={selectedDependente ? associado.nome : undefined}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4" />
            </div>
          </button>

          <Button onClick={handleDownloadPDF} className="w-full max-w-lg">
            <Download className="h-4 w-4 mr-2" />
            Baixar Carteirinha (PDF)
          </Button>
        </div>

        {/* Seletor de Pessoa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Carteirinha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={!selectedDependente ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setSelectedDependente(null)}
            >
              <User className="h-4 w-4 mr-2" />
              {associado.nome}
              <Badge variant="secondary" className="ml-auto">Titular</Badge>
            </Button>

            {dependentes.map((dep) => (
              <Button
                key={dep.id}
                variant={selectedDependente?.id === dep.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDependente(dep)}
              >
                <User className="h-4 w-4 mr-2" />
                {dep.nome}
                <Badge variant="secondary" className="ml-auto">
                  {tipoLabel[dep.tipo]}
                </Badge>
              </Button>
            ))}

            {dependentes.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum dependente cadastrado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border-0 p-0 overflow-hidden bg-transparent shadow-none">
          <DialogTitle className="sr-only">Carteirinha ampliada</DialogTitle>
          <DialogDescription className="sr-only">Visualização ampliada da carteirinha</DialogDescription>
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label="Fechar"
            className="absolute top-3 right-3 z-50 rounded-full bg-black/60 hover:bg-black/80 text-white p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-center p-4">

            <div className="w-full sm:scale-125 origin-center">
              <CarteirinhaCard
                nome={selectedDependente?.nome || associado.nome}
                matricula={associado.matricula}
                cpf={selectedDependente?.cpf || associado.cpf}
                tipo={selectedDependente ? 'dependente' : 'titular'}
                tipoParentesco={selectedDependente ? tipoLabel[selectedDependente.tipo] : undefined}
                fotoUrl={selectedDependente ? selectedDependente.foto_url : associado?.foto_url}
                dataExpedicao={dataExpedicao}
                dataValidade={dataValidade}
                nomeTitular={selectedDependente ? associado.nome : undefined}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
