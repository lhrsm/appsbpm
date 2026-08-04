import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PrivacyConsentActionsProps {
  onAccept: () => void;
  onEssential: () => void;
  isSaving: boolean;
}

export function PrivacyConsentActions({ onAccept, onEssential, isSaving }: PrivacyConsentActionsProps) {
  return (
    <div className="flex flex-col gap-2.5 mt-2">
      <Button 
        className="w-full h-11 sm:h-12 rounded-xl text-[14px] sm:text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        onClick={onAccept}
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Aceitar e continuar"}
      </Button>
      <Button
        variant="outline"
        className={cn(
          "w-full h-11 sm:h-12 rounded-xl text-[14px] sm:text-sm font-semibold",
          "portal-glass-button-secondary"
        )}
        onClick={onEssential}
        disabled={isSaving}
      >
        Apenas essenciais
      </Button>
    </div>
  );
}
