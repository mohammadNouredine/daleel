import { DashboardAuthProvider } from "@/features/dashboard/providers/DashboardAuthProvider"
import { DashboardLayout } from "@/features/dashboard/layout/DashboardLayout"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardAuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardAuthProvider>
  )
}
