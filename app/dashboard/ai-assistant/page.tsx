"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot } from "lucide-react"
import { getCurrentWeather, getAirQuality, getUVIndex, getAQIDescription, getUVDescription, type WeatherData, type AirQualityData } from "@/lib/weatherService"
import { getCurrentPollen, getOverallPollenLevel, type PollenData } from "@/lib/pollenService"

interface Message {
  role: "user" | "assistant"
  content: string
  isTyping?: boolean
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your ClearSky AI Assistant. I have access to your location, health profile, and real-time environmental data. Ask me anything about air quality, pollen, weather, or health advice!",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // User context data
  const [userProfile, setUserProfile] = useState<any>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
  const [pollen, setPollen] = useState<PollenData | null>(null)
  const [uvIndex, setUvIndex] = useState<number | null>(null)

  // Load user data on mount
  useEffect(() => {
    loadUserData()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadUserData = async () => {
    try {
      const profileData = localStorage.getItem("userProfile")
      if (profileData) {
        const profile = JSON.parse(profileData)
        setUserProfile(profile)

        if (profile.latitude && profile.longitude) {
          const lat = parseFloat(profile.latitude)
          const lon = parseFloat(profile.longitude)

          // Fetch all environmental data
          const [weatherData, aqData, pollenData, uv] = await Promise.all([
            getCurrentWeather(lat, lon).catch(() => null),
            getAirQuality(lat, lon).catch(() => null),
            getCurrentPollen(lat, lon).catch(() => null),
            getUVIndex(lat, lon).catch(() => null)
          ])

          setWeather(weatherData)
          setAirQuality(aqData)
          setPollen(pollenData)
          setUvIndex(uv)
        }
      }
    } catch (error) {
      console.error("Error loading user data for AI:", error)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase()
    
    // Time-specific queries
    if (msg.includes("times") || msg.includes("when") || msg.includes("schedule")) {
      if (msg.includes("tomorrow") || msg.includes("forecast")) {
        return "I don't have tomorrow's forecast data yet. Based on today's patterns, early morning (6-9 AM) and evening (5-7 PM) are typically best for outdoor activities when air quality and pollen are lower."
      }
      
      if (msg.includes("can't") || msg.includes("couldn't") || msg.includes("avoid") || msg.includes("bad")) {
        if (!airQuality || !pollen) return "Loading environmental data..."
        const pollenLevel = getOverallPollenLevel(pollen)
        const aqiData = getAQIDescription(airQuality.aqi)
        
        if (airQuality.aqi >= 3 || pollenLevel.level === "High") {
          return `Based on today's conditions (${aqiData.status} air, ${pollenLevel.level} pollen), avoid outdoor activities during midday (11 AM - 3 PM) when pollen peaks and air quality is worst. Best times: early morning before 9 AM or late evening after 6 PM.`
        } else {
          return `Today's conditions are good! No specific times to avoid. Air quality is ${aqiData.status} and pollen is ${pollenLevel.level} throughout the day. You're safe to be outdoors anytime.`
        }
      }
      
      // General "best times" question
      if (!airQuality || !pollen) return "Loading environmental data..."
      const pollenLevel = getOverallPollenLevel(pollen)
      return `Best times for outdoor activities today: 6-9 AM (cooler, lower pollen) and 5-7 PM (pollen settling). Avoid 11 AM - 3 PM when pollen and heat are highest. Current conditions: Air quality ${getAQIDescription(airQuality.aqi).status}, Pollen ${pollenLevel.level}.`
    }
    
    // Weather queries
    if (msg.includes("weather") || (msg.includes("temperature") && !msg.includes("feel")) || msg.includes("temp ")) {
      if (!weather) return "I'm still loading your weather data. Please try again in a moment."
      const location = userProfile?.location || "your location"
      return `In ${location}, it's currently ${weather.temp}°F and ${weather.description}. Feels like ${weather.feelsLike}°F with ${weather.windSpeed} mph winds. ${weather.humidity > 60 ? "Humidity is high at " + weather.humidity + "%, which may affect breathing." : ""}`
    }

    // Air quality queries
    if (msg.includes("air quality") || msg.includes("aqi") || msg.includes("pollution")) {
      if (!airQuality) return "I'm still loading air quality data. Please try again in a moment."
      const aqiData = getAQIDescription(airQuality.aqi)
      const location = userProfile?.location || "your area"
      let response = `Air quality in ${location} is ${aqiData.status} (AQI: ${airQuality.aqi}). PM2.5 levels are ${airQuality.pm25.toFixed(1)} μg/m³.`
      
      if (airQuality.aqi >= 3 && userProfile?.conditions?.includes("Asthma")) {
        response += " ⚠️ Given your asthma, consider limiting outdoor activities and having your inhaler ready."
      } else if (airQuality.aqi <= 2) {
        response += " ✅ Good conditions for outdoor activities!"
      }
      return response
    }

    // Pollen queries
    if (msg.includes("pollen") || msg.includes("allergies") || msg.includes("allergy")) {
      if (!pollen) return "I'm still loading pollen data. Please try again in a moment."
      const pollenLevel = getOverallPollenLevel(pollen)
      const location = userProfile?.location || "your area"
      let response = `Pollen levels in ${location} are ${pollenLevel.level} (${pollenLevel.count} grains/m³). Grass: ${pollen.Risk.grass_pollen}, Tree: ${pollen.Risk.tree_pollen}, Weed: ${pollen.Risk.weed_pollen}.`
      
      if (pollenLevel.level === "High" || pollenLevel.level === "Very High") {
        response += " ⚠️ High pollen - consider staying indoors, closing windows, and taking antihistamines if needed."
      }
      return response
    }

    // UV/Sun queries
    if (msg.includes("uv") || msg.includes("sun") || msg.includes("sunscreen")) {
      if (uvIndex === null) return "I'm still loading UV data. Please try again in a moment."
      const uvData = getUVDescription(uvIndex)
      let response = `UV index is ${uvIndex} (${uvData.status}).`
      if (uvIndex >= 6) {
        response += " ☀️ High UV - wear sunscreen (SPF 30+), sunglasses, and seek shade during peak hours."
      } else if (uvIndex >= 3) {
        response += " Moderate UV - sunscreen recommended for extended outdoor time."
      }
      return response
    }

    // Exercise queries
    if (msg.includes("exercise") || msg.includes("workout") || msg.includes("run") || msg.includes("walk")) {
      if (!airQuality || !pollen) return "Loading environmental data..."
      const aqiData = getAQIDescription(airQuality.aqi)
      const pollenLevel = getOverallPollenLevel(pollen)
      
      if (airQuality.aqi <= 2 && (pollenLevel.level === "Low" || pollenLevel.level === "Moderate")) {
        return `✅ Great conditions for exercise! Air quality is ${aqiData.status} and pollen is ${pollenLevel.level}. Best times: early morning (6-9 AM) or evening (5-7 PM).`
      } else if (airQuality.aqi >= 3 || pollenLevel.level === "High") {
        return `⚠️ Consider indoor exercise today. Air quality is ${aqiData.status} and pollen is ${pollenLevel.level}. If you must go out, keep it light and have your medication ready.`
      }
      return "Moderate conditions - light exercise okay, but monitor how you feel."
    }

    // Medication queries
    if (msg.includes("medication") || msg.includes("medicine") || msg.includes("inhaler")) {
      if (!userProfile?.medications || userProfile.medications.length === 0) {
        return "You haven't added any medications to your profile yet. Go to Profile → Medication Management to add them."
      }
      let response = "Your medications:\n"
      userProfile.medications.forEach((med: any) => {
        response += `• ${med.name} (${med.dosage}) - ${med.frequency}${med.time ? " at " + med.time : ""}\n`
      })
      return response.trim()
    }

    // Health condition queries
    if (msg.includes("condition") || msg.includes("health profile") || msg.includes("symptoms")) {
      if (!userProfile) return "Loading your profile..."
      let response = `📍 Location: ${userProfile.location}\n`
      if (userProfile.conditions && userProfile.conditions.length > 0) {
        response += `🏥 Conditions: ${userProfile.conditions.join(", ")}\n`
      }
      if (userProfile.sensitivities && userProfile.sensitivities.length > 0) {
        response += `⚠️ Sensitivities: ${userProfile.sensitivities.slice(0, 3).join(", ")}${userProfile.sensitivities.length > 3 ? "..." : ""}`
      }
      return response
    }

    // Location queries
    if (msg.includes("where am i") || msg.includes("my location") || msg.includes("location")) {
      return userProfile?.location ? `You're in ${userProfile.location}. All environmental data is based on this location.` : "No location set. Please complete onboarding."
    }

    // General safety query - check this LAST to avoid false matches
    if ((msg.includes("safe") || msg.includes("go outside") || msg.includes("outdoor")) && 
        !msg.includes("times") && !msg.includes("when")) {
      if (!airQuality || !pollen) return "Loading environmental data..."
      const aqiData = getAQIDescription(airQuality.aqi)
      const pollenLevel = getOverallPollenLevel(pollen)
      
      if (airQuality.aqi <= 2 && pollenLevel.level !== "High") {
        return `✅ Yes, it's safe to go outside! Air quality is ${aqiData.status} and pollen is ${pollenLevel.level}. Enjoy your outdoor time!`
      } else {
        return `⚠️ Conditions are ${aqiData.status} air and ${pollenLevel.level} pollen. ${userProfile?.conditions?.includes("Asthma") ? "With your asthma, consider limiting time outdoors." : "Be cautious if you have respiratory sensitivities."}`
      }
    }

    // Help/unclear queries
    if (msg.includes("help") || msg.includes("what can you") || msg.length < 5) {
      return "I can help with: weather conditions, air quality (AQI), pollen levels, UV index, exercise safety, best outdoor times, medications, and your health profile. Try asking specific questions like 'What's my weather?' or 'When should I go outside?'"
    }

    // Default response for unrecognized questions
    return `I'm not sure how to answer that specific question. I can help with weather, air quality, pollen, UV index, exercise timing, and outdoor safety for ${userProfile?.location || "your location"}. Try rephrasing or ask: 'What are the best times to go outside today?'`
  }

  const typeMessage = async (text: string) => {
    const tempId = Date.now()
    setMessages(prev => [...prev, { role: "assistant", content: "", isTyping: true }])
    
    const words = text.split(" ")
    let currentText = ""
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i]
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { role: "assistant", content: currentText, isTyping: true }
        return newMessages
      })
      await new Promise(resolve => setTimeout(resolve, 50)) // Typing speed
    }
    
    // Remove typing indicator
    setMessages(prev => {
      const newMessages = [...prev]
      newMessages[newMessages.length - 1] = { role: "assistant", content: text, isTyping: false }
      return newMessages
    })
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)
    
    // Small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const response = generateAIResponse(userMessage)
    await typeMessage(response)
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white/95 flex items-center gap-2">
            <Bot className="h-6 w-6 text-orange-300" />
            AI Health Assistant
          </CardTitle>
          <p className="text-sm text-orange-300/60">
            Powered by your location: {userProfile?.location || "Loading..."}
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[calc(100vh-300px)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-cyan-500/20 text-white/95"
                      : "bg-white/5 backdrop-blur-xl text-white/95 border border-white/10"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-orange-300" />
                      <span className="text-xs text-orange-300">ClearSky AI</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">
                    {message.content}
                    {message.isTyping && (
                      <span className="inline-block w-1 h-4 ml-1 bg-orange-400 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder="Ask about weather, air quality, pollen, or health..."
              className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 placeholder-cyan-400/40"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("What's my weather?")}
              className="text-xs px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-orange-300 border border-white/10 hover:bg-cyan-500/10 transition-all"
              disabled={isLoading}
            >
              Weather?
            </button>
            <button
              onClick={() => setInput("What are the best times to go outside today?")}
              className="text-xs px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-orange-300 border border-white/10 hover:bg-cyan-500/10 transition-all"
              disabled={isLoading}
            >
              Best times?
            </button>
            <button
              onClick={() => setInput("What's the pollen level?")}
              className="text-xs px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-orange-300 border border-white/10 hover:bg-cyan-500/10 transition-all"
              disabled={isLoading}
            >
              Pollen?
            </button>
            <button
              onClick={() => setInput("Is it safe to exercise?")}
              className="text-xs px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-orange-300 border border-white/10 hover:bg-cyan-500/10 transition-all"
              disabled={isLoading}
            >
              Exercise?
            </button>
            <button
              onClick={() => setInput("What's the air quality?")}
              className="text-xs px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-orange-300 border border-white/10 hover:bg-cyan-500/10 transition-all"
              disabled={isLoading}
            >
              Air quality?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
