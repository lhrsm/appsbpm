import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, Eye, 
  Search
} from 'lucide-react';
import { toast } from 'sonner';

type CorrectionStatus = Database["public"]["Enums"]["correction_request_status"];

export default function AdminSolicitacoes() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: solicitacoes, isLoading, refetch } = useQuery({
    queryKey: ['admin-solicitacoes', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('data_correction_requests')
        .select(`
          *,
          associados(nome, matricula),
          dependentes(nome)
        `)
        .order('requested_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as CorrectionStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleStatusChange = async (id: string, newStatus: CorrectionStatus) => {
    try {
      const { error } = await supabase
        .from('data_correction_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status atualizado com sucesso!');
      refetch();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  };

  const getStatusBadge = (status: CorrectionStatus) => {
    switch (status) {
      case 'sent': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Enviada</Badge>;
      case 'analyzing': return <Badge variant="secondary" className="gap-1"><Search className="h-3 w-3" /> Em análise</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle2 className="h-3 w-3" /> Aprovada</Badge>;
      case 'rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitada</Badge>;
      case 'waiting_sync': return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500"><Clock className="h-3 w-3" /> Sincronizando</Badge>;
      case 'synced': return <Badge variant="default" className="gap-1 bg-blue-500"><CheckCircle2 className="h-3 w-3" /> Sincronizada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Solicitações de Correção</h1>
          <p className="text-muted-foreground text-sm">Gerencie pedidos de alteração de dados oficiais</p>
        </div>
        <div className="flex items-center gap-2">
           <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="sent">Enviadas</SelectItem>
                <SelectItem value="analyzing">Em Análise</SelectItem>
                <SelectItem value="approved">Aprovadas</SelectItem>
                <SelectItem value="rejected">Rejeitadas</SelectItem>
              </SelectContent>
           </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Novo Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Carregando...</TableCell></TableRow>
              ) : solicitacoes?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.protocol}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{(s.associados as any)?.nome || (s.dependentes as any)?.nome}</span>
                      <span className="text-[10px] text-muted-foreground">{(s.associados as any)?.matricula || 'Dependente'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{s.field_key.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={s.new_value}>{s.new_value}</TableCell>
                  <TableCell>{new Date(s.requested_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getStatusBadge(s.status as CorrectionStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toast.info('Detalhes em breve')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select 
                        onValueChange={(val) => handleStatusChange(s.id, val as CorrectionStatus)}
                        defaultValue={s.status as string}
                      >
                        <SelectTrigger className="w-[32px] h-[32px] p-0 border-none bg-transparent">
                           <span className="sr-only">Alterar status</span>
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="analyzing">Analisar</SelectItem>
                           <SelectItem value="approved">Aprovar</SelectItem>
                           <SelectItem value="rejected">Rejeitar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {solicitacoes?.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Nenhuma solicitação encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
