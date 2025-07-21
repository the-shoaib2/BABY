"use client"

import { Suspense } from "react"
import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
