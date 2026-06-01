import Link from "next/link"
import { DaleelLogo } from "./DaleelLogo"

const FOOTER_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#housing-listings", label: "Housing" },
  { href: "/help-requests", label: "Help Requests" },
  { href: "/auth", label: "Sign In" },
] as const

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Contact" },
] as const

export function HomeFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs space-y-3">
            <DaleelLogo showTagline />
            <p className="text-sm text-muted-foreground">
              A community marketplace for shelter, housing, and humanitarian
              support across Lebanon.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Platform
              </p>
              <ul className="mt-3 space-y-2">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                About
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-foreground/80 hover:text-foreground hover:underline"
                  >
                    About Daleel
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Legal
              </p>
              <ul className="mt-3 space-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Daleel. Built for communities in need.
        </p>
      </div>
    </footer>
  )
}
