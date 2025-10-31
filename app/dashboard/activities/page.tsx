"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { getCurrentWeather, getAirQuality, type AirQualityData } from "@/lib/weatherService"
import { getCurrentPollen, getOverallPollenLevel } from "@/lib/pollenService"

export default function Activities() {
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState("")
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    loadActivityRecommendations()
  }, [])

  const loadActivityRecommendations = async () => {
    try {
      setLoading(true)
      const profileData = localStorage.getItem("userProfile")
      
      if (!profileData) {
        setLoading(false)
        return
      }

      const profile = JSON.parse(profileData)
      setUserLocation(profile.location)

      if (profile.latitude && profile.longitude) {
        const lat = parseFloat(profile.latitude)
        const lon = parseFloat(profile.longitude)

        // Fetch current environmental data
        const [weather, airQuality, pollen] = await Promise.all([
          getCurrentWeather(lat, lon),
          getAirQuality(lat, lon),
          getCurrentPollen(lat, lon)
        ])

        const pollenLevel = getOverallPollenLevel(pollen)
        
        // Generate recommendations based on real data
        const activities = generateRecommendations(airQuality, pollenLevel.level, profile.location)
        setRecommendations(activities)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading activity recommendations:", error)
      setLoading(false)
    }
  }

  const generateRecommendations = (airQuality: AirQualityData, pollenLevel: string, location: string) => {
    const isSafe = airQuality.aqi <= 2 && (pollenLevel === "Low" || pollenLevel === "Moderate")
    const cityName = location.split(',')[0] || location
    
    return [
      {
        time: "6:00 AM - 9:00 AM",
        activity: "Morning Walk",
        location: `${cityName} Park`,
        safety: isSafe ? "safe" : "caution",
        aqi: airQuality.aqi === 1 ? 25 : airQuality.aqi === 2 ? 45 : airQuality.aqi === 3 ? 75 : 120,
        pollen: pollenLevel,
        reason: isSafe ? "Best air quality of the day" : "Check conditions before going out"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: pollenLevel === "High" ? "Indoor Exercise" : "Lunch Break",
        location: pollenLevel === "High" ? "Indoor Gym" : `${cityName} Cafe`,
        safety: pollenLevel === "High" ? "safe" : airQuality.aqi <= 2 ? "safe" : "caution",
        aqi: airQuality.aqi === 1 ? 35 : airQuality.aqi === 2 ? 55 : airQuality.aqi === 3 ? 85 : 130,
        pollen: pollenLevel,
        reason: pollenLevel === "High" ? "High pollen - indoor recommended" : "Moderate activity recommended"
      },
      {
        time: "5:00 PM - 7:00 PM",
        activity: "Evening Exercise",
        location: isSafe ? `${cityName} Trail` : "Indoor Activity",
        safety: isSafe ? "safe" : "caution",
        aqi: airQuality.aqi === 1 ? 30 : airQuality.aqi === 2 ? 50 : airQuality.aqi === 3 ? 80 : 125,
        pollen: pollenLevel,
        reason: isSafe ? "Good conditions for outdoor activity" : "Consider indoor alternatives"
      },
    ]
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading activity recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Location Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-orange-400" />
            {userLocation || "Your Location"}
          </h2>
          <p className="text-orange-300/60 text-sm mt-1">
            Personalized activity recommendations
          </p>
        </div>
        <Button
          onClick={loadActivityRecommendations}
          variant="outline"
          className="bg-white/5 border-white/10 text-white/95 hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white/95">Today's Activities</CardTitle>
          <p className="text-sm text-orange-300/60">Based on current air quality and pollen levels in {userLocation}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">No location data available. Please complete onboarding.</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-400/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          rec.safety === "safe" ? "bg-emerald-500/20" : "bg-amber-500/20"
                        }`}
                      >
                        {rec.safety === "safe" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white/95">{rec.activity}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-orange-300/60">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rec.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {rec.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rec.safety === "safe"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {rec.safety === "safe" ? "Safe" : "Caution"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <span className="text-orange-300/60">Air Quality: </span>
                      <span className="text-white/95 font-medium">{rec.aqi} AQI</span>
                    </div>
                    <div>
                      <span className="text-orange-300/60">Pollen: </span>
                      <span className="text-white/95 font-medium">{rec.pollen}</span>
                    </div>
                  </div>
                  {rec.reason && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/60 italic">{rec.reason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
