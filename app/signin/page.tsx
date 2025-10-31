"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"
import { Mail, Lock } from "lucide-react"

export default function SignInPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in with:", email, password)
    // Add authentication logic here
    // Set authentication flag
    localStorage.setItem("isAuthenticated", "true")
    
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem("onboardingComplete")
    
    // Redirect to onboarding if not completed, otherwise to dashboard
    if (onboardingComplete) {
      window.location.href = "/dashboard"
    } else {
      window.location.href = "/dashboard/onboarding"
    }
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#92400E"
            colorB="#B45309"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#A16207"
            upColor="#D97706"
            downColor="#B45309"
            leftColor="#92400E"
            rightColor="#C2410C"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => window.location.href = "/"}
          className="font-sans text-sm text-foreground/80 transition-colors hover:text-foreground"
        >
          ← Back to Home
        </button>
      </nav>

      <div
        className={`relative z-10 flex h-screen items-center justify-center px-4 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">Welcome Back</p>
            </div>
            <h1 className="mb-3 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-6xl">
              Sign in to
              <br />
              <span className="text-foreground/70">ClearSky</span>
            </h1>
            <p className="animate-in fade-in slide-in-from-bottom-4 text-sm text-foreground/80 duration-1000 delay-200">
              Access your personalized respiratory health dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-1000 delay-300"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-mono text-xs text-foreground/60">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-foreground/20 bg-foreground/5 py-3 pl-12 pr-4 text-foreground backdrop-blur-md transition-all placeholder:text-foreground/40 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs text-foreground/60">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-foreground/20 bg-foreground/5 py-3 pl-12 pr-4 text-foreground backdrop-blur-md transition-all placeholder:text-foreground/40 focus:border-foreground/40 focus:bg-foreground/10 focus:outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-foreground/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-foreground/30 bg-foreground/10 text-foreground focus:ring-0 focus:ring-offset-0"
                />
                <span className="font-mono text-xs">Remember me</span>
              </label>
              <button
                type="button"
                className="font-mono text-xs text-foreground/60 transition-colors hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>

            <MagneticButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={undefined}
            >
              Sign In
            </MagneticButton>

            <p className="text-center font-mono text-xs text-foreground/60">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => window.location.href = "/signup"}
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Create one
              </button>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
