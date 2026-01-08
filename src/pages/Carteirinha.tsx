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
  dataAdmissao?: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

function CarteirinhaCard({ nome, matricula, cpf, tipo, tipoParentesco, fotoUrl, dataAdmissao, cardRef }: CarteirinhaCardProps) {
  const formatCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**');
  };

  return (
    <div
      ref={cardRef}
      className="w-full max-w-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/90 px-4 py-3 flex items-center justify-between">
        <img src={sbpmLogo} alt="SBPM" className="h-12 w-12 rounded-full bg-white p-0.5" />
        <div className="text-right">
          <p className="font-bold text-sm">SBPM</p>
          <p className="text-xs opacity-90">Sociedade Beneficente da PM</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-20 h-24 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 opacity-60" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <Badge variant="secondary" className="text-xs mb-1">
              {tipo === 'titular' ? 'TITULAR' : tipoParentesco?.toUpperCase() || 'DEPENDENTE'}
            </Badge>
            <h3 className="font-bold text-lg leading-tight">{nome}</h3>
            <p className="text-sm opacity-90">CPF: {formatCpf(cpf)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/20">
          <div>
            <p className="text-xs opacity-70">Matrícula</p>
            <p className="font-semibold">{matricula}</p>
          </div>
          {dataAdmissao && (
            <div>
              <p className="text-xs opacity-70">Desde</p>
              <p className="font-semibold">
                {format(new Date(dataAdmissao), 'MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary/90 px-4 py-2 text-center">
        <p className="text-xs opacity-80">
          Válido em toda rede credenciada SBPM
        </p>
      </div>
    </div>
  );
}

export default function Carteirinha() {
  const { associado, dependentes } = useAssociado();
  const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    // Simple implementation using browser print
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
            }
            @media print {
              body { background: white; }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
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
            fotoUrl={selectedDependente?.foto_url || associado.foto_url}
            dataAdmissao={!selectedDependente ? associado.data_admissao : undefined}
          />

          <Button onClick={handleDownloadPDF} className="w-full max-w-md">
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
