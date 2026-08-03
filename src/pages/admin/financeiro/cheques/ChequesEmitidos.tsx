import { useState } from "react";
import { Card, Text, Button, icons, Badge } from "@/design-system";
import { useNavigate } from "react-router-dom";

export default function ChequesEmitidos() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Cheques Emitidos</Text>
          <Text variant="body" className="text-muted-foreground">Histórico e gestão do ciclo de vida.</Text>
        </div>
        <Button variant="primary" leftIcon={icons.adicionar} onClick={() => navigate("../novo")}>Novo Cheque</Button>
      </header>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Nº Cheque</th>
                <th className="px-4 py-3 font-semibold">Favorecido</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Emissão</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { id: 1, num: "000456", favorecido: "Fornecedor de TI Ltda", valor: 1250.40, data: "03/08/2026", status: "Aprovado" },
                { id: 2, num: "000455", favorecido: "Serviços de Manutenção", valor: 890.00, data: "02/08/2026", status: "Impresso" },
                { id: 3, num: "000454", favorecido: "João da Silva", valor: 200.00, data: "01/08/2026", status: "Compensado" },
              ].map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono">{c.num}</td>
                  <td className="px-4 py-3 font-medium">{c.favorecido}</td>
                  <td className="px-4 py-3">R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">{c.data}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'Compensado' ? 'bg-green-100 text-green-700' : 
                      c.status === 'Impresso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={icons.buscar} label="Ver" />
                      <Button variant="ghost" size="sm" icon={icons.imprimir} label="Imprimir" disabled={c.status === 'Compensado'} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
