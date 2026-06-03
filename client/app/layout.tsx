import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { ConfirmDialogProvider } from "@/components/dialogs/ConfirmDialog"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { cn } from "@/lib/utils"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Daleel",
  description:
    "Humanitarian crisis-management platform for Lebanon — coordinating aid and help requests.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <ConfirmDialogProvider>
            {children}
            <ToastProvider />
          </ConfirmDialogProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
