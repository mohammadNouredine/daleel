import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background via-muted/30 to-background px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Lebanon · Humanitarian aid
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Daleel
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Coordinating help requests and connecting communities when it matters
          most.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth"
            className={cn(buttonVariants({ size: "lg" }), "min-w-44")}
          >
            Sign in / Sign up
          </Link>
          <Link
            href="/help-requests"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-w-44",
            )}
          >
            Help requests
          </Link>
        </div>
      </div>
    </div>
  );
}
