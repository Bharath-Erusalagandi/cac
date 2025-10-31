"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Wind, Home, Activity, Sun, Droplets } from "lucide-react"

export default function HealthTips() {
  const tips = [
    {
      icon: Wind,
      title: "Managing Asthma Triggers",
      description: "Learn to identify and avoid common asthma triggers like dust, pollen, and air pollution.",
      tips: [
        "Monitor daily air quality before going outside",
        "Keep rescue inhaler accessible at all times",
        "Use preventive medication before exposure to known triggers",
        "Stay indoors during high pollen count days"
      ],
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Home,
      title: "Indoor Air Quality",
      description: "Improve your home environment to reduce respiratory irritants and allergens.",
      tips: [
        "Use HEPA filters in air purifiers",
        "Keep humidity levels between 30-50%",
        "Regular cleaning to reduce dust and mold",
        "Avoid indoor smoking and strong chemicals"
      ],
      color: "from-emerald-400 to-green-500"
    },
    {
      icon: Activity,
      title: "Exercise & Breathing",
      description: "Safe exercise practices for people with respiratory sensitivities.",
      tips: [
        "Warm up slowly before intense exercise",
        "Breathe through your nose when possible",
        "Exercise during low pollen hours (early morning)",
        "Practice breathing exercises regularly"
      ],
      color: "from-violet-400 to-purple-500"
    },
    {
      icon: Sun,
      title: "Weather & Symptoms",
      description: "Understand how weather changes affect your respiratory health.",
      tips: [
        "Cold air can trigger asthma - wear a scarf over mouth",
        "High humidity may worsen breathing difficulties",
        "Thunderstorms can increase pollen concentration",
        "Sudden temperature changes require extra caution"
      ],
      color: "from-amber-400 to-orange-500"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white/95 mb-2">Health Tips & Guidance</h1>
        <p className="text-orange-300/60">Evidence-based advice for respiratory wellness</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tips.map((tip, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-cyan-500/40 transition-all"
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`rounded-lg bg-gradient-to-br ${tip.color} p-3 shadow-lg`}>
                  <tip.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white/95">{tip.title}</CardTitle>
                  <p className="text-sm text-orange-300/60 mt-1">{tip.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tip.tips.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/95">
                    <span className="text-orange-300 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
            <Heart className="h-5 w-5 text-orange-300" />
            Emergency Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Severe Asthma Attack Warning Signs:</h3>
              <ul className="text-sm text-white/95 space-y-1">
                <li>• Severe shortness of breath or wheezing</li>
                <li>• Inability to speak in full sentences</li>
                <li>• Blue lips or fingernails</li>
                <li>• Rescue inhaler not providing relief</li>
              </ul>
              <p className="text-sm text-red-400 font-semibold mt-3">If experiencing these symptoms, seek emergency medical attention immediately.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
