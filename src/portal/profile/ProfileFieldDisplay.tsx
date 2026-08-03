import { Database } from "@/integrations/supabase/types";
import { Lock, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SyncStatus = Database["public"]["Enums"]["sync_status"];

interface ProfileFieldDisplayProps {
  label: string;
  value: string | null | undefined;
  status?: SyncStatus;
  isLocked?: boolean;
  onCorrectionRequest?: () => void;
}

export function ProfileFieldDisplay({ 
  label, 
  value, 
  status = 'updated', 
  isLocked = true,
  onCorrectionRequest 
}: ProfileFieldDisplayProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'waiting_validation': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'waiting_sync': return <Clock className="h-3 w-3 text-blue-500" />;
      case 'needs_revision': return <AlertCircle className="h-3 w-3 text-orange-500" />;
      case 'divergent': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'updated': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'waiting_validation': return 'Aguardando validação';
      case 'waiting_sync': return 'Aguardando sincronização';
      case 'needs_revision': return 'Necessita revisão';
      case 'divergent': return 'Divergente';
      case 'updated': return 'Atualizado';
      default: return '';
    }
  };

  return (
    <div className="space-y-1.5 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors group">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          {isLocked && <Lock className="h-3 w-3" />}
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">{getStatusIcon()}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getStatusLabel()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold truncate">
          {value || <span className="text-muted-foreground italic font-normal">Não informado</span>}
        </p>
        {isLocked && onCorrectionRequest && (
          <button 
            onClick={(e) => { e.preventDefault(); onCorrectionRequest(); }}
            className="text-[10px] text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          >
            Solicitar correção
          </button>
        )}
      </div>
    </div>
  );
}
