import { useEffect, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Search, FolderOpen } from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';

const CATEGORIA_LABEL: Record<string, string> = {
  contratual: 'Contratual',
  financeiro: 'Financeiro',
  medico: 'Médico',
  declaracao: 'Declaração',
  comprovante: 'Comprovante',
  outros: 'Outros',
};

const CATEGORIA_COLOR: Record<string, string> = {
  contratual: 'bg-blue-500',
  financeiro: 'bg-green-600',
  medico: 'bg-red-500',
  declaracao: 'bg-purple-500',
  comprovante: 'bg-yellow-600',
  outros: 'bg-gray-500',
};

export default function MeusDocumentos() {
  const { associado, isDependente, dependenteLogado } = useAssociado();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('todos');

  useEffect(() => {
    if (!associado) return;
    (async () => {
      setLoading(true);
      let q = supabase
        .from('documentos_associado')
        .select('*')
        .eq('associado_id', associado.id)
        .eq('ativo', true);
      if (isDependente && dependenteLogado) {
        q = q.or(`visibilidade.eq.todos,dependente_id.eq.${dependenteLogado.id}`);
      }
      const { data } = await q.order('publicado_em', { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, [associado?.id]);

  const download = async (doc: any) => {
    const { data, error } = await supabase.storage.from('documentos').createSignedUrl(doc.arquivo_path, 60);
    if (error || !data) return toast.error('Não foi possível baixar');
    window.open(data.signedUrl, '_blank');
  };

  const filtered = items.filter(d => {
    if (cat !== 'todos' && d.categoria !== cat) return false;
    if (search && !`${d.titulo} ${d.descricao || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6 text-primary" /> Meus Documentos</h1>
        <p className="text-muted-foreground text-sm">Contratos, declarações e comprovantes disponibilizados pelo SBPM</p>
      </div>

      <Card><CardContent className="p-4 grid md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar documento..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent></Card>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          Nenhum documento disponível ainda.
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-md transition">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={`${CATEGORIA_COLOR[d.categoria]} text-white text-xs`}>{CATEGORIA_LABEL[d.categoria]}</Badge>
                    {d.dependente_id && <Badge variant="outline" className="text-xs">Dependente</Badge>}
                  </div>
                  <p className="font-semibold truncate">{d.titulo}</p>
                  {d.descricao && <p className="text-sm text-muted-foreground line-clamp-2">{d.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(d.publicado_em), "dd/MM/yyyy", { locale: ptBR })}
                    {d.arquivo_tamanho && ` • ${(d.arquivo_tamanho / 1024).toFixed(0)} KB`}
                  </p>
                </div>
                <Button size="sm" onClick={() => download(d)}><Download className="w-4 h-4 mr-1" /> Baixar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
