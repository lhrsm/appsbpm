import { useEffect, useState, useRef } from 'react';
import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, User, Users, Maximize2, X, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  assinaturaUrl?: string | null;
  presidenteAssinaturaUrl?: string | null;
  presidenteNome?: string | null;
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
  assinaturaUrl,
  presidenteAssinaturaUrl,
  presidenteNome,
  cardRef,
}: CarteirinhaCardProps) {

  const formatCpf = (cpf: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="w-full max-w-full overflow-hidden digital-membership-card mb-4 px-0" style={{ colorScheme: 'light' }}>
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-[680px] md:max-w-full bg-white border-[1.5px] border-green-500 rounded-[22px] shadow-lg overflow-hidden flex flex-col print:shadow-none print:border-green-600 print:m-0 print:rounded-none"
        style={{ fontFamily: 'Arial, sans-serif', minHeight: 'fit-content', maxWidth: '100%' }}
      >

        {/* Header com Logo/Foto e Título */}
        <div className="grid grid-cols-[auto,1fr] gap-3 p-3 border-b border-gray-200 bg-white text-gray-800 items-center">

          <div className="relative shrink-0">
            {fotoUrl ? (
              <img 
                src={fotoUrl} 
                alt={nome} 
                className="h-11 w-11 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <img 
                src={sbpmLogo} 
                alt="SBPM" 
                className="h-11 w-11 object-contain"
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] items-center gap-x-4 gap-y-1">
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              Assistência Ambulatorial
            </h2>
            <div className="flex flex-col text-[10px] md:text-xs">
              <div className="flex justify-between md:justify-end gap-2">
                <span className="text-gray-500">Matrícula: </span>
                <span className="font-semibold">{matricula}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-2">
                <span className="text-gray-500">Expedição: </span>
                <span className="font-semibold">{dataExpedicao}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corpo do Cartão */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 bg-white text-gray-800">
          {/* Nome e CPF */}
          <div className="flex flex-col gap-3">
            <div className="w-full text-center">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide leading-tight break-words" style={{ fontSize: 'clamp(0.92rem, 4.2vw, 1.12rem)' }}>
                {nome}
              </h3>
              <p className="text-[11px] text-gray-500">
                {tipo === 'titular' ? 'Associado' : tipoParentesco || 'Dependente'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase">CPF</span>
                  <span className="font-semibold">{formatCpf(cpf)}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 uppercase">Validade</span>
                  <span className="font-semibold">{dataValidade}</span>
               </div>
            </div>
          </div>

          {/* Linhas de Assinatura */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 w-full px-3">
            <div className="text-center min-w-0 flex flex-col items-center">
              <div className="h-10 flex items-end justify-center mb-1 w-full overflow-hidden">
                {presidenteAssinaturaUrl && (
                  <img
                    src={presidenteAssinaturaUrl}
                    alt="Assinatura do Presidente"
                    className="max-h-full w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div className="border-t border-gray-400 w-full mb-1"></div>
              <p className="text-[10px] text-gray-500 leading-tight uppercase truncate w-full" title={presidenteNome || 'Presidente'}>{presidenteNome || 'Presidente'}</p>
            </div>
            <div className="text-center min-w-0 flex flex-col items-center">
              <div className="h-10 flex items-end justify-center mb-1 w-full overflow-hidden">
                {assinaturaUrl && (
                  <img
                    src={assinaturaUrl}
                    alt="Assinatura do Associado"
                    className="max-h-full w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div className="border-t border-gray-400 w-full mb-1"></div>
              <p className="text-[10px] text-gray-500 leading-tight uppercase truncate w-full">Assinatura Associado</p>
            </div>
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
  const [presidenteUrl, setPresidenteUrl] = useState<string | null>(null);
  const [presidenteNome, setPresidenteNome] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('sistema_config').select('chave,valor');
      const map = Object.fromEntries((data || []).map((r: any) => [r.chave, r.valor]));
      const ativo = map.signatario_ativo || 'presidente';
      const url =
        map[`signatario_${ativo}_url`] ||
        (ativo === 'presidente' ? map.assinatura_presidente_url : null) ||
        null;
      const nome =
        map[`signatario_${ativo}_nome`] ||
        (ativo === 'presidente' ? map.nome_presidente : null) ||
        null;
      const cargo =
        map[`signatario_${ativo}_cargo`] ||
        (ativo === 'presidente'
          ? 'Presidente'
          : ativo === 'vice_presidente'
          ? 'Vice-Presidente'
          : ativo === 'superintendente_saude'
          ? 'Superintendente de Promoção da Saúde'
          : 'Presidente');
      setPresidenteUrl(url);
      // Rótulo final = "Cargo — Nome" quando ambos existem, senão o que houver
      setPresidenteNome(nome ? `${cargo} — ${nome}` : cargo);
    })();
  }, []);


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

    const currentData = isDependente && dependenteLogado
      ? { nome: dependenteLogado.nome, cpf: dependenteLogado.cpf, tipo: tipoLabel[dependenteLogado.tipo], isDep: true, assinaturaUrl: dependenteLogado.assinatura_url || null }
      : selectedDependente
        ? { nome: selectedDependente.nome, cpf: selectedDependente.cpf, tipo: tipoLabel[selectedDependente.tipo], isDep: true, assinaturaUrl: selectedDependente.assinatura_url || null }
        : { nome: associado?.nome || '', cpf: associado?.cpf || '', tipo: 'Associado', isDep: false, assinaturaUrl: associado?.assinatura_url || null };



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
            .signature-img {
              height: 8mm;
              max-width: 30mm;
              object-fit: contain;
              margin: 0 auto 0.5mm;
              display: block;
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
                ${presidenteUrl ? `<img src="${presidenteUrl}" class="signature-img" crossorigin="anonymous" />` : ''}
                <div class="signature-line"></div>
                <div class="signature-label">${presidenteNome || 'Presidente'}</div>
              </div>
              <div class="signature">
                ${currentData.assinaturaUrl ? `<img src="${currentData.assinaturaUrl}" class="signature-img" crossorigin="anonymous" />` : ''}
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

  const handleShare = async () => {
    const currentData = isDependente && dependenteLogado
      ? { nome: dependenteLogado.nome, tipo: tipoLabel[dependenteLogado.tipo] }
      : selectedDependente
        ? { nome: selectedDependente.nome, tipo: tipoLabel[selectedDependente.tipo] }
        : { nome: associado?.nome || '', tipo: 'Associado' };

    const text = `Carteirinha SBPM\n${currentData.nome} — ${currentData.tipo}\nMatrícula: ${associado?.matricula}\nValidade: ${dataValidade}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Carteirinha SBPM', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Dados copiados', description: 'As informações foram copiadas para a área de transferência.' });
      }
    } catch (err) {
      // usuário cancelou o share — ignora
    }
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

        <div className="flex flex-col items-center gap-4 w-full">
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
              assinaturaUrl={dependenteLogado.assinatura_url}
              presidenteAssinaturaUrl={presidenteUrl}
              presidenteNome={presidenteNome}
            />

            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4" />
            </div>
          </button>

          <div className="grid grid-cols-1 gap-3 w-full max-w-lg px-0 my-6">
            <Button onClick={handleDownloadPDF} className="w-full h-[54px] bg-[#168a49] hover:bg-[#168a49]/90 text-white rounded-[12px] border-none flex items-center justify-center font-semibold">
              <Download className="h-5 w-5 mr-2" />
              <span className="font-semibold text-base">Baixar (PDF)</span>
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full h-12 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-[10px] border-[rgba(22,163,74,0.46)] hover:bg-green-50 dark:hover:bg-slate-700">
              <Share2 className="h-5 w-5 mr-2" />
              <span className="font-semibold text-base">Compartilhar</span>
            </Button>
          </div>
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
                  assinaturaUrl={dependenteLogado.assinatura_url}
                  presidenteAssinaturaUrl={presidenteUrl}
                  presidenteNome={presidenteNome}
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
    <div className="animate-fade-in lg:space-y-6">
      <div className="px-4 md:px-0 mt-5 md:mt-0 space-y-1 mb-6 lg:mb-0">
        <h2 className="text-[22px] leading-tight md:text-2xl font-bold text-foreground">Carteirinha Digital</h2>
        <p className="text-[13px] md:text-sm leading-snug text-muted-foreground">
          Sua carteirinha de identificação junto à SBPM
        </p>
      </div>


      <div className="grid lg:grid-cols-2 gap-6 px-4 md:px-0">
        {/* Carteirinha Display */}
        <div className="space-y-5 lg:space-y-4">
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
              assinaturaUrl={selectedDependente ? selectedDependente.assinatura_url : associado?.assinatura_url}
              presidenteAssinaturaUrl={presidenteUrl}
              presidenteNome={presidenteNome}
            />

            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4" />
            </div>
          </button>

          <div className="grid grid-cols-1 gap-3 w-full max-w-lg mb-6 lg:mb-0">
            <Button onClick={handleDownloadPDF} className="w-full h-12 bg-[#168a49] hover:bg-[#168a49]/90 text-white rounded-[10px] border-none">
              <Download className="h-5 w-5 mr-2" />
              <span className="font-semibold text-base">Baixar (PDF)</span>
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full h-12 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-[10px] border-[rgba(22,163,74,0.46)] hover:bg-green-50 dark:hover:bg-slate-700">
              <Share2 className="h-5 w-5 mr-2" />
              <span className="font-semibold text-base">Compartilhar</span>
            </Button>
          </div>
        </div>

        {/* Seletor de Pessoa */}
        <Card className="border-none lg:border shadow-none lg:shadow-sm bg-transparent lg:bg-card">
          <CardHeader className="px-0 lg:px-6 pt-0 lg:pt-6 pb-4 lg:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl font-bold">
              <Users className="h-5 w-5" />
              Selecionar Carteirinha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 lg:space-y-2 px-0 lg:px-6 pb-6 lg:pb-6">
            <div className="grid grid-cols-1 gap-3 lg:gap-3">
              <Button
                variant={!selectedDependente ? 'default' : 'outline'}
                className="w-full min-h-[52px] h-auto flex items-center justify-between text-left px-4 py-3 gap-3 border-[1.25px] overflow-hidden"
                onClick={() => setSelectedDependente(null)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <User className="h-5 w-5 shrink-0" />
                  <span className="truncate font-semibold text-sm">{associado.nome}</span>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">Titular</Badge>
              </Button>

              {dependentes.map((dep) => (
                <Button
                  key={dep.id}
                  variant={selectedDependente?.id === dep.id ? 'default' : 'outline'}
                  className="w-full min-h-[52px] h-auto flex items-center justify-between text-left px-4 py-3 gap-3 border-[1.25px] overflow-hidden"
                  onClick={() => setSelectedDependente(dep)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <User className="h-5 w-5 shrink-0" />
                    <span className="truncate font-semibold text-sm">{dep.nome}</span>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">
                    {tipoLabel[dep.tipo]}
                  </Badge>
                </Button>
              ))}

              {dependentes.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-6">
                  Nenhum dependente cadastrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
                nome={selectedDependente?.nome || associado.nome}
                matricula={associado.matricula}
                cpf={selectedDependente?.cpf || associado.cpf}
                tipo={selectedDependente ? 'dependente' : 'titular'}
                tipoParentesco={selectedDependente ? tipoLabel[selectedDependente.tipo] : undefined}
                fotoUrl={selectedDependente ? selectedDependente.foto_url : associado?.foto_url}
                dataExpedicao={dataExpedicao}
                dataValidade={dataValidade}
                nomeTitular={selectedDependente ? associado.nome : undefined}
                assinaturaUrl={selectedDependente ? selectedDependente.assinatura_url : associado?.assinatura_url}
                presidenteAssinaturaUrl={presidenteUrl}
                presidenteNome={presidenteNome}
              />

            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
