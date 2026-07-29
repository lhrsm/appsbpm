import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  CircleDashed,
  Wrench,
  Plug,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  LifeBuoy,
  History,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ABAS,
  ARTIGOS,
  AVISOS,
  MODULO_LABEL,
  NIVEIS,
  PERFIS,
  SITUACOES,
  STATUS_MODULOS,
  buscarArtigos,
  type Artigo,
  type Situacao,
} from "@/lib/tutoriais";

const ICONES: Record<string, typeof CheckCircle2> = {
  check: CheckCircle2,
  half: CircleDashed,
  wrench: Wrench,
  plug: Plug,
  clock: Clock,
};

const HIST_KEY = "sbpm.tutoriais.historico";
const FEED_KEY = "sbpm.tutoriais.feedback";

function SituacaoTag({ s, className = "" }: { s: Situacao; className?: string }) {
  const info = SITUACOES[s];
  const Icone = ICONES[info.icon] ?? Info;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
      title={info.hint}
    >
      <Icone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {info.label}
    </span>
  );
}

function ArtigoCard({ artigo, onAbrir }: { artigo: Artigo; onAbrir: (a: Artigo) => void }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary shrink-0" aria-hidden="true">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base leading-snug break-words">{artigo.titulo}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{artigo.resumo}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0 mt-auto">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">{MODULO_LABEL[artigo.modulo] ?? artigo.modulo}</Badge>
          <Badge variant="outline">{NIVEIS[artigo.nivel]}</Badge>
          <SituacaoTag s={artigo.situacao} />
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {artigo.minutos} min
          </span>
        </div>
        <Button variant="outline" size="sm" className="w-full min-h-11" onClick={() => onAbrir(artigo)}>
          Ver tutorial
        </Button>
      </CardContent>
    </Card>
  );
}

function Feedback({ artigo }: { artigo: Artigo }) {
  const [escolha, setEscolha] = useState<"sim" | "nao" | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);

  const registrar = (util: boolean, texto?: string) => {
    try {
      const atual = JSON.parse(localStorage.getItem(FEED_KEY) || "[]");
      atual.push({ id: artigo.id, util, comentario: texto ?? "", data: new Date().toISOString() });
      localStorage.setItem(FEED_KEY, JSON.stringify(atual.slice(-200)));
    } catch {
      /* armazenamento indisponível */
    }
  };

  if (enviado) {
    return <p className="text-sm text-muted-foreground">Obrigado pela sua avaliação. O retorno é anônimo.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Este conteúdo foi útil?</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={escolha === "sim" ? "default" : "outline"}
          size="sm"
          className="min-h-11"
          onClick={() => {
            setEscolha("sim");
            registrar(true);
            setEnviado(true);
            toast.success("Obrigado pelo retorno");
          }}
        >
          <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" /> Sim
        </Button>
        <Button
          variant={escolha === "nao" ? "default" : "outline"}
          size="sm"
          className="min-h-11"
          onClick={() => setEscolha("nao")}
        >
          <ThumbsDown className="h-4 w-4 mr-2" aria-hidden="true" /> Não
        </Button>
      </div>
      {escolha === "nao" && (
        <div className="space-y-2">
          <label htmlFor={`coment-${artigo.id}`} className="text-sm text-muted-foreground">
            Comentário (opcional): informe o que faltou ou está desatualizado.
          </label>
          <Textarea
            id={`coment-${artigo.id}`}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
          />
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => {
              registrar(false, comentario);
              setEnviado(true);
              toast.success("Retorno registrado");
            }}
          >
            Enviar retorno
          </Button>
        </div>
      )}
    </div>
  );
}

function LeitorArtigo({
  artigo,
  onFechar,
  onAbrirRelacionado,
}: {
  artigo: Artigo;
  onFechar: () => void;
  onAbrirRelacionado: (a: Artigo) => void;
}) {
  const [guiado, setGuiado] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const passos = artigo.passos ?? [];
  const relacionados = (artigo.relacionados ?? [])
    .map((id) => ARTIGOS.find((a) => a.id === id))
    .filter(Boolean) as Artigo[];

  useEffect(() => {
    setGuiado(false);
    setEtapa(0);
  }, [artigo.id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{MODULO_LABEL[artigo.modulo] ?? artigo.modulo}</Badge>
        <Badge variant="outline">{artigo.categoria}</Badge>
        <Badge variant="outline">{NIVEIS[artigo.nivel]}</Badge>
        <SituacaoTag s={artigo.situacao} />
        <span className="text-muted-foreground">Perfil: {artigo.perfil}</span>
        <span className="text-muted-foreground">{artigo.minutos} min</span>
        <span className="text-muted-foreground">Atualizado em {artigo.atualizado}</span>
      </div>

      <p className="text-sm text-muted-foreground">{artigo.resumo}</p>

      {artigo.nota && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Explicação institucional</AlertTitle>
          <AlertDescription>{artigo.nota}</AlertDescription>
        </Alert>
      )}

      {artigo.prerequisitos && artigo.prerequisitos.length > 0 && (
        <section aria-labelledby={`pre-${artigo.id}`}>
          <h3 id={`pre-${artigo.id}`} className="text-sm font-semibold mb-2">
            Pré-requisitos
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {artigo.prerequisitos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {passos.length > 0 && (
        <section aria-labelledby={`passos-${artigo.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 id={`passos-${artigo.id}`} className="text-sm font-semibold">
              Passo a passo
            </h3>
            <Button variant="outline" size="sm" className="min-h-11" onClick={() => setGuiado((g) => !g)}>
              {guiado ? "Ver conteúdo completo" : "Ver em modo guiado"}
            </Button>
          </div>

          {!guiado ? (
            <ol className="space-y-3">
              {passos.map((p, i) => (
                <li key={p.titulo} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.titulo}</p>
                    <p className="text-sm text-muted-foreground">{p.descricao}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Etapa {etapa + 1} de {passos.length}
                </p>
                <Progress value={((etapa + 1) / passos.length) * 100} aria-label="Progresso do tutorial" />
              </div>
              <div aria-live="polite">
                <p className="font-medium">{passos[etapa].titulo}</p>
                <p className="text-sm text-muted-foreground mt-1">{passos[etapa].descricao}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Imagem do tutorial será adicionada posteriormente.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  disabled={etapa === 0}
                  onClick={() => setEtapa((e) => Math.max(0, e - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Voltar
                </Button>
                {etapa < passos.length - 1 ? (
                  <Button size="sm" className="min-h-11" onClick={() => setEtapa((e) => e + 1)}>
                    Próxima etapa <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="min-h-11"
                    onClick={() => {
                      setGuiado(false);
                      toast.success("Tutorial concluído");
                    }}
                  >
                    Concluir
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {artigo.observacoes && artigo.observacoes.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">Observações</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {artigo.observacoes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      {artigo.alertas && artigo.alertas.length > 0 && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              {artigo.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {artigo.resultado && (
        <section>
          <h3 className="text-sm font-semibold mb-1">Resultado esperado</h3>
          <p className="text-sm text-muted-foreground">{artigo.resultado}</p>
        </section>
      )}

      {artigo.problemas && artigo.problemas.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">Problemas comuns</h3>
          <Accordion type="single" collapsible className="w-full">
            {artigo.problemas.map((p, i) => (
              <AccordionItem key={p.p} value={`p-${i}`}>
                <AccordionTrigger className="text-sm text-left">{p.p}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{p.r}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {relacionados.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-2">Tutoriais relacionados</h3>
          <div className="flex flex-wrap gap-2">
            {relacionados.map((r) => (
              <Button
                key={r.id}
                variant="secondary"
                size="sm"
                className="min-h-11"
                onClick={() => onAbrirRelacionado(r)}
              >
                {r.titulo}
              </Button>
            ))}
          </div>
        </section>
      )}

      <Separator />
      <Feedback artigo={artigo} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="min-h-11" onClick={() => toast.success("Solicitação registrada para a equipe editorial")}>
          Informar conteúdo desatualizado
        </Button>
        <Button variant="outline" size="sm" className="min-h-11" onClick={() => toast.success("Pedido de novo tutorial registrado")}>
          Solicitar novo tutorial
        </Button>
        <Button variant="ghost" size="sm" className="min-h-11" onClick={onFechar}>
          <X className="h-4 w-4 mr-1" aria-hidden="true" /> Fechar
        </Button>
      </div>
    </div>
  );
}

export default function AdminTutoriais() {
  const [aba, setAba] = useState("visao-geral");
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("todos");
  const [nivel, setNivel] = useState("todos");
  const [situacao, setSituacao] = useState("todos");
  const [modulo, setModulo] = useState("todos");
  const [aberto, setAberto] = useState<Artigo | null>(null);
  const [pagina, setPagina] = useState(1);
  const [historico, setHistorico] = useState<string[]>([]);

  const POR_PAGINA = 12;

  useEffect(() => {
    const t = setTimeout(() => setBusca(termo), 250);
    return () => clearTimeout(t);
  }, [termo]);

  useEffect(() => {
    try {
      setHistorico(JSON.parse(localStorage.getItem(HIST_KEY) || "[]"));
    } catch {
      setHistorico([]);
    }
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, perfil, nivel, situacao, modulo, aba]);

  const abrir = (a: Artigo) => {
    setAberto(a);
    setHistorico((h) => {
      const novo = [a.id, ...h.filter((x) => x !== a.id)].slice(0, 8);
      try {
        localStorage.setItem(HIST_KEY, JSON.stringify(novo));
      } catch {
        /* ignora */
      }
      return novo;
    });
  };

  const buscando = busca.trim().length > 0 || modulo !== "todos";

  const resultados = useMemo(
    () =>
      buscarArtigos(busca, {
        modulo: buscando ? modulo : aba,
        perfil,
        nivel,
        situacao,
      }),
    [busca, modulo, aba, perfil, nivel, situacao, buscando],
  );

  const paginados = resultados.slice(0, pagina * POR_PAGINA);

  const categorias = useMemo(() => {
    const mapa = new Map<string, Artigo[]>();
    paginados.forEach((a) => {
      const lista = mapa.get(a.categoria) ?? [];
      lista.push(a);
      mapa.set(a.categoria, lista);
    });
    return [...mapa.entries()];
  }, [paginados]);

  const destaques = useMemo(
    () => ARTIGOS.filter((a) => ["vg-acesso", "fin-despesa", "pat-inventario", "int-importar"].includes(a.id)),
    [],
  );

  const recentes = historico
    .map((id) => ARTIGOS.find((a) => a.id === id))
    .filter(Boolean) as Artigo[];

  const limpar = () => {
    setTermo("");
    setBusca("");
    setPerfil("todos");
    setNivel("todos");
    setSituacao("todos");
    setModulo("todos");
  };

  const aviso = AVISOS[buscando ? modulo : aba];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
          Tutoriais e Central de Ajuda
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Consulte orientações sobre a utilização dos módulos, funcionalidades e serviços disponíveis no Portal da SBPM.
        </p>
      </header>

      {/* Busca e filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar tutorial"
              aria-label="Pesquisar tutorial"
              className="pl-9 h-11"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="h-11" aria-label="Filtrar por módulo">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os módulos</SelectItem>
                {ABAS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={perfil} onValueChange={setPerfil}>
              <SelectTrigger className="h-11" aria-label="Filtrar por perfil">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                {PERFIS.filter((p) => p !== "Todos os perfis").map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger className="h-11" aria-label="Filtrar por nível">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os níveis</SelectItem>
                {Object.entries(NIVEIS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={situacao} onValueChange={setSituacao}>
              <SelectTrigger className="h-11" aria-label="Filtrar por situação">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as situações</SelectItem>
                {Object.entries(SITUACOES).map(([v, i]) => (
                  <SelectItem key={v} value={v}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11" onClick={limpar}>
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" /> Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas de módulos */}
      <div role="tablist" aria-label="Módulos da central de ajuda" className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            id={`tab-${a.id}`}
            aria-selected={!buscando && aba === a.id}
            aria-controls="painel-tutoriais"
            onClick={() => {
              setModulo("todos");
              setBusca("");
              setTermo("");
              setAba(a.id);
            }}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              !buscando && aba === a.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {a.titulo}
          </button>
        ))}
      </div>

      <div id="painel-tutoriais" role="tabpanel" aria-labelledby={`tab-${aba}`} className="space-y-6">
        {aviso && (
          <Alert>
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Aviso do módulo</AlertTitle>
            <AlertDescription>{aviso}</AlertDescription>
          </Alert>
        )}

        {!buscando && aba === "visao-geral" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Conheça o Portal da SBPM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  O Portal da SBPM é uma ferramenta integrada de gestão administrativa, desenvolvida para reunir
                  informações, serviços e processos institucionais em um único ambiente.
                </p>
                <p>
                  A solução possui uma área externa destinada aos associados e dependentes e uma área administrativa
                  interna destinada aos setores e colaboradores autorizados da instituição.
                </p>
              </CardContent>
            </Card>

            <section aria-labelledby="situacao-modulos" className="space-y-3">
              <h2 id="situacao-modulos" className="text-lg font-semibold">
                Situação dos módulos
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {STATUS_MODULOS.map((m) => (
                  <Card key={m.nome}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{m.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <SituacaoTag s={m.situacao} />
                      <p className="text-sm text-muted-foreground">{m.nota}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-labelledby="destaques" className="space-y-3">
              <h2 id="destaques" className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" /> Tutoriais em destaque
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {destaques.map((a) => (
                  <ArtigoCard key={a.id} artigo={a} onAbrir={abrir} />
                ))}
              </div>
            </section>

            {recentes.length > 0 && (
              <section aria-labelledby="recentes" className="space-y-3">
                <h2 id="recentes" className="text-lg font-semibold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" aria-hidden="true" /> Acessados recentemente
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentes.map((a) => (
                    <Button key={a.id} variant="secondary" size="sm" className="min-h-11" onClick={() => abrir(a)}>
                      {a.titulo}
                    </Button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Lista de tutoriais */}
        {(buscando || aba !== "faq") && (
          <section aria-labelledby="lista-tutoriais" className="space-y-4">
            <h2 id="lista-tutoriais" className="text-lg font-semibold">
              {buscando ? `Resultados da busca (${resultados.length})` : "Tutoriais do módulo"}
            </h2>
            {resultados.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum tutorial encontrado com os filtros aplicados. Ajuste a pesquisa ou limpe os filtros.
              </p>
            ) : (
              categorias.map(([cat, itens]) => (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {itens.map((a) => (
                      <ArtigoCard key={a.id} artigo={a} onAbrir={abrir} />
                    ))}
                  </div>
                </div>
              ))
            )}
            {paginados.length < resultados.length && (
              <Button variant="outline" className="min-h-11" onClick={() => setPagina((p) => p + 1)}>
                Carregar mais tutoriais
              </Button>
            )}
          </section>
        )}

        {/* FAQ em accordion */}
        {!buscando && aba === "faq" && (
          <section aria-labelledby="faq-lista" className="space-y-3">
            <h2 id="faq-lista" className="text-lg font-semibold">
              Perguntas frequentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {resultados.map((a) => (
                <AccordionItem key={a.id} value={a.id}>
                  <AccordionTrigger className="text-left text-sm">{a.titulo}</AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{a.nota ?? a.resumo}</p>
                    <Button variant="link" size="sm" className="px-0" onClick={() => abrir(a)}>
                      Abrir conteúdo completo
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Suporte */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" /> Precisa de ajuda?
            </CardTitle>
            <CardDescription>Canais oficiais de atendimento da instituição.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            <a className="underline underline-offset-4" href="https://wa.me/5571985496972" target="_blank" rel="noreferrer">
              Previdência: (71) 98549-6972
            </a>
            <span aria-hidden="true" className="text-muted-foreground">•</span>
            <a className="underline underline-offset-4" href="https://wa.me/5571987943414" target="_blank" rel="noreferrer">
              Assistência à Saúde: (71) 98794-3414
            </a>
            <span aria-hidden="true" className="text-muted-foreground">•</span>
            <a className="underline underline-offset-4" href="mailto:contato@sbpmbahia.com.br">
              contato@sbpmbahia.com.br
            </a>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6 text-left">{aberto.titulo}</DialogTitle>
                <DialogDescription className="text-left">
                  {MODULO_LABEL[aberto.modulo]} · {aberto.categoria}
                </DialogDescription>
              </DialogHeader>
              <LeitorArtigo artigo={aberto} onFechar={() => setAberto(null)} onAbrirRelacionado={abrir} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
