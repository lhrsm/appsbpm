import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Clock, Search } from 'lucide-react';

interface Clinica {
  id: string;
  nome: string;
  especialidade: string | null;
  cidade: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  horario_funcionamento: string | null;
  logo_url: string | null;
}

export default function Clinicas() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchClinicas() {
      const { data, error } = await supabase
        .from('clinicas_parceiros')
        .select('*')
        .eq('ativo', true)
        .order('cidade', { ascending: true });

      if (!error && data) {
        setClinicas(data);
      }
      setLoading(false);
    }

    fetchClinicas();
  }, []);

  const filteredClinicas = clinicas.filter((clinica) => {
    const searchLower = search.toLowerCase();
    return (
      clinica.nome.toLowerCase().includes(searchLower) ||
      clinica.cidade.toLowerCase().includes(searchLower) ||
      (clinica.especialidade?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Agrupar por cidade
  const clinicasPorCidade = filteredClinicas.reduce((acc, clinica) => {
    const cidade = clinica.cidade;
    if (!acc[cidade]) {
      acc[cidade] = [];
    }
    acc[cidade].push(clinica);
    return acc;
  }, {} as Record<string, Clinica[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clínicas e Parceiros</h2>
        <p className="text-muted-foreground">
          Encontre clínicas e parceiros conveniados próximos a você
        </p>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, cidade ou especialidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Lista de Clínicas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando clínicas...</p>
        </div>
      ) : Object.keys(clinicasPorCidade).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(clinicasPorCidade).map(([cidade, clinicasDaCidade]) => (
            <div key={cidade}>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {cidade}
                <Badge variant="secondary" className="ml-2">
                  {clinicasDaCidade.length} {clinicasDaCidade.length === 1 ? 'local' : 'locais'}
                </Badge>
              </h3>
              
              <div className="grid gap-4">
                {clinicasDaCidade.map((clinica) => (
                  <Card key={clinica.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {clinica.logo_url ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white border flex items-center justify-center">
                            <img 
                              src={clinica.logo_url} 
                              alt={`Logo ${clinica.nome}`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="p-3 bg-primary/10 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">
                              {clinica.nome}
                            </h4>
                            {clinica.especialidade && (
                              <Badge variant="outline" className="mt-1">
                                {clinica.especialidade}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {clinica.endereco && (
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{clinica.endereco}</span>
                              </div>
                            )}
                            
                            {clinica.telefone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4 shrink-0" />
                                <a 
                                  href={`tel:${clinica.telefone}`} 
                                  className="hover:text-primary transition-colors"
                                >
                                  {clinica.telefone}
                                </a>
                              </div>
                            )}
                            
                            {clinica.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <a 
                                  href={`mailto:${clinica.email}`}
                                  className="hover:text-primary transition-colors truncate"
                                >
                                  {clinica.email}
                                </a>
                              </div>
                            )}
                            
                            {clinica.horario_funcionamento && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 shrink-0" />
                                <span>{clinica.horario_funcionamento}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search 
                  ? 'Nenhuma clínica encontrada para sua busca.' 
                  : 'Nenhuma clínica cadastrada no momento.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
