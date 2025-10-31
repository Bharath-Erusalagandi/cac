"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Activity, MapPin, Calendar, MessageSquare, Heart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardOverview from "./overview/page"
import PollenMap from "./pollen-map/page"
import Activities from "./activities/page"
import AIAssistant from "./ai-assistant/page"
import HealthTips from "./health-tips/page"
import ProfilePage from "./profile/page"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    window.location.href = "/signin"
  }

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-pulse rounded-full bg-orange-500/10 blur-[150px]" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-amber-500/8 blur-[150px]" />
      </div>
      
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white/5 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""} shadow-2xl`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-400 font-bold text-xl tracking-wider drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]">CLEARSKY</h1>
              <p className="text-orange-300/70 text-xs font-medium">Respiratory Health Monitor</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-orange-300/60 hover:text-orange-400 hover:bg-white/5"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { id: "dashboard", icon: Activity, label: "Dashboard" },
              { id: "pollen-map", icon: MapPin, label: "Pollen Map" },
              { id: "activities", icon: Calendar, label: "Activities" },
              { id: "ai-assistant", icon: MessageSquare, label: "AI Assistant" },
              { id: "health-tips", icon: Heart, label: "Health Tips" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? "bg-orange-500/20 text-orange-300 backdrop-blur-xl border border-orange-400/30 shadow-lg shadow-orange-500/20"
                    : "text-white/70 hover:text-orange-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-400/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col relative ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Bar */}
        <div className="h-16 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 relative z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "pollen-map" && "Pollen Map"}
              {activeSection === "activities" && "Activities"}
              {activeSection === "ai-assistant" && "AI Assistant"}
              {activeSection === "health-tips" && "Health Tips"}
              {activeSection === "profile" && "Profile"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-orange-300/80 font-medium">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto relative z-10">
          {activeSection === "dashboard" && <DashboardOverview />}
          {activeSection === "pollen-map" && <PollenMap />}
          {activeSection === "activities" && <Activities />}
          {activeSection === "ai-assistant" && <AIAssistant />}
          {activeSection === "health-tips" && <HealthTips />}
          {activeSection === "profile" && <ProfilePage />}
        </div>
      </div>
    </div>
  )
}
