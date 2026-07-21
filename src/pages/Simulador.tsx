import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Calculator } from 'lucide-react';

const PATENTES = [
  { value: 'CORONEL', label: 'Coronel', soldo: 2561.83 },
  { value: 'TEN_CEL', label: 'Tenente-Coronel', soldo: 2430.96 },
  { value: 'MAJOR', label: 'Major', soldo: 2325.81 },
  { value: 'CAPITAO', label: 'Capitão', soldo: 2148.53 },
  { value: 'TENENTE', label: 'Tenente', soldo: 1810.29 },
  { value: 'ASPIRANTE', label: 'Aspirante a Oficial', soldo: 1772.26 },
  { value: 'SUBTENENTE', label: 'Subtenente', soldo: 1673.94 },
  { value: 'SARGENTO', label: 'Sargento', soldo: 1660.84 },
  { value: 'CABO', label: 'Cabo', soldo: 1647.44 },
  { value: 'SOLDADO', label: 'Soldado', soldo: 1633.88 },
];

const DEPENDENTES_OPCOES = [
  { label: 'Cônjuge ou Companheiro(a)', perc: 5 },
  { label: 'Filho(a) / Enteado(a) — até 30 anos', perc: 5 },
  { label: 'Filho(a) / Enteado(a) — acima de 30 anos', perc: 8 },
  { label: 'Neto(a) — até 30 anos', perc: 5 },
  { label: 'Neto(a) — acima de 30 anos', perc: 8 },
  { label: 'Bisneto(a) — até 30 anos', perc: 5 },
  { label: 'Bisneto(a) — acima de 30 anos', perc: 8 },
  { label: 'Genro / Nora — até 30 anos', perc: 5 },
  { label: 'Genro / Nora — acima de 30 anos', perc: 8 },
  { label: 'Sobrinho(a) — até 30 anos', perc: 5 },
  { label: 'Sobrinho(a) — acima de 30 anos', perc: 8 },
  { label: 'Irmão / Irmã', perc: 10 },
  { label: 'Cunhado(a)', perc: 10 },
  { label: 'Pai / Mãe', perc: 14 },
  { label: 'Sogro / Sogra', perc: 14 },
  { label: 'Padrasto / Madrasta', perc: 14 },
  { label: 'Avós', perc: 14 },
  { label: 'Tio / Tia', perc: 14 },
];

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface DepRow { parentescoIdx: string }

export default function Simulador() {
  const [patente, setPatente] = useState<string>('');
  const [plano, setPlano] = useState<'5' | '11'>('5');
  const [deps, setDeps] = useState<DepRow[]>([]);

  const soldo = PATENTES.find((p) => p.value === patente)?.soldo ?? 0;
  const titularPerc = plano === '11' ? 11 : 5;

  const depsDetalhe = deps.map((d) => {
    const opt = d.parentescoIdx !== '' ? DEPENDENTES_OPCOES[Number(d.parentescoIdx)] : null;
    return {
      label: opt?.label ?? '—',
      perc: opt?.perc ?? 0,
      valor: opt ? (soldo * opt.perc) / 100 : 0,
    };
  });

  const valorTitular = (soldo * titularPerc) / 100;
  const totalDeps = depsDetalhe.reduce((s, d) => s + d.valor, 0);
  const total = valorTitular + totalDeps;

  const podeSimular = useMemo(() => patente !== '' && deps.every((d) => d.parentescoIdx !== ''), [patente, deps]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" />
          Simulador de Mensalidade
        </h1>
        <p className="text-muted-foreground mt-2">
          Simule o valor da sua contribuição mensal com base na patente, no plano escolhido e nos dependentes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da simulação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patente / Graduação *</Label>
              <Select value={patente} onValueChange={setPatente}>
                <SelectTrigger><SelectValue placeholder="Selecione a patente" /></SelectTrigger>
                <SelectContent>
                  {PATENTES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} — Soldo {brl(p.soldo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plano de contribuição *</Label>
              <RadioGroup value={plano} onValueChange={(v) => setPlano(v as '5' | '11')} className="pt-2">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="5" id="p5" className="mt-1" />
                  <Label htmlFor="p5" className="font-normal cursor-pointer">
                    <strong>5% do soldo</strong> — Sem assistência médica
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="11" id="p11" className="mt-1" />
                  <Label htmlFor="p11" className="font-normal cursor-pointer">
                    <strong>11% do soldo</strong> — Com assistência médica incluída
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Dependentes ({deps.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeps((d) => [...d, { parentescoIdx: '' }])}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar dependente
              </Button>
            </div>

            {deps.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum dependente adicionado.</p>
            )}

            {deps.map((d, i) => (
              <div key={i} className="flex gap-2 items-end p-3 border rounded-md bg-muted/30">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Grau de parentesco *</Label>
                  <Select
                    value={d.parentescoIdx}
                    onValueChange={(v) => setDeps((prev) => prev.map((x, j) => (j === i ? { parentescoIdx: v } : x)))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {DEPENDENTES_OPCOES.map((o, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {o.label} — {o.perc}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeps((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Remover dependente"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {podeSimular && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Resultado da simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md bg-muted">
                <p className="text-muted-foreground">Soldo base</p>
                <p className="text-lg font-semibold">{brl(soldo)}</p>
              </div>
              <div className="p-3 rounded-md bg-muted">
                <p className="text-muted-foreground">Plano escolhido</p>
                <p className="text-lg font-semibold">
                  {titularPerc}% {plano === '11' ? '(com assistência médica)' : '(sem assistência médica)'}
                </p>
              </div>
            </div>

            <div className="border rounded-md divide-y">
              <div className="flex justify-between items-center p-3">
                <span className="font-medium">Titular ({titularPerc}%)</span>
                <span className="font-semibold">{brl(valorTitular)}</span>
              </div>
              {depsDetalhe.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-3 text-sm">
                  <span>Dependente {i + 1} — {d.label} ({d.perc}%)</span>
                  <span>{brl(d.valor)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 bg-primary/10">
                <span className="text-lg font-bold">Total mensal estimado</span>
                <span className="text-2xl font-bold text-primary">{brl(total)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * Valores calculados com base na tabela de soldos vigente a partir de 01/05/2026. Esta simulação é meramente estimativa e não representa a mensalidade oficial cadastrada.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
