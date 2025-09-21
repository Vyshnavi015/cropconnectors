"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplets, Wind, Eye, Gauge, Sun, Moon, CloudRain, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslation } from "@/hooks/use-translation"
import { motion } from "framer-motion"

interface WeatherData {
  location: {
    name: string
    country: string
    sunrise: string
    sunset: string
  }
  current: {
    temperature: number
    feelsLike: number
    minTemp: number
    maxTemp: number
    humidity: number
    pressure: number
    windSpeed: number
    windDirection: number
    visibility: number
    description: string
    icon: string
    cloudiness: number
    dewPoint: number
  }
  farming: {
    soilMoisture: string
    irrigationAdvice: string
    pestRisk: string
    fieldWorkSuitability: string
    cropStress: string
    plantingConditions: string
    harvestAdvice: string
  }
  alerts: Array<{
    type: string
    severity: string
    message: string
  }>
}

interface EnhancedWeatherCardProps {
  location?: string
  showForecast?: boolean
  compact?: boolean
}

export function EnhancedWeatherCard({
  location = "Ludhiana,IN",
  showForecast = true,
  compact = false,
}: EnhancedWeatherCardProps) {
  const { t, language } = useLanguage()
  const { translateText, isTranslating } = useTranslation()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchWeatherData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}&lang=${language}`)
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weather data unavailable")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location, language])

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      "01d": "☀️",
      "01n": "🌙",
      "02d": "⛅",
      "02n": "☁️",
      "03d": "☁️",
      "03n": "☁️",
      "04d": "☁️",
      "04n": "☁️",
      "09d": "🌧️",
      "09n": "🌧️",
      "10d": "🌦️",
      "10n": "🌧️",
      "11d": "⛈️",
      "11n": "⛈️",
      "13d": "❄️",
      "13n": "❄️",
      "50d": "🌫️",
      "50n": "🌫️",
    }
    return iconMap[iconCode] || "🌤️"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    })
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
          <span className="text-emerald-600">Loading weather data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !weatherData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-red-200">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error || "Weather data unavailable"}</p>
            <Button onClick={fetchWeatherData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getWeatherIcon(weatherData.current.icon)}</div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">{weatherData.current.temperature}°C</div>
                <div className="text-xs text-emerald-600 capitalize">{weatherData.current.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-emerald-700">{weatherData.location.name}</div>
              <div className="text-xs text-emerald-500">
                {lastUpdated?.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <div className="text-2xl">{getWeatherIcon(weatherData.current.icon)}</div>
                {t("dashboard.weather")} - {weatherData.location.name}
              </CardTitle>
              <CardDescription className="text-emerald-600 capitalize">
                {weatherData.current.description}
              </CardDescription>
            </div>
            <Button
              onClick={fetchWeatherData}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Weather */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <Thermometer className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-orange-700">{weatherData.current.temperature}°C</div>
              <div className="text-xs text-orange-600">Feels {weatherData.current.feelsLike}°C</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-700">{weatherData.current.humidity}%</div>
              <div className="text-xs text-blue-600">Humidity</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-100">
              <Wind className="h-5 w-5 text-gray-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-700">{weatherData.current.windSpeed} m/s</div>
              <div className="text-xs text-gray-600">Wind Speed</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
              <Gauge className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-700">{weatherData.current.pressure}</div>
              <div className="text-xs text-purple-600">hPa</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <Eye className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800">Visibility</div>
                <div className="text-emerald-600">{weatherData.current.visibility} km</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <Sun className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800">Sunrise</div>
                <div className="text-emerald-600">{formatTime(weatherData.location.sunrise)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <Moon className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800">Sunset</div>
                <div className="text-emerald-600">{formatTime(weatherData.location.sunset)}</div>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          {weatherData.alerts && weatherData.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-emerald-800 flex items-center gap-2">
                <CloudRain className="h-4 w-4" />
                Weather Alerts
              </h4>
              {weatherData.alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <Badge className={`${getSeverityColor(alert.severity)} text-white`}>{alert.severity}</Badge>
                  <span className="text-sm text-yellow-800 flex-1">{alert.message}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Farming Insights */}
          <div className="space-y-3">
            <h4 className="font-medium text-emerald-800">Farming Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                <div className="text-sm font-medium text-emerald-800 mb-1">Soil Moisture</div>
                <div className="text-emerald-700">{weatherData.farming.soilMoisture}</div>
              </div>

              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                <div className="text-sm font-medium text-emerald-800 mb-1">Crop Stress</div>
                <div className="text-emerald-700">{weatherData.farming.cropStress}</div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="text-sm font-medium text-blue-800 mb-1">Irrigation</div>
                <div className="text-blue-700 text-sm">{weatherData.farming.irrigationAdvice}</div>
              </div>

              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="text-sm font-medium text-orange-800 mb-1">Pest Risk</div>
                <div className="text-orange-700 text-sm">{weatherData.farming.pestRisk}</div>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                <div className="text-sm font-medium text-purple-800 mb-1">Field Work</div>
                <div className="text-purple-700 text-sm">{weatherData.farming.fieldWorkSuitability}</div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-lime-50 rounded-lg border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-1">Harvest Advice</div>
                <div className="text-green-700 text-sm">{weatherData.farming.harvestAdvice}</div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-emerald-500 text-center">
              Last updated:{" "}
              {lastUpdated.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
