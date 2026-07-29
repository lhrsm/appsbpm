import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { AVISO_ESTRUTURA } from '@/lib/contabilidade';

export default function AvisoEstrutura() {
  return (
    <Alert className="border-primary/40 bg-primary/5">
      <Info className="h-4 w-4 text-primary" aria-hidden="true" />
      <AlertTitle>Módulo em estruturação</AlertTitle>
      <AlertDescription>{AVISO_ESTRUTURA}</AlertDescription>
    </Alert>
  );
}
