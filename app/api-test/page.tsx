"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function APITestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testWeatherAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test coordinates for New York City
      const lat = 40.7128
      const lon = -74.0060
      const API_KEY = "dec40a13839b118013db7cb66e62bd90"

      console.log("Testing Weather API...")
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      console.log("URL:", weatherUrl)

      const response = await fetch(weatherUrl)
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Weather data:", data)
      setResult(data)
    } catch (err: any) {
      console.error("Test failed:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testAirQualityAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const lat = 40.7128
      const lon = -74.0060
      const API_KEY = "dec40a13839b118013db7cb66e62bd90"

      console.log("Testing Air Quality API...")
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      console.log("URL:", url)

      const response = await fetch(url)
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Air Quality data:", data)
      setResult(data)
    } catch (err: any) {
      console.error("Test failed:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <Card className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white/95">Weather API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={testWeatherAPI}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Test Weather API
            </Button>
            <Button
              onClick={testAirQualityAPI}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Test Air Quality API
            </Button>
          </div>

          {loading && (
            <div className="text-white/70">Loading...</div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="text-red-400 font-bold mb-2">Error:</h3>
              <pre className="text-white/70 text-xs overflow-auto">{error}</pre>
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h3 className="text-emerald-400 font-bold mb-2">Success! Result:</h3>
              <pre className="text-white/70 text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white/95 font-bold mb-2">Instructions:</h3>
            <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
              <li>Click "Test Weather API" to verify the API key works</li>
              <li>Check the browser console (F12) for detailed logs</li>
              <li>If you see a success message, the API is working</li>
              <li>If you see an error, check the error message for details</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
