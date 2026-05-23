import Link from "next/link"
import { cn } from "@/lib/utils"

type PageShellProps = {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col bg-gradient-to-br from-background via-muted/20 to-background",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
        aria-hidden
      />
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
        <Link
          href="/"
          className="mb-8 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </Link>
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-muted-foreground">{description}</p>
          ) : null}
        </header>
        {children}
      </main>
    </div>
  )
}
