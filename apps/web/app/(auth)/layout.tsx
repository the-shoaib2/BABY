import type React from "react"
import { authOptions } from "@/lib/auth/auth"
import { getServerSession } from "next-auth"

import { ToastProvider } from "@/components/providers/toast-provider"
import { PublicHeader } from "@/components/public-header"
import { LoadingBar } from "@/components/loading-bar"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)
  
  // If no session, redirect to login instead of throwing error
  // This handles the transition from JWT to database sessions
  if (!session) {
    redirect('/login?error=session_expired')
  }

  return (
    <>
      <LoadingBar />
      <div className="flex h-screen w-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <PublicHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ToastProvider />
    </>
  )
}
