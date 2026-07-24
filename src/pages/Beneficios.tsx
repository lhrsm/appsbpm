import { useMemo, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Copy, Search, Percent, Tag } from 'lucide-react';
import { toast } from 'sonner';

type Cupom = {
  id: string;
  parceiro: string;
  categoria: string;
  desconto: string;
  descricao: string;
  regras: string;
};

const CATALOGO: Cupom[] = [
  { id: 'FARMA10', parceiro: 'Farmácias Conveniadas', categoria: 'Saúde', desconto: '10%', descricao: 'Desconto em medicamentos de linha.', regras: 'Apresente carteirinha na loja física.' },
  { id: 'OTICA15', parceiro: 'Óticas Parceiras', categoria: 'Saúde', desconto: '15%', descricao: 'Óculos, lentes e armações.', regras: 'Não cumulativo com outras promoções.' },
  { id: 'ODONTO20', parceiro: 'Rede Odonto SBPM', categoria: 'Odontologia', desconto: '20%', descricao: 'Consultas e procedimentos estéticos.', regras: 'Agendamento prévio obrigatório.' },
  { id: 'ACADEMIA', parceiro: 'Academias Conveniadas', categoria: 'Bem-estar', desconto: 'até 30%', descricao: 'Matrícula e mensalidade.', regras: 'Válido para novos alunos.' },
  { id: 'ESCOLA10', parceiro: 'Escolas e Cursos', categoria: 'Educação', desconto: '10%', descricao: 'Cursos livres e idiomas.', regras: 'Apresentar comprovante de vínculo SBPM.' },
  { id: 'AUTO12', parceiro: 'Auto Centros', categoria: 'Automotivo', desconto: '12%', descricao: 'Serviços mecânicos e peças.', regras: 'Peças originais podem ter desconto reduzido.' },
  { id: 'REST08', parceiro: 'Restaurantes Parceiros', categoria: 'Alimentação', desconto: '8%', descricao: 'Almoço executivo de segunda a sexta.', regras: 'Não válido em feriados.' },
  { id: 'PETSHOP', parceiro: 'Pet Shops Conveniados', categoria: 'Pet', desconto: '15%', descricao: 'Banho, tosa e produtos.', regras: 'Consulte a lista de itens elegíveis.' },
];

export default function Beneficios() {
  const { associado } = useAssociado();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<Cupom | null>(null);

  const categorias = useMemo(() => Array.from(new Set(CATALOGO.map((c) => c.categoria))), []);
  const filtered = CATALOGO.filter(
    (c) =>
      (!cat || c.categoria === cat) &&
      (!q || (c.parceiro + c.descricao).toLowerCase().includes(q.toLowerCase())),
  );

  const codigo = (id: string) => `SBPM-${associado?.matricula ?? '000000'}-${id}`;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="h-6 w-6 text-sbpm-green" /> Benefícios e Cupons
        </h1>
        <p className="text-sm text-muted-foreground">
          Descontos exclusivos para associados. Apresente o cupom no estabelecimento parceiro.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar parceiro ou descrição..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            aria-label="Buscar cupons"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={cat === null ? 'default' : 'outline'} onClick={() => setCat(null)}>
            Todas
          </Button>
          {categorias.map((c) => (
            <Button key={c} size="sm" variant={cat === c ? 'default' : 'outline'} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{c.parceiro}</CardTitle>
                <Badge className="bg-sbpm-green">{c.categoria}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              <p className="text-2xl font-bold text-sbpm-green flex items-center gap-1">
                <Percent className="h-5 w-5" /> {c.desconto}
              </p>
              <p className="text-sm text-muted-foreground">{c.descricao}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" onClick={() => setSelected(c)}>
                <QrCode className="h-4 w-4 mr-2" /> Ver cupom
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            Nenhum cupom encontrado.
          </p>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.parceiro}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-center">
                <div className="p-6 bg-muted rounded-lg">
                  <QrCode className="h-32 w-32 mx-auto text-sbpm-green" aria-hidden />
                  <p className="mt-3 font-mono text-lg font-bold tracking-wider">{codigo(selected.id)}</p>
                </div>
                <p className="text-3xl font-bold text-sbpm-green">{selected.desconto} OFF</p>
                <p className="text-sm text-muted-foreground">{selected.regras}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(codigo(selected.id));
                    toast.success('Código copiado!');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar código
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
