"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      router.push("/signin")
      return
    }

    // Check if user has completed onboarding (skip check if already on onboarding page)
    const onboardingComplete = localStorage.getItem("onboardingComplete")
    
    if (!onboardingComplete && pathname !== "/dashboard/onboarding") {
      // Redirect to onboarding if not completed
      router.push("/dashboard/onboarding")
    }
  }, [router, pathname])

  return (
    <div className="dashboard-container" style={{ cursor: "auto" }}>
      <style jsx global>{`
        .dashboard-container,
        .dashboard-container * {
          cursor: auto !important;
        }
        .dashboard-container button,
        .dashboard-container a,
        .dashboard-container [role="button"] {
          cursor: pointer !important;
        }
      `}</style>
      {children}
    </div>
  )
}
