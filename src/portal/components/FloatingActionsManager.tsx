
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionsManagerProps {
  profileType: 'associate' | 'dependent';
}

export default function FloatingActionsManager({ profileType }: FloatingActionsManagerProps) {
  const whatsappNumber = '5585988887777';
  const whatsappMessage = `Olá! Sou ${profileType === 'associate' ? 'associado' : 'dependente'} da SBPM e gostaria de suporte.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="mobile-floating-actions fixed flex flex-col gap-3 z-50"
      style={{
        right: '16px',
        bottom: `calc(var(--mobile-bottom-nav-height, 68px) + env(safe-area-inset-bottom) + 16px)`,
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'whatsapp-button',
          'w-13 h-13 flex-shrink-0',
          'rounded-full',
          'bg-green-500 hover:bg-green-600',
          'text-white',
          'flex items-center justify-center',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-200',
          'active:scale-95'
        )}
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
