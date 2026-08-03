import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import AvaliacaoParceiro from '@/components/AvaliacaoParceiro';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, MapPin, Phone, Mail, Clock, Search, Star, MessageCircle } from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';

interface Clinica {
  id: string;
  nome: string;
  especialidade: string | null;
  especialidades: string[] | null;
  estado: string | null;
  cidade: string;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  horario_funcionamento: string | null;
  horarios: any;
  logo_url: string | null;
}

export default function Clinicas() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fEstado, setFEstado] = useState('all');
  const [fCidade, setFCidade] = useState('all');
  const [fEsp, setFEsp] = useState('all');
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Clinica | null>(null);

  useEffect(() => {
    try { setFavoritos(new Set(JSON.parse(localStorage.getItem('sbpm_clinicas_fav') || '[]'))); } catch {}
    (async () => {
      const { data } = await supabase.from('clinicas_parceiros').select('*').eq('status', 'ativo').order('cidade');
      setClinicas((data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  const toggleFav = (id: string) => {
    setFavoritos((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('sbpm_clinicas_fav', JSON.stringify([...next]));
      return next;
    });
  };

  const estadosDisp = useMemo(
    () => Array.from(new Set(clinicas.map((c) => c.estado).filter(Boolean))).sort() as string[],
    [clinicas]
  );
  const cidadesDisp = useMemo(() => {
    const src = fEstado === 'all' ? clinicas : clinicas.filter((c) => c.estado === fEstado);
    return Array.from(new Set(src.map((c) => c.cidade))).sort();
  }, [clinicas, fEstado]);
  const espDisp = useMemo(() => {
    let src = clinicas;
    if (fEstado !== 'all') src = src.filter((c) => c.estado === fEstado);
    if (fCidade !== 'all') src = src.filter((c) => c.cidade === fCidade);
    const set = new Set<string>();
    src.forEach((r) => {
      (r.especialidades ?? []).forEach((e) => set.add(e));
      if (r.especialidade) set.add(r.especialidade);
    });
    return Array.from(set).sort();
  }, [clinicas, fEstado, fCidade]);

  const filtered = useMemo(() => {
    return clinicas.filter((c) => {
      if (soFavoritos && !favoritos.has(c.id)) return false;
      if (fEstado !== 'all' && c.estado !== fEstado) return false;
      if (fCidade !== 'all' && c.cidade !== fCidade) return false;
      if (fEsp !== 'all') {
        const lista = [...(c.especialidades ?? []), c.especialidade].filter(Boolean) as string[];
        if (!lista.includes(fEsp)) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!c.nome.toLowerCase().includes(s) && !c.cidade.toLowerCase().includes(s) &&
            !(c.especialidade ?? '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [clinicas, fEstado, fCidade, fEsp, search, soFavoritos, favoritos]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Clínicas e Parceiros</h2>
        <p className="text-muted-foreground">Encontre clínicas e parceiros conveniados</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Estado</Label>
            <Select value={fEstado} onValueChange={(v) => { setFEstado(v); setFCidade('all'); setFEsp('all'); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {estadosDisp.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cidade</Label>
            <Select value={fCidade} onValueChange={(v) => { setFCidade(v); setFEsp('all'); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {cidadesDisp.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Especialidade</Label>
            <Select value={fEsp} onValueChange={setFEsp}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {espDisp.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Buscar</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, cidade..." />
              </div>
              <Button type="button" variant={soFavoritos ? 'default' : 'outline'} size="icon" onClick={() => setSoFavoritos((v) => !v)} aria-label="Favoritos">
                <Star className={`h-4 w-4 ${soFavoritos ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <PageSkeleton rows={6} variant="cards" showHeader={false} />
      ) : filtered.length === 0 ? (
        <Card><CardContent className="pt-6 text-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma clínica encontrada.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="group relative overflow-hidden cursor-pointer border-border/60 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setDetail(c)}
            >
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-start gap-3">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.nome} loading="lazy" decoding="async" className="w-14 h-14 rounded-lg object-contain bg-white border shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{c.nome}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.cidade}{c.estado ? ` / ${c.estado}` : ''}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFav(c.id); }}
                    aria-label="Favoritar"
                    className="p-1 -m-1 rounded-md hover:bg-muted/60 transition-colors"
                  >
                    <Star className={`h-4 w-4 ${favoritos.has(c.id) ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`} />
                  </button>
                </div>

                {(c.especialidades ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(c.especialidades ?? []).slice(0, 3).map((e) => (
                      <Badge key={e} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">{e}</Badge>
                    ))}
                    {(c.especialidades ?? []).length > 3 && (
                      <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">+{(c.especialidades ?? []).length - 3}</Badge>
                    )}
                  </div>
                )}

                <div className="flex-1" />

                {c.whatsapp && (
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">{c.whatsapp}</span>
                    <a
                      href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Sou associado da SBPM.')}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Abrir WhatsApp"
                      className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full px-2.5 py-1 transition-colors shrink-0"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                  <AvaliacaoParceiro clinicaId={c.id} nome={c.nome} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detalhe */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.nome}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                {detail.logo_url && <img src={detail.logo_url} alt="" className="w-24 h-24 rounded object-contain bg-white border" />}
                <div className="flex flex-wrap gap-1">
                  {(detail.especialidades ?? []).map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}
                </div>
                {detail.endereco && <p className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5" />{detail.endereco}, {detail.cidade}{detail.estado ? ` / ${detail.estado}` : ''}</p>}
                {detail.telefone && <p className="flex gap-2"><Phone className="h-4 w-4" /><a className="hover:underline" href={`tel:${detail.telefone}`}>{detail.telefone}</a></p>}
                {detail.email && <p className="flex gap-2"><Mail className="h-4 w-4" /><a className="hover:underline" href={`mailto:${detail.email}`}>{detail.email}</a></p>}
                {detail.horario_funcionamento && <p className="flex gap-2"><Clock className="h-4 w-4" />{detail.horario_funcionamento}</p>}
                {detail.endereco && (
                  <iframe title="Mapa" className="w-full h-56 rounded border"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${detail.endereco}, ${detail.cidade} ${detail.estado ?? ''}`)}&output=embed`} loading="lazy" />
                )}
                {detail.whatsapp && (
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <a href={`https://wa.me/55${detail.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" /> Abrir WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
