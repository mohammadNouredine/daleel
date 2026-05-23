import Link from "next/link"
import { cn } from "@/lib/utils"

type PageShellProps = {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
  size?: "default" | "wide"
}

export function PageShell({
  title,
  description,
  children,
  className,
  headerAction,
  size = "default",
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
      <main
        className={cn(
          "relative z-10 mx-auto flex w-full flex-1 flex-col px-6 py-16",
          size === "wide" ? "max-w-4xl" : "max-w-2xl"
        )}
      >
        <Link
          href="/"
          className="mb-8 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </Link>
        <header className="mb-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {headerAction}
        </header>
        {children}
      </main>
    </div>
  )
}
