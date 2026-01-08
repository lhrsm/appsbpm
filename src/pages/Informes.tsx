import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';

export default function Informes() {
  const { informes } = useAssociado();

  const handleDownload = (url: string | null, ano: number) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      // Gerar PDF simples para demonstração
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Informe de Rendimentos ${ano}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #1e7a4a; }
                .header { border-bottom: 2px solid #1e7a4a; padding-bottom: 20px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>SBPM - Sociedade Beneficente da PM</h1>
                <h2>Informe de Rendimentos - Ano ${ano}</h2>
              </div>
              <p>Este é um documento de demonstração.</p>
              <p>O informe de rendimentos real estará disponível quando o arquivo for cadastrado no sistema.</p>
              <script>
                setTimeout(() => {
                  window.print();
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Informe de Rendimentos</h2>
        <p className="text-muted-foreground">
          Acesse seus informes de rendimentos anuais para declaração de IR
        </p>
      </div>

      {informes.length > 0 ? (
        <div className="grid gap-4">
          {informes.map((informe) => (
            <Card key={informe.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Informe de Rendimentos
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Ano-calendário {informe.ano}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => handleDownload(informe.arquivo_url, informe.ano)}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Nenhum informe disponível
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Seus informes de rendimentos serão disponibilizados aqui quando estiverem prontos.
                Geralmente são liberados no início de cada ano.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informação adicional */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-accent/10 rounded-lg h-fit">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Sobre o Informe de Rendimentos</h4>
              <p className="text-sm text-muted-foreground mt-1">
                O informe de rendimentos é utilizado para a declaração do Imposto de Renda.
                Ele contém informações sobre contribuições e benefícios recebidos ao longo do ano.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
