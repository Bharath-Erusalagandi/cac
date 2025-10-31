"use client"

import { Wind, Droplets, Activity, Shield } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)

  const features = [
    {
      icon: Wind,
      title: "Real-Time Air Quality",
      description: "Monitor AQI levels and pollution data in your area",
    },
    {
      icon: Droplets,
      title: "Pollen Tracking",
      description: "Get detailed pollen forecasts and allergen alerts",
    },
    {
      icon: Activity,
      title: "Health Insights",
      description: "Personalized recommendations based on your sensitivities",
    },
    {
      icon: Shield,
      title: "Smart Reminders",
      description: "Never miss your medication with intelligent alerts",
    },
  ]

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          {/* Heading */}
          <div
            className={`mb-12 transition-all duration-700 md:mb-16 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            <h2 className="mb-3 font-sans text-5xl font-light leading-[1.05] tracking-tight text-foreground md:mb-4 md:text-7xl lg:text-8xl">
              Start your journey
              <br />
              to healthier living
            </h2>
            <p className="font-mono text-sm text-foreground/60 md:text-base">/ Take control of your respiratory health</p>
          </div>

          {/* Features Grid */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`rounded-2xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all duration-700 hover:border-foreground/20 hover:bg-foreground/10 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-sans text-lg font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-foreground/70">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* CTA Button */}
          <div
            className={`flex flex-col items-center gap-4 transition-all duration-700 sm:flex-row sm:justify-center ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <MagneticButton
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/signin"}
            >
              Sign In
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
