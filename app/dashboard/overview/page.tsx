"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wind, Droplets, Flower2, Sun, AlertTriangle, TrendingUp, Bell, MapPin, Thermometer, Activity } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { 
  getCurrentWeather, 
  getAirQuality, 
  getUVIndex,
  getAQIDescription,
  getUVDescription,
  type WeatherData,
  type AirQualityData
} from "@/lib/weatherService"
import { getCurrentPollen, getOverallPollenLevel, type PollenData } from "@/lib/pollenService"

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
  const [uvIndex, setUvIndex] = useState(0)
  const [pollenData, setPollenData] = useState<PollenData | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log("=== Loading Dashboard Data ===")
      
      // Get user profile from localStorage
      const profileData = localStorage.getItem("userProfile")
      console.log("Raw profile data from localStorage:", profileData)
      
      if (!profileData) {
        console.warn("No user profile found in localStorage")
        setLoading(false)
        return
      }

      const profile = JSON.parse(profileData)
      console.log("Parsed user profile:", profile)
      
      setUserProfile(profile)
      setUserLocation(profile.location)

      // Fetch weather data if we have coordinates
      if (profile.latitude && profile.longitude) {
        console.log("Coordinates found:", { lat: profile.latitude, lon: profile.longitude })
        
        const lat = parseFloat(profile.latitude)
        const lon = parseFloat(profile.longitude)
        
        console.log("Parsed coordinates:", { lat, lon })

        if (isNaN(lat) || isNaN(lon)) {
          console.error("Invalid coordinates - not numbers")
          setLoading(false)
          return
        }

        console.log("Starting API calls...")
        
        // Fetch all data in parallel
        const [weatherData, airData, uv, pollen] = await Promise.all([
          getCurrentWeather(lat, lon),
          getAirQuality(lat, lon),
          getUVIndex(lat, lon),
          getCurrentPollen(lat, lon).catch(err => {
            console.warn("Pollen API failed, using fallback:", err)
            return null
          })
        ])

        console.log("All API calls completed successfully")
        console.log("Weather:", weatherData)
        console.log("Air Quality:", airData)
        console.log("UV Index:", uv)
        console.log("Pollen:", pollen)

        setWeather(weatherData)
        setAirQuality(airData)
        setUvIndex(uv)
        setPollenData(pollen)
      } else {
        console.warn("No coordinates in profile:", profile)
      }

      setLoading(false)
    } catch (error) {
      console.error("=== ERROR loading dashboard data ===")
      console.error("Error details:", error)
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
      setLoading(false)
    }
  }

  // Generate personalized alerts based on user profile
  const generateAlerts = () => {
    const alerts = []

    if (airQuality && airQuality.aqi >= 3 && userProfile?.conditions?.includes("Asthma")) {
      alerts.push({
        type: "warning",
        message: "Moderate air quality detected. Consider limiting outdoor activities.",
        time: "Just now"
      })
    }

    if (pollenData) {
      const pollenLevel = getOverallPollenLevel(pollenData)
      if (pollenLevel.level === "High" && userProfile?.sensitivities?.some((s: string) => s.includes("Pollen"))) {
        alerts.push({
          type: "warning",
          message: `High pollen count detected: ${pollenLevel.count} grains/m³. Take preventive medication.`,
          time: "Just now"
        })
      } else if (pollenLevel.level === "Moderate" && userProfile?.sensitivities?.some((s: string) => s.includes("Pollen"))) {
        alerts.push({
          type: "info",
          message: `Moderate pollen levels today: ${pollenLevel.count} grains/m³. Monitor symptoms.`,
          time: "Just now"
        })
      }
    }

    if (uvIndex >= 7) {
      alerts.push({
        type: "info",
        message: "High UV index today. Limit sun exposure and use protection.",
        time: "Just now"
      })
    }

    // Add medication reminders
    if (userProfile?.medications && userProfile.medications.length > 0) {
      alerts.push({
        type: "reminder",
        message: `Time to take your ${userProfile.medications[0].name}`,
        time: "In 30 minutes"
      })
    }

    if (alerts.length === 0) {
      alerts.push({
        type: "info",
        message: "All clear! Environmental conditions are favorable today.",
        time: "Just now"
      })
    }

    return alerts
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  const aqiData = airQuality ? getAQIDescription(airQuality.aqi) : { status: "Unknown", color: "gray" }
  const uvData = getUVDescription(uvIndex)
  
  // Use real pollen data if available
  const pollenLevel = pollenData 
    ? getOverallPollenLevel(pollenData)
    : { level: "Unknown", color: "gray", count: 0 }

  const metrics = [
    {
      label: "Air Quality",
      value: airQuality ? airQuality.aqi : "--",
      status: aqiData.status,
      icon: Wind,
      color: `from-${aqiData.color}-400 to-${aqiData.color}-500`,
      detail: airQuality ? `PM2.5: ${airQuality.pm25.toFixed(1)} μg/m³` : ""
    },
    {
      label: "Pollen Level",
      value: pollenLevel.level,
      status: pollenData ? `${pollenLevel.count} grains/m³` : "Loading...",
      icon: Flower2,
      color: `from-${pollenLevel.color}-400 to-${pollenLevel.color}-500`,
      detail: weather ? `${weather.temp}°F` : ""
    },
    {
      label: "Humidity",
      value: weather ? `${weather.humidity}%` : "--",
      status: weather && weather.humidity > 60 ? "High" : "Normal",
      icon: Droplets,
      color: "from-cyan-400 to-teal-500",
      detail: weather ? `Feels like ${weather.feelsLike}°F` : ""
    },
    {
      label: "UV Index",
      value: uvIndex || "--",
      status: uvData.status,
      icon: Sun,
      color: `from-${uvData.color}-400 to-${uvData.color}-500`,
      detail: weather ? `Wind: ${weather.windSpeed} mph` : ""
    },
  ]

  const alerts = generateAlerts()

  // Generate 24-hour trend data for visualization with realistic daily patterns
  const generate24HourData = () => {
    const hours = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm']
    const currentAQI = airQuality?.aqi || 2
    const currentPollen = pollenData ? getOverallPollenLevel(pollenData).count : 10
    const currentHumidity = weather?.humidity || 33
    const currentUV = uvIndex || 5

    return hours.map((hour, index) => {
      // More realistic daily patterns for each metric
      const timeOfDay = index / 12 // 0 to 1 (midnight to midnight)
      
      // UV Index: follows sun - peaks at noon, zero at night
      const uvPattern = Math.max(0, Math.sin((timeOfDay - 0.25) * Math.PI * 2) * 0.5 + 0.5)
      const uvValue = Math.round(currentUV * uvPattern * (0.9 + Math.random() * 0.2))
      
      // Pollen: peaks in morning (8am-10am), lower at night
      const pollenPattern = timeOfDay < 0.5 
        ? Math.sin(timeOfDay * Math.PI * 2) * 0.8 + 0.5  // Morning peak
        : Math.max(0.3, Math.sin(timeOfDay * Math.PI) * 0.5 + 0.3)  // Afternoon decline
      const pollenValue = Math.max(5, Math.round(currentPollen * pollenPattern * (0.8 + Math.random() * 0.4)))
      
      // AQI: worse during rush hours (morning/evening), better midday
      const rushHourMorning = Math.exp(-Math.pow((timeOfDay - 0.33) * 12, 2)) * 1.5  // 8am peak
      const rushHourEvening = Math.exp(-Math.pow((timeOfDay - 0.75) * 12, 2)) * 1.3  // 6pm peak
      const aqiVariation = 1 + rushHourMorning + rushHourEvening
      const aqiValue = Math.max(1, Math.round(currentAQI * aqiVariation + (Math.random() - 0.5) * 1.5))
      
      // Humidity: higher at night, lower during warm afternoon
      const humidityPattern = 1 + (Math.cos((timeOfDay - 0.5) * Math.PI * 2) * 0.2)  // Inverse of sun
      const humidityValue = Math.max(20, Math.min(90, Math.round(currentHumidity * humidityPattern + (Math.random() - 0.5) * 8)))
      
      return {
        time: hour,
        aqi: aqiValue,
        pollen: pollenValue,
        humidity: humidityValue,
        uv: uvValue
      }
    })
  }

  const chartData = generate24HourData()

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-orange-300 text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white/90 text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Location Missing Alert */}
      {!weather && !loading && userProfile && (!userProfile.latitude || !userProfile.longitude) && (
        <Card className="bg-orange-500/10 border border-orange-500/30 backdrop-blur-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-orange-400 font-bold mb-2">Location Coordinates Missing</h3>
                <p className="text-white/70 text-sm mb-3">
                  Your location "{userLocation}" doesn't have coordinates saved. 
                  Weather data requires GPS coordinates to work.
                </p>
                <Button
                  onClick={() => {
                    localStorage.removeItem("onboardingComplete")
                    window.location.href = "/dashboard/onboarding"
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Complete Setup Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-orange-400" />
            {userLocation || "Location not set"}
          </h2>
          <p className="text-orange-300/60 text-sm mt-1">
            {weather ? weather.description : "Loading weather data..."}
          </p>
        </div>
        {weather && (
          <div className="text-right">
            <div className="text-4xl font-bold text-white/95 flex items-center gap-1">
              <Thermometer className="h-8 w-8 text-orange-400" />
              {weather.temp}°F
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl transition-all hover:border-orange-400/40"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 transition-opacity group-hover:opacity-10`} />
            <CardContent className="p-6 relative">
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg bg-gradient-to-br ${metric.color} p-3 shadow-lg`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mb-1 text-sm text-orange-300/80">{metric.label}</h3>
              <div className="mb-2 text-3xl font-bold text-white/95">{metric.value}</div>
              <p className="text-xs text-orange-300/60">{metric.status}</p>
              {metric.detail && (
                <p className="text-xs text-white/50 mt-1">{metric.detail}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Environmental Trends Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* 24-Hour Environmental Trends */}
          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-400" />
                  24-Hour Environmental Trends
                </CardTitle>
                <span className="text-xs text-orange-300/60">
                  Real-time data
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPollen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(251,146,60,0.6)" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(251,146,60,0.6)" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorAQI)" 
                    name="Air Quality Index"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pollen" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#colorPollen)" 
                    name="Pollen (grains/m³)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* User Profile Summary */}
        <div className="space-y-6">
          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white/95">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile?.conditions && userProfile.conditions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-300/80 mb-2">Conditions</h4>
                  <div className="space-y-1">
                    {userProfile.conditions.map((condition: string, i: number) => (
                      <div key={i} className="text-sm text-white/70">• {condition}</div>
                    ))}
                  </div>
                </div>
              )}
              {userProfile?.symptoms && userProfile.symptoms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-300/80 mb-2">Symptoms</h4>
                  <div className="space-y-1">
                    {userProfile.symptoms.slice(0, 3).map((symptom: string, i: number) => (
                      <div key={i} className="text-sm text-white/70">• {symptom}</div>
                    ))}
                    {userProfile.symptoms.length > 3 && (
                      <div className="text-xs text-orange-300/60">+{userProfile.symptoms.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
              {userProfile?.sensitivities && userProfile.sensitivities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-300/80 mb-2">Sensitivities</h4>
                  <div className="space-y-1">
                    {userProfile.sensitivities.slice(0, 3).map((sensitivity: string, i: number) => (
                      <div key={i} className="text-sm text-white/70">• {sensitivity}</div>
                    ))}
                    {userProfile.sensitivities.length > 3 && (
                      <div className="text-xs text-orange-300/60">+{userProfile.sensitivities.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {userProfile?.medications && userProfile.medications.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white/95">Medication Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProfile.medications.map((med: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-orange-300/80">{med.name}</span>
                      <span className="flex items-center gap-2 text-xs font-medium text-orange-300">
                        <Bell className="h-3 w-3" />
                        {med.time || "As needed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
