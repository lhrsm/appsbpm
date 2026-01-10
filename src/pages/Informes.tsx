import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';

export default function Informes() {
  const { informes, associado, dependentes } = useAssociado();

  const handleDownload = (url: string | null, ano: number) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      // Gerar PDF seguindo o modelo SBPM
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Calcular valores fictícios para demonstração
        const valorTitular = (1759.10).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        // Criar linhas de dependentes
        const dependentesRows = dependentes.map(dep => {
          const valorDep = (1465.86).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          return `
            <tr>
              <td>${dep.cpf || '-'}</td>
              <td>${dep.nome}</td>
              <td>R$ ${valorDep}</td>
              <td>Dependente</td>
            </tr>
          `;
        }).join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Informe de Rendimentos ${ano}</title>
              <style>
                @page {
                  size: A4;
                  margin: 20mm;
                }
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                body { 
                  font-family: Arial, sans-serif;
                  font-size: 11pt;
                  line-height: 1.4;
                  color: #333;
                  padding: 20px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .header-title {
                  font-size: 14pt;
                  font-weight: bold;
                  margin-bottom: 8px;
                }
                .header-subtitle {
                  font-size: 9pt;
                  color: #555;
                  margin-bottom: 5px;
                }
                .header-address {
                  font-size: 8pt;
                  color: #666;
                  margin-bottom: 3px;
                }
                .header-contact {
                  font-size: 8pt;
                  color: #666;
                }
                .declaration-title {
                  font-size: 16pt;
                  font-weight: bold;
                  text-align: center;
                  margin: 30px 0 20px 0;
                  text-decoration: underline;
                }
                .declaration-text {
                  text-align: justify;
                  margin-bottom: 25px;
                  line-height: 1.6;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                }
                th, td {
                  border: 1px solid #333;
                  padding: 10px 8px;
                  text-align: left;
                }
                th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                }
                .date-location {
                  text-align: right;
                  margin-top: 40px;
                  font-style: italic;
                }
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="header-title">SOCIEDADE BENEFICENTE DA POLÍCIA MILITAR DO ESTADO DA BAHIA</div>
                <div class="header-subtitle">Fundada em 11 de maio de 1905 e considerada de utilidade pública por lei estadual nº 1.177 de 12/08/1916</div>
                <div class="header-address">Rua General Labatut, nº 46 edf. Cel Octávio Brandão - Barris - Salvador - Ba - Cep.: 40.070-100</div>
                <div class="header-contact">CNPJ: 13.595.996/0001-77 fone: (71) 3328-6911 / 3329-1423 fax: (71) 3328-6180</div>
                <div class="header-contact">site: www.sbpmbahia.com.br / email: contato@sbpmbahia.com.br</div>
              </div>

              <div class="declaration-title">DECLARAÇÃO</div>

              <p class="declaration-text">
                Declara-se para os devidos fins, que o associado(a) contribuiu durante o exercício de ${ano}, 
                para esta Instituição com os valores abaixo especificados, referente ao Benefício Assistencial.
              </p>

              <table>
                <thead>
                  <tr>
                    <th>C.P.F</th>
                    <th>Nome</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${associado?.cpf || '-'}</td>
                    <td>${associado?.nome || '-'}</td>
                    <td>R$ ${valorTitular}</td>
                    <td>Associado Titular</td>
                  </tr>
                  ${dependentesRows}
                </tbody>
              </table>

              <div class="date-location">
                Salvador, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
