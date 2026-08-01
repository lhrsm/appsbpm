import { cn } from "../utilities";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Bloco de carregamento base.
 * @example <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

function Wrapper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="w-full">
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Skeleton de card. @example <SkeletonCard count={3} /> */
export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <Wrapper label="Carregando conteúdo">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/** Skeleton de tabela. @example <SkeletonTable rows={6} columns={5} /> */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Wrapper label="Carregando tabela">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex gap-4 border-b bg-muted/50 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 border-b p-4 last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/** Skeleton de perfil. */
export function SkeletonProfile() {
  return (
    <Wrapper label="Carregando perfil">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Wrapper>
  );
}

/** Skeleton de dashboard (header + métricas + conteúdo). */
export function SkeletonDashboard() {
  return (
    <Wrapper label="Carregando painel">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-80" />
        </div>
        <SkeletonCard count={3} />
        <SkeletonTable rows={4} />
      </div>
    </Wrapper>
  );
}

/** Skeleton de lista. */
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <Wrapper label="Carregando lista">
      <ul className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}

/** Skeleton de formulário. */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <Wrapper label="Carregando formulário">
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </Wrapper>
  );
}
