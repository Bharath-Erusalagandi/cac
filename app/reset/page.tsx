"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, CheckCircle, AlertTriangle } from "lucide-react"

export default function ResetPage() {
  const router = useRouter()
  const [isReset, setIsReset] = useState(false)

  const handleReset = () => {
    // Clear all localStorage data
    localStorage.clear()
    setIsReset(true)
    
    // Show confirmation for 2 seconds then redirect
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-pulse rounded-full bg-orange-500/10 blur-[150px]" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-amber-500/8 blur-[150px]" />
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-orange-400" />
            Reset Application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isReset ? (
            <>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-400/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-orange-300 font-semibold mb-1">Warning</h3>
                    <p className="text-white/70 text-sm">
                      This will clear all your data including:
                    </p>
                    <ul className="mt-2 space-y-1 text-white/60 text-sm">
                      <li>• User profile and location</li>
                      <li>• Health conditions and symptoms</li>
                      <li>• Onboarding progress</li>
                      <li>• All saved preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReset}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset Everything
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-white/95 hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white/95 mb-2">Reset Complete!</h3>
              <p className="text-white/60 text-sm">
                Redirecting to home page...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
