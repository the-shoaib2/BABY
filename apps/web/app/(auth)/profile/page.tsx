import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/profile/profile-form"
import { AppearanceForm } from "@/components/profile/appearance-form"
import { SecurityForm } from "@/components/profile/security-form"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account information, appearance preferences, and security options.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full mb-4" />}>
        <ProfileForm user={user} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-64 w-full mb-4" />}>
        <AppearanceForm user={user} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-64 w-full mb-4" />}>
        <SecurityForm user={user} />
      </Suspense>
    </div>
  )
}
