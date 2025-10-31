const API_KEY = "dec40a13839b118013db7cb66e62bd90"
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const GEO_URL = "https://api.openweathermap.org/geo/1.0"

export interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  description: string
  icon: string
  uvIndex?: number
}

export interface AirQualityData {
  aqi: number // 1-5 (1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor)
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
}

export interface ForecastData {
  date: string
  temp: number
  description: string
  icon: string
  humidity: number
}

// Fetch current weather data (in imperial/American units)
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    console.log(`Fetching weather for lat: ${lat}, lon: ${lon}`)
    // Use imperial units: Fahrenheit for temp, mph for wind speed
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    console.log("Weather API URL:", url)
    
    const response = await fetch(url)
    console.log("Weather API response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Weather API error:", errorText)
      throw new Error(`Weather API failed: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log("Weather data received:", data)
    
    return {
      temp: Math.round(data.main.temp), // Fahrenheit
      feelsLike: Math.round(data.main.feels_like), // Fahrenheit
      humidity: data.main.humidity, // Percentage
      pressure: data.main.pressure, // hPa (standard)
      windSpeed: Math.round(data.wind.speed), // mph (rounded)
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

// Fetch UV Index
export async function getUVIndex(lat: number, lon: number): Promise<number> {
  try {
    console.log(`Fetching UV index for lat: ${lat}, lon: ${lon}`)
    const url = `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    
    const response = await fetch(url)
    console.log("UV API response status:", response.status)
    
    if (!response.ok) {
      console.error("UV API error:", response.status)
      return 5 // Return default moderate value
    }
    
    const data = await response.json()
    console.log("UV data received:", data)
    return Math.round(data.value)
  } catch (error) {
    console.error("Error fetching UV index:", error)
    return 5 // Return default moderate value
  }
}

// Fetch air quality data
export async function getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  try {
    console.log(`Fetching air quality for lat: ${lat}, lon: ${lon}`)
    const url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    console.log("Air Quality API URL:", url)
    
    const response = await fetch(url)
    console.log("Air Quality API response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Air Quality API error:", errorText)
      throw new Error(`Air Quality API failed: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log("Air quality data received:", data)
    
    const components = data.list[0].components
    
    return {
      aqi: data.list[0].main.aqi,
      pm25: components.pm2_5,
      pm10: components.pm10,
      o3: components.o3,
      no2: components.no2,
      so2: components.so2,
      co: components.co,
    }
  } catch (error) {
    console.error("Error fetching air quality data:", error)
    throw error
  }
}

// Fetch 5-day forecast (in imperial/American units)
export async function getForecast(lat: number, lon: number): Promise<ForecastData[]> {
  try {
    // Use imperial units: Fahrenheit for temperature
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    )
    const data = await response.json()
    
    // Get one forecast per day at noon
    const dailyForecasts: ForecastData[] = []
    const processedDates = new Set<string>()
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000)
      const dateString = date.toLocaleDateString()
      
      // Take the first forecast for each day (or closest to noon)
      if (!processedDates.has(dateString) && dailyForecasts.length < 5) {
        processedDates.add(dateString)
        dailyForecasts.push({
          date: dateString,
          temp: Math.round(item.main.temp), // Fahrenheit
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity, // Percentage
        })
      }
    })
    
    return dailyForecasts
  } catch (error) {
    console.error("Error fetching forecast data:", error)
    throw error
  }
}

// Get AQI description
export function getAQIDescription(aqi: number): { status: string; color: string } {
  switch (aqi) {
    case 1:
      return { status: "Good", color: "emerald" }
    case 2:
      return { status: "Fair", color: "green" }
    case 3:
      return { status: "Moderate", color: "amber" }
    case 4:
      return { status: "Poor", color: "orange" }
    case 5:
      return { status: "Very Poor", color: "red" }
    default:
      return { status: "Unknown", color: "gray" }
  }
}

// Get UV Index description
export function getUVDescription(uv: number): { status: string; color: string } {
  if (uv <= 2) return { status: "Low", color: "emerald" }
  if (uv <= 5) return { status: "Moderate", color: "amber" }
  if (uv <= 7) return { status: "High", color: "orange" }
  if (uv <= 10) return { status: "Very High", color: "red" }
  return { status: "Extreme", color: "purple" }
}

// Calculate pollen estimate based on weather conditions
// Note: OpenWeather doesn't have direct pollen data in free tier
// This is a simplified estimation based on weather conditions
export function estimatePollenLevel(
  weather: WeatherData,
  airQuality: AirQualityData
): { level: string; color: string } {
  // Higher humidity, lower wind, warmer temps = potentially higher pollen
  let pollenScore = 0
  
  // Temperature factor (ideal pollen temps 15-25°C)
  if (weather.temp >= 15 && weather.temp <= 25) pollenScore += 2
  else if (weather.temp > 10 && weather.temp < 30) pollenScore += 1
  
  // Humidity factor (higher humidity can reduce pollen)
  if (weather.humidity < 40) pollenScore += 2
  else if (weather.humidity < 60) pollenScore += 1
  
  // Wind factor (low wind = pollen accumulates)
  if (weather.windSpeed < 3) pollenScore += 2
  else if (weather.windSpeed < 6) pollenScore += 1
  
  // Rain reduces pollen
  if (weather.description.includes("rain")) pollenScore -= 2
  
  if (pollenScore >= 4) return { level: "High", color: "red" }
  if (pollenScore >= 2) return { level: "Moderate", color: "amber" }
  return { level: "Low", color: "emerald" }
}
