import { cn } from "@/lib/utils";
import { Skeleton } from "@/design-system/components/Skeleton";

/** Skeleton de card genérico (mesma altura do conteúdo real). */
export function CardSkeleton({ className, lines = 2 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-[16px] border bg-card p-4 ds-shadow-sm", className)} aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i % 2 === 0 ? "w-full" : "w-4/5")} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton do conteúdo interno de um StatCard. */
export function StatCardSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Skeleton de indicador completo. */
export function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[16px] border bg-card p-4 ds-shadow-sm space-y-3", className)} aria-hidden>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

/** Skeleton de lista (documentos, solicitações, pessoas). */
export function ListSkeleton({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-[14px] border bg-card p-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton de linha de tabela. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 rounded-lg border bg-card p-3">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "max-w-[35%]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton de timeline. */
export function TimelineSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4 pl-6" aria-hidden>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton de formulário. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
  );
}

/** Skeleton de grade de cards. */
export function GridSkeleton({ items = 4, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)} aria-hidden>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} lines={1} />
      ))}
    </div>
  );
}
