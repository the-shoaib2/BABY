"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { toast } from "react-hot-toast"
import { Code2, Loader2 } from "lucide-react"
import { FaGithub, FaApple, FaMicrosoft } from 'react-icons/fa'
import { useSession } from "next-auth/react"

export default function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const searchParams = useSearchParams()

  // Check for error parameters
  const error = searchParams?.get('error')
  
  // Show error message if session expired
  useEffect(() => {
    if (error === 'session_expired') {
      toast.error('Your session has expired. Please sign in again.')
    }
  }, [error])

  // Redirect if authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleProviderSignIn = async (provider: string, setLoading: (v: boolean) => void) => {
    try {
      setLoading(true)
      await signIn(provider, { callbackUrl: '/profile', redirect: true })
    } catch (error) {
      toast.error(`Failed to sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="mb-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Code2 className="h-6 w-6" />
          <span className="text-xl">B.A.B.Y.</span>
        </Link>
      </div>

      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center text-xs">
            Sign in with a provider to access your account
          </CardDescription>

          <div className="py-4 space-y-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isGoogleLoading}
              onClick={() => handleProviderSignIn('google', setIsGoogleLoading)}
            >
              {isGoogleLoading ? (
                <>
                  {React.createElement(Loader2 as unknown as React.ElementType, { className: "mr-2 h-4 w-4 animate-spin" })}
                  <span>Google</span>
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isGithubLoading}
              onClick={() => handleProviderSignIn('github', setIsGithubLoading)}
            >
              {isGithubLoading ? (
                <>
                  {React.createElement(Loader2 as unknown as React.ElementType, { className: "mr-2 h-4 w-4 animate-spin" })}
                  <span>GitHub</span>
                </>
              ) : (
                <>
                  {React.createElement(FaGithub as unknown as React.ElementType, { className: "mr-2 h-4 w-4" })}
                  GitHub
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isAppleLoading}
              onClick={() => handleProviderSignIn('apple', setIsAppleLoading)}
            >
              {isAppleLoading ? (
                <>
                  {React.createElement(Loader2 as unknown as React.ElementType, { className: "mr-2 h-4 w-4 animate-spin" })}
                  <span>Apple</span>
                </>
              ) : (
                <>
                  {React.createElement(FaApple as unknown as React.ElementType, { className: "mr-2 h-4 w-4" })}
                  Apple
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isMicrosoftLoading}
              onClick={() => handleProviderSignIn('microsoft', setIsMicrosoftLoading)}
            >
              {isMicrosoftLoading ? (
                <>
                  {React.createElement(Loader2 as unknown as React.ElementType, { className: "mr-2 h-4 w-4 animate-spin" })}
                  <span>Microsoft</span>
                </>
              ) : (
                <>
                  {React.createElement(FaMicrosoft as unknown as React.ElementType, { className: "mr-2 h-4 w-4" })}
                  Microsoft
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
