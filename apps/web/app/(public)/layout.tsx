"use client"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { LoadingBar } from "@/components/loading-bar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <LoadingBar />
      <PublicHeader />
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      <PublicFooter />
      </main>
    </div>
  )
}
