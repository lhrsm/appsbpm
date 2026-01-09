import { useState, useRef } from 'react';
import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, User, Users } from 'lucide-react';
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
      className="w-full max-w-lg bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header com Logo e Título */}
      <div className="flex items-start p-4 border-b border-gray-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <img 
              src={sbpmLogo} 
              alt="SANITAS" 
              className="h-16 w-16 object-contain"
            />
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
  const { associado, dependentes } = useAssociado();
  const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !cardRef.current) return;

    const cardHtml = cardRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carteirinha SBPM</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              background: #f5f5f5;
              font-family: Arial, sans-serif;
            }
            @media print {
              body { background: white; }
            }
          </style>
        </head>
        <body>
          ${cardHtml}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!associado) return null;

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
          <CarteirinhaCard
            cardRef={cardRef}
            nome={selectedDependente?.nome || associado.nome}
            matricula={associado.matricula}
            cpf={selectedDependente?.cpf || associado.cpf}
            tipo={selectedDependente ? 'dependente' : 'titular'}
            tipoParentesco={selectedDependente ? tipoLabel[selectedDependente.tipo] : undefined}
            dataExpedicao={dataExpedicao}
            dataValidade={dataValidade}
            nomeTitular={selectedDependente ? associado.nome : undefined}
          />

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
    </div>
  );
}
