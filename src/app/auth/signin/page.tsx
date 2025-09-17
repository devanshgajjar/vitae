'use client';

import { getProviders, signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()

    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    try {
      await signIn(providerId, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(null)
    }
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return <Mail className="w-5 h-5" />
      case 'github':
        return <Github className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'github':
        return 'bg-gray-900 hover:bg-gray-800 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Vitae</h1>
            <p className="text-gray-600">Sign in to create AI-powered resumes and cover letters</p>
          </div>

          {/* Sign in options */}
          <div className="space-y-4">
            {providers ? (
              Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading === provider.id}
                  className={`w-full h-12 ${getProviderColor(provider.id)}`}
                >
                  {isLoading === provider.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {getProviderIcon(provider.id)}
                      <span className="ml-3">Continue with {provider.name}</span>
                    </>
                  )}
                </Button>
              ))
            ) : (
              <div className="space-y-4">
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center mb-4">What you&apos;ll get:</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>AI-powered resume generation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Job-specific cover letters</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>ATS-optimized formatting</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Multiple profile management</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
