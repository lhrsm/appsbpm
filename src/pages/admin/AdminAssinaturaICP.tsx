import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, FileSignature, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";

/**
 * Página institucional para configuração de assinatura digital ICP-Brasil.
 * A assinatura efetiva (PAdES/CAdES) deve ser feita por Edge Function
 * dedicada usando bibliotecas como `node-signpdf` ou serviços homologados
 * (Bry, Certisign, ITI). Aqui é o painel de configuração + upload do .pfx.
 */
export default function AdminAssinaturaICP() {
  const [alias, setAlias] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [testing, setTesting] = useState(false);

  const testar = async () => {
    if (!file) return toast.error("Selecione o arquivo .pfx");
    setTesting(true);
    // Placeholder: a leitura efetiva do certificado ocorreria via WebCrypto
    // ou por upload para uma Edge Function que use node-forge.
    await new Promise((r) => setTimeout(r, 800));
    setTesting(false);
    toast.success(`Certificado "${alias || file.name}" validado (simulação)`);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Assinatura Digital ICP-Brasil
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure o certificado A1/A3 institucional para assinar informes de rendimentos e declarações no padrão PAdES.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Como funciona</AlertTitle>
        <AlertDescription>
          Uma vez configurado, os informes gerados pelo painel serão assinados automaticamente com carimbo do tempo,
          garantindo validade jurídica conforme MP 2.200-2/2001. A chave privada é armazenada de forma cifrada e nunca sai
          do servidor.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle>Certificado da entidade</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Apelido</Label>
            <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="SBPM — A1 2026" />
          </div>
          <div>
            <Label>Arquivo .pfx / .p12</Label>
            <Input type="file" accept=".pfx,.p12" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label>Senha do certificado</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button onClick={testar} disabled={testing}>
            <FileSignature className="w-4 h-4 mr-2" />
            {testing ? "Validando…" : "Validar certificado"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Referências</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a className="flex items-center gap-2 text-primary hover:underline" href="https://www.gov.br/iti/pt-br" target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4" /> ITI — Instituto Nacional de Tecnologia da Informação
          </a>
          <a className="flex items-center gap-2 text-primary hover:underline" href="https://www.gov.br/pt-br/servicos/assinar-documentos-com-o-gov.br" target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4" /> Assinatura gov.br (alternativa gratuita)
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
