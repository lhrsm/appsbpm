import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto do cabeçalho do portal. */
export function HeaderSkeleton() {
  return (
    <div className="flex h-16 items-center gap-3 border-b bg-primary px-4">
      <Skeleton className="h-9 w-9 rounded-full bg-primary-foreground/20" />
      <Skeleton className="h-4 w-40 bg-primary-foreground/20" />
      <Skeleton className="ml-auto h-9 w-9 rounded-full bg-primary-foreground/20" />
    </div>
  );
}

/** Esqueleto da sidebar. */
export function SidebarSkeleton() {
  return (
    <div className="hidden w-64 shrink-0 space-y-2 border-r bg-card p-3 md:block">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

/** Esqueleto de breadcrumbs + cabeçalho de página. */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

/** Esqueleto do conteúdo principal. */
export function ContentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Esqueleto da central de notificações. */
export function NotificationsSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Esqueleto completo do layout, exibido enquanto a sessão carrega. */
export function PortalLayoutSkeleton() {
  return (
    <div className="min-h-dvh w-full bg-background">
      <HeaderSkeleton />
      <div className="flex">
        <SidebarSkeleton />
        <div className="flex-1 space-y-6 p-4 md:p-6">
          <PageHeaderSkeleton />
          <ContentSkeleton />
        </div>
      </div>
    </div>
  );
}
