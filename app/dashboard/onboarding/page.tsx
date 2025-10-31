"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Heart, AlertTriangle, Pill, CheckCircle, ArrowRight, ArrowLeft, Bell } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "pending">("pending")
  const [onboardingData, setOnboardingData] = useState({
    location: "",
    latitude: "",
    longitude: "",
    conditions: [] as string[],
    symptoms: [] as string[],
    medications: [] as any[],
    sensitivities: [] as string[],
  })

  const availableConditions = [
    { id: "asthma", name: "Asthma", description: "Chronic respiratory condition" },
    { id: "seasonal-allergies", name: "Seasonal Allergies", description: "Hay fever, pollen allergies" },
    { id: "copd", name: "COPD", description: "Chronic Obstructive Pulmonary Disease" },
    { id: "environmental-allergies", name: "Environmental Allergies", description: "Dust, mold, pet dander" },
    { id: "sinusitis", name: "Chronic Sinusitis", description: "Sinus inflammation" },
    { id: "bronchitis", name: "Chronic Bronchitis", description: "Airway inflammation" },
  ]

  const availableSymptoms = [
    "Shortness of breath",
    "Wheezing",
    "Coughing",
    "Chest tightness",
    "Sneezing",
    "Runny nose",
    "Itchy eyes",
    "Nasal congestion",
    "Fatigue",
    "Headaches",
  ]

  const availableSensitivities = [
    "Pollen (Trees)",
    "Pollen (Grass)", 
    "Pollen (Ragweed)",
    "Dust Mites",
    "Pet Dander",
    "Mold Spores",
    "Air Pollution (PM2.5)",
    "Smoke",
    "Cold Air",
    "Perfumes/Fragrances",
  ]

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "default") {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      console.log("Requesting current location...")
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          console.log("Got coordinates:", { latitude, longitude })
          
          // Reverse geocoding using OpenWeather API
          const API_KEY = "dec40a13839b118013db7cb66e62bd90"
          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            )
            const data = await response.json()
            console.log("Reverse geocoding response:", data)
            
            if (data && data.length > 0) {
              const location = `${data[0].name}, ${data[0].state || data[0].country}`
              const newData = {
                ...onboardingData,
                location,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              }
              console.log("Setting current location data:", newData)
              setOnboardingData(newData)
              alert(`Location detected: ${location}`)
            } else {
              // If reverse geocoding fails, still save the coordinates
              const newData = {
                ...onboardingData,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              }
              console.log("Using coordinates as location:", newData)
              setOnboardingData(newData)
              alert(`Location detected at coordinates: ${newData.location}`)
            }
          } catch (error) {
            console.error("Error fetching location name:", error)
            // Still save coordinates even if reverse geocoding fails
            const newData = {
              ...onboardingData,
              location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }
            setOnboardingData(newData)
            alert(`Location detected at coordinates: ${newData.location}`)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter it manually or check location permissions.")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const searchLocation = async () => {
    if (!onboardingData.location) {
      alert("Please enter a location first")
      return
    }
    
    const API_KEY = "dec40a13839b118013db7cb66e62bd90"
    try {
      console.log("Searching for location:", onboardingData.location)
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(onboardingData.location)}&limit=1&appid=${API_KEY}`
      )
      const data = await response.json()
      console.log("Geocoding response:", data)
      
      if (data && data.length > 0) {
        const newData = {
          ...onboardingData,
          latitude: data[0].lat.toString(),
          longitude: data[0].lon.toString(),
          location: `${data[0].name}, ${data[0].state || data[0].country}`,
        }
        console.log("Setting location data:", newData)
        setOnboardingData(newData)
        alert(`Location found: ${newData.location}`)
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error searching location:", error)
      alert("Unable to find location. Please try again.")
    }
  }

  const toggleCondition = (condition: string) => {
    const newConditions = onboardingData.conditions.includes(condition)
      ? onboardingData.conditions.filter(c => c !== condition)
      : [...onboardingData.conditions, condition]
    setOnboardingData({ ...onboardingData, conditions: newConditions })
  }

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = onboardingData.symptoms.includes(symptom)
      ? onboardingData.symptoms.filter(s => s !== symptom)
      : [...onboardingData.symptoms, symptom]
    setOnboardingData({ ...onboardingData, symptoms: newSymptoms })
  }

  const toggleSensitivity = (sensitivity: string) => {
    const newSensitivities = onboardingData.sensitivities.includes(sensitivity)
      ? onboardingData.sensitivities.filter(s => s !== sensitivity)
      : [...onboardingData.sensitivities, sensitivity]
    setOnboardingData({ ...onboardingData, sensitivities: newSensitivities })
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        if (permission === "granted") {
          // Show a test notification
          new Notification("ClearSky Notifications Enabled", {
            body: "You'll now receive alerts about air quality and pollen levels in your area.",
            icon: "/favicon.ico"
          })
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error)
      }
    } else {
      alert("Notifications are not supported in your browser.")
    }
  }

  const completeOnboarding = () => {
    // Save onboarding data to localStorage
    localStorage.setItem("onboardingComplete", "true")
    localStorage.setItem("userProfile", JSON.stringify(onboardingData))
    localStorage.setItem("notificationPermission", notificationPermission)
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  const nextStep = () => {
    if (step === 1) {
      if (!onboardingData.location) {
        alert("Please enter or select your location")
        return
      }
      if (!onboardingData.latitude || !onboardingData.longitude) {
        alert("Location coordinates not found. Please search for your location or use 'Use My Current Location' button.")
        return
      }
      console.log("Location verified:", {
        location: onboardingData.location,
        lat: onboardingData.latitude,
        lon: onboardingData.longitude
      })
    }
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Subtle background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full animate-pulse rounded-full bg-orange-500/10 blur-[150px]" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-amber-500/8 blur-[150px]" />
      </div>

      <Card className="w-full max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative z-10">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-white/95">
                Welcome to ClearSky
              </CardTitle>
              <p className="text-orange-300/70 mt-2">Let's personalize your experience</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-12 rounded-full transition-all ${
                    i <= step ? "bg-orange-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-[500px]">
          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white/95 mb-2">Where are you located?</h2>
                <p className="text-white/60 text-sm">
                  We'll use this to provide accurate environmental data for your area
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter city, state or zip code"
                    value={onboardingData.location}
                    onChange={(e) => setOnboardingData({ ...onboardingData, location: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                    className="bg-white/5 border-white/10 text-white/95 placeholder-white/40"
                  />
                  <Button
                    onClick={searchLocation}
                    className="bg-orange-500/20 border border-orange-400/30 text-orange-300 hover:bg-orange-500/30"
                  >
                    Search
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black px-2 text-white/60">OR</span>
                  </div>
                </div>

                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-white/95 hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use My Current Location
                </Button>

                {onboardingData.latitude && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Location detected: {onboardingData.location}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Health Conditions */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white/95 mb-2">What conditions do you have?</h2>
                <p className="text-white/60 text-sm">
                  Select all that apply - this helps us provide better recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableConditions.map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => toggleCondition(condition.name)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      onboardingData.conditions.includes(condition.name)
                        ? "bg-orange-500/20 border-orange-400/50 shadow-lg"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white/95">{condition.name}</h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        onboardingData.conditions.includes(condition.name)
                          ? "border-orange-400 bg-orange-400"
                          : "border-white/30"
                      }`}>
                        {onboardingData.conditions.includes(condition.name) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/60">{condition.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Symptoms */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white/95 mb-2">What symptoms do you experience?</h2>
                <p className="text-white/60 text-sm">
                  Help us understand what triggers to watch for
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-lg text-sm transition-all border ${
                      onboardingData.symptoms.includes(symptom)
                        ? "bg-orange-500/20 border-orange-400/50 text-white/95"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Environmental Sensitivities */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white/95 mb-2">What are you sensitive to?</h2>
                <p className="text-white/60 text-sm">
                  Select environmental triggers that affect you
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSensitivities.map((sensitivity) => (
                  <button
                    key={sensitivity}
                    onClick={() => toggleSensitivity(sensitivity)}
                    className={`p-3 rounded-lg text-sm transition-all border ${
                      onboardingData.sensitivities.includes(sensitivity)
                        ? "bg-orange-500/20 border-orange-400/50 text-white/95"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                    }`}
                  >
                    {sensitivity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Notification Permissions */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white/95 mb-2">Stay Informed with Alerts</h2>
                <p className="text-white/60 text-sm">
                  Get real-time notifications to protect your health
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/90 leading-relaxed mb-4">
                    <span className="font-semibold text-orange-300">ClearSky</span> will send you notifications and alerts when you are near areas with:
                  </p>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>High pollen levels that may trigger allergies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Poor air quality that could affect breathing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Environmental triggers specific to your sensitivities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>Sudden changes in conditions requiring caution</span>
                    </li>
                  </ul>
                </div>

                {notificationPermission === "pending" && (
                  <Button
                    onClick={requestNotificationPermission}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30"
                    size="lg"
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Enable Notifications
                  </Button>
                )}

                {notificationPermission === "granted" && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-sm text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Notifications enabled! You'll stay informed about air quality changes.</span>
                    </div>
                  </div>
                )}

                {notificationPermission === "denied" && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30 text-sm text-red-300">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Notifications blocked</span>
                      </div>
                      <p className="text-xs text-red-300/80">
                        You can enable notifications later in your browser settings.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-white/50 text-center">
                  You can change notification preferences anytime in settings
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-white/10">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={completeOnboarding}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
