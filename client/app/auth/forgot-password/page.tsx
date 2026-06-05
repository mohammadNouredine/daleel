import Link from "next/link"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/auth"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to sign in
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="sr-only">Forgot password</CardTitle>
            <CardDescription className="sr-only">
              Request a password reset email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
