"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flower2, MapPin, TrendingUp, AlertTriangle, Leaf, Trees, Wind, Map as MapIcon } from "lucide-react"
import { 
  getCurrentPollen, 
  getPollenForecast,
  getPollenRiskColor,
  getOverallPollenLevel,
  formatSpeciesData,
  type PollenData,
  type PollenForecast
} from "@/lib/pollenService"
import dynamic from "next/dynamic"

// Dynamically import PollenMapView to avoid SSR issues with Leaflet
const PollenMapView = dynamic(() => import("@/components/PollenMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">Loading map...</p>
      </div>
    </div>
  )
})

export default function PollenMap() {
  const [loading, setLoading] = useState(true)
  const [pollenData, setPollenData] = useState<PollenData | null>(null)
  const [forecast, setForecast] = useState<PollenForecast[]>([])
  const [userLocation, setUserLocation] = useState("")
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    loadPollenData()
  }, [])

  const loadPollenData = async () => {
    try {
      console.log("=== Loading Pollen Data ===")
      
      // Get user profile from localStorage
      const profileData = localStorage.getItem("userProfile")
      if (!profileData) {
        setError("No user profile found. Please complete onboarding.")
        setLoading(false)
        return
      }

      const profile = JSON.parse(profileData)
      setUserLocation(profile.location)

      // Check for coordinates
      if (!profile.latitude || !profile.longitude) {
        setError("Location coordinates missing. Please complete setup again.")
        setLoading(false)
        return
      }

      const lat = parseFloat(profile.latitude)
      const lon = parseFloat(profile.longitude)
      
      setLatitude(lat)
      setLongitude(lon)

      if (isNaN(lat) || isNaN(lon)) {
        setError("Invalid coordinates")
        setLoading(false)
        return
      }

      console.log("Fetching pollen data for:", { lat, lon })

      // Fetch pollen data
      const [currentPollen, pollenForecast] = await Promise.all([
        getCurrentPollen(lat, lon),
        getPollenForecast(lat, lon).catch(() => []) // Forecast is optional
      ])

      console.log("Pollen data loaded:", currentPollen)
      
      // Check if we're using fallback data
      // Fallback data will have updatedAt very close to current time (within 5 seconds)
      // Real API data will have an older timestamp from Ambee's servers
      const timeDiff = new Date().getTime() - new Date(currentPollen.updatedAt).getTime()
      const isFallback = timeDiff < 5000
      
      if (isFallback) {
        console.log("⚠️ Using fallback pollen data (API unavailable)")
      } else {
        console.log("✅ Using real-time pollen data from Ambee")
      }
      
      setUsingFallback(isFallback)
      
      setPollenData(currentPollen)
      setForecast(pollenForecast)
      setLoading(false)
    } catch (err: any) {
      console.error("Error loading pollen data:", err)
      setError(err.message || "Failed to load pollen data")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading pollen data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border border-red-500/30 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-400 font-bold mb-2">Error Loading Pollen Data</h3>
                <p className="text-white/70 text-sm mb-4">{error}</p>
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
      </div>
    )
  }

  if (!pollenData) {
    return (
      <div className="p-6">
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-white/70">No pollen data available for your location.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallLevel = getOverallPollenLevel(pollenData)
  const grassColor = getPollenRiskColor(pollenData.Risk.grass_pollen)
  const treeColor = getPollenRiskColor(pollenData.Risk.tree_pollen)
  const weedColor = getPollenRiskColor(pollenData.Risk.weed_pollen)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-orange-400" />
            {userLocation}
          </h2>
          <p className="text-orange-300/60 text-sm mt-1">
            {usingFallback ? "Estimated pollen data based on seasonal patterns" : "Real-time pollen monitoring"}
          </p>
        </div>
        <Button
          onClick={loadPollenData}
          variant="outline"
          className="bg-white/5 border-white/10 text-white/95 hover:bg-white/10"
        >
          Refresh Data
        </Button>
      </div>

      {/* Fallback Data Notice */}
      {usingFallback && (
        <Card className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-semibold text-sm mb-1">Using Estimated Data</h3>
                <p className="text-white/70 text-xs">
                  Real-time pollen API is currently unavailable. Showing estimated pollen levels based on seasonal patterns and your location in <strong>{userLocation}</strong>. 
                  Data is still useful for general guidance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Pollen Map */}
      <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-orange-400" />
            Pollen Zone Map
          </CardTitle>
          <p className="text-sm text-white/60 mt-1">
            Circular zones showing pollen levels up to 20 miles from {userLocation}
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[600px]">
          {latitude && longitude && pollenData ? (
            <PollenMapView
              latitude={latitude}
              longitude={longitude}
              location={userLocation}
              pollenLevel={overallLevel.level}
              pollenColor={overallLevel.color}
              grassPollen={pollenData.Count.grass_pollen}
              treePollen={pollenData.Count.tree_pollen}
              weedPollen={pollenData.Count.weed_pollen}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Loading map data...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Pollen Level */}
      <Card className={`bg-gradient-to-br from-${overallLevel.color}-500/10 to-${overallLevel.color}-600/10 backdrop-blur-2xl border border-${overallLevel.color}-400/30 shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-white/70 mb-2">Overall Pollen Level</h3>
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bold text-${overallLevel.color}-400`}>
                  {overallLevel.level}
                </span>
                <span className="text-2xl text-white/60">
                  {overallLevel.count} grains/m³
                </span>
              </div>
            </div>
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-${overallLevel.color}-400 to-${overallLevel.color}-600 flex items-center justify-center shadow-lg shadow-${overallLevel.color}-500/30`}>
              <Flower2 className="h-12 w-12 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pollen Types Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Grass Pollen */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white/95 flex items-center gap-2">
              <Leaf className={`h-5 w-5 text-${grassColor}-400`} />
              Grass Pollen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Count</span>
                  <span className={`text-2xl font-bold text-${grassColor}-400`}>
                    {Math.round(pollenData.Count.grass_pollen)}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${grassColor}-400 to-${grassColor}-600`}
                    style={{ width: `${Math.min((pollenData.Count.grass_pollen / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg bg-${grassColor}-500/10 border border-${grassColor}-400/30`}>
                <span className={`text-sm font-medium text-${grassColor}-400`}>
                  Risk: {pollenData.Risk.grass_pollen}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tree Pollen */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white/95 flex items-center gap-2">
              <Trees className={`h-5 w-5 text-${treeColor}-400`} />
              Tree Pollen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Count</span>
                  <span className={`text-2xl font-bold text-${treeColor}-400`}>
                    {Math.round(pollenData.Count.tree_pollen)}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${treeColor}-400 to-${treeColor}-600`}
                    style={{ width: `${Math.min((pollenData.Count.tree_pollen / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg bg-${treeColor}-500/10 border border-${treeColor}-400/30`}>
                <span className={`text-sm font-medium text-${treeColor}-400`}>
                  Risk: {pollenData.Risk.tree_pollen}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weed Pollen */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white/95 flex items-center gap-2">
              <Wind className={`h-5 w-5 text-${weedColor}-400`} />
              Weed Pollen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Count</span>
                  <span className={`text-2xl font-bold text-${weedColor}-400`}>
                    {Math.round(pollenData.Count.weed_pollen)}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${weedColor}-400 to-${weedColor}-600`}
                    style={{ width: `${Math.min((pollenData.Count.weed_pollen / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg bg-${weedColor}-500/10 border border-${weedColor}-400/30`}>
                <span className={`text-sm font-medium text-${weedColor}-400`}>
                  Risk: {pollenData.Risk.weed_pollen}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Species Breakdown */}
      {pollenData.Species && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Grass Species */}
          {pollenData.Species.Grass && Object.keys(pollenData.Species.Grass).length > 0 && (
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white/95">Grass Species</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatSpeciesData(pollenData.Species.Grass).map((species, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-white/5">
                      <span className="text-sm text-white/80">{species.name}</span>
                      <span className="text-sm font-medium text-emerald-400">{species.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tree Species */}
          {pollenData.Species.Tree && Object.keys(pollenData.Species.Tree).length > 0 && (
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white/95">Tree Species</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatSpeciesData(pollenData.Species.Tree).map((species, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-white/5">
                      <span className="text-sm text-white/80">{species.name}</span>
                      <span className="text-sm font-medium text-amber-400">{species.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weed Species */}
          {pollenData.Species.Weed && Object.keys(pollenData.Species.Weed).length > 0 && (
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white/95">Weed Species</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatSpeciesData(pollenData.Species.Weed).map((species, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-white/5">
                      <span className="text-sm text-white/80">{species.name}</span>
                      <span className="text-sm font-medium text-orange-400">{species.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Forecast */}
      {forecast.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Pollen Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {forecast.slice(0, 4).map((item, i) => {
                const forecastLevel = getOverallPollenLevel({
                  Count: item.Count,
                  Risk: item.Risk,
                  Species: {},
                  updatedAt: ""
                })
                return (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60 mb-2">
                      {new Date(item.time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className={`text-lg font-bold text-${forecastLevel.color}-400`}>
                      {forecastLevel.level}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {forecastLevel.count} grains/m³
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-white/50">
        Last updated: {new Date(pollenData.updatedAt).toLocaleString()}
      </div>
    </div>
  )
}
