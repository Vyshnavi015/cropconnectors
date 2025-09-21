import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const city = searchParams.get("city")
  const lang = searchParams.get("lang") || "en"

  if (!process.env.OPENWEATHER_API_KEY) {
    return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 })
  }

  try {
    let weatherUrl = ""
    let forecastUrl = ""

    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
    } else if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
    } else {
      // Default to Ludhiana, Punjab for farming context
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=Ludhiana,IN&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Ludhiana,IN&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=${lang}`
    }

    const [weatherResponse, forecastResponse] = await Promise.all([fetch(weatherUrl), fetch(forecastUrl)])

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()
    let forecastData = null

    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json()
    }

    const transformedData = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon,
        },
        timezone: weatherData.timezone,
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString(),
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        minTemp: Math.round(weatherData.main.temp_min),
        maxTemp: Math.round(weatherData.main.temp_max),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        windGust: weatherData.wind?.gust || 0,
        visibility: (weatherData.visibility || 10000) / 1000, // Convert to km
        description: weatherData.weather[0].description,
        main: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        cloudiness: weatherData.clouds?.all || 0,
        dewPoint: calculateDewPoint(weatherData.main.temp, weatherData.main.humidity),
      },
      farming: {
        soilMoisture: calculateSoilMoisture(weatherData.main.humidity, weatherData.clouds?.all || 0),
        irrigationAdvice: getIrrigationAdvice(
          weatherData.main.temp,
          weatherData.main.humidity,
          weatherData.clouds?.all || 0,
          weatherData.weather[0].main,
        ),
        pestRisk: getPestRisk(weatherData.main.temp, weatherData.main.humidity, weatherData.weather[0].main),
        fieldWorkSuitability: getFieldWorkSuitability(weatherData.weather[0].main, weatherData.wind?.speed || 0),
        cropStress: getCropStressLevel(weatherData.main.temp, weatherData.main.humidity, weatherData.wind?.speed || 0),
        plantingConditions: getPlantingConditions(
          weatherData.main.temp,
          weatherData.main.humidity,
          weatherData.weather[0].main,
        ),
        harvestAdvice: getHarvestAdvice(
          weatherData.main.humidity,
          weatherData.wind?.speed || 0,
          weatherData.weather[0].main,
        ),
      },
      forecast: forecastData ? processForecastData(forecastData) : null,
      alerts: generateWeatherAlerts(weatherData),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

function calculateDewPoint(temp: number, humidity: number): number {
  const a = 17.27
  const b = 237.7
  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100)
  return Math.round((b * alpha) / (a - alpha))
}

function calculateSoilMoisture(humidity: number, cloudiness: number): string {
  const moistureLevel = humidity * 0.7 + cloudiness * 0.3
  if (moistureLevel > 75) return "Very High"
  if (moistureLevel > 60) return "High"
  if (moistureLevel > 40) return "Medium"
  if (moistureLevel > 25) return "Low"
  return "Very Low"
}

function getIrrigationAdvice(temp: number, humidity: number, cloudiness: number, condition: string): string {
  if (condition.includes("rain")) {
    return "Skip irrigation - Natural rainfall expected"
  }
  if (temp > 35 && humidity < 30) {
    return "Critical irrigation needed - Extreme heat and low humidity"
  }
  if (temp > 32 && humidity < 40) {
    return "High irrigation needed - Hot and dry conditions"
  }
  if (temp > 28 && humidity < 50 && cloudiness < 30) {
    return "Moderate irrigation recommended - Warm and clear"
  }
  if (cloudiness > 70) {
    return "Reduce irrigation - Cloudy conditions reduce evaporation"
  }
  if (humidity > 80) {
    return "Light irrigation only - High humidity present"
  }
  return "Normal irrigation schedule - Balanced conditions"
}

function getPestRisk(temp: number, humidity: number, condition: string): string {
  if (condition.includes("rain") && temp > 20 && temp < 30) {
    return "Very High - Post-rain conditions ideal for pest breeding"
  }
  if (temp > 25 && temp < 35 && humidity > 70) {
    return "High - Optimal temperature and humidity for pest development"
  }
  if (temp > 20 && temp < 30 && humidity > 60) {
    return "Medium-High - Favorable conditions for most pests"
  }
  if (temp > 15 && humidity > 50) {
    return "Medium - Monitor crops regularly for pest activity"
  }
  if (temp < 10 || temp > 40) {
    return "Low - Extreme temperatures limit pest activity"
  }
  return "Low - Conditions not favorable for pest development"
}

function getFieldWorkSuitability(condition: string, windSpeed: number): string {
  if (condition.includes("thunderstorm") || condition.includes("tornado")) {
    return "Dangerous - Severe weather conditions, stay indoors"
  }
  if (condition.includes("rain") || condition.includes("drizzle")) {
    return "Not suitable - Wet conditions, avoid field operations"
  }
  if (condition.includes("snow") || condition.includes("sleet")) {
    return "Not suitable - Winter conditions, equipment may be damaged"
  }
  if (windSpeed > 15) {
    return "Limited - Very high winds, avoid spraying and aerial operations"
  }
  if (windSpeed > 10) {
    return "Caution - High winds may affect spraying accuracy"
  }
  if (condition.includes("fog") || condition.includes("mist")) {
    return "Limited visibility - Use caution with machinery"
  }
  return "Excellent - Ideal conditions for all field operations"
}

function getCropStressLevel(temp: number, humidity: number, windSpeed: number): string {
  let stressScore = 0

  // Temperature stress
  if (temp > 35 || temp < 5) stressScore += 3
  else if (temp > 30 || temp < 10) stressScore += 2
  else if (temp > 28 || temp < 15) stressScore += 1

  // Humidity stress
  if (humidity < 20 || humidity > 90) stressScore += 2
  else if (humidity < 30 || humidity > 80) stressScore += 1

  // Wind stress
  if (windSpeed > 12) stressScore += 2
  else if (windSpeed > 8) stressScore += 1

  if (stressScore >= 5) return "Severe - Immediate action required"
  if (stressScore >= 3) return "High - Monitor closely and take preventive measures"
  if (stressScore >= 2) return "Moderate - Some stress factors present"
  return "Low - Favorable conditions for crop growth"
}

function getPlantingConditions(temp: number, humidity: number, condition: string): string {
  if (condition.includes("rain")) {
    return "Poor - Wait for soil to dry before planting"
  }
  if (temp < 10) {
    return "Poor - Soil too cold for most crops"
  }
  if (temp > 35) {
    return "Poor - Too hot, seeds may not germinate properly"
  }
  if (temp >= 15 && temp <= 25 && humidity >= 40 && humidity <= 70) {
    return "Excellent - Ideal temperature and moisture for planting"
  }
  if (temp >= 12 && temp <= 30 && humidity >= 30) {
    return "Good - Suitable conditions for most crops"
  }
  return "Fair - Acceptable but monitor conditions closely"
}

function getHarvestAdvice(humidity: number, windSpeed: number, condition: string): string {
  if (condition.includes("rain")) {
    return "Postpone - Wet conditions will damage harvested crops"
  }
  if (humidity > 80) {
    return "Wait - High humidity may cause spoilage during storage"
  }
  if (windSpeed > 12) {
    return "Caution - High winds may cause crop loss during harvest"
  }
  if (humidity < 60 && windSpeed < 8 && !condition.includes("rain")) {
    return "Excellent - Perfect conditions for harvesting and drying"
  }
  return "Good - Suitable conditions for harvest operations"
}

function processForecastData(forecastData: any) {
  const dailyForecasts = []
  const processedDates = new Set()

  for (const item of forecastData.list.slice(0, 40)) {
    // 5 days * 8 forecasts per day
    const date = new Date(item.dt * 1000).toDateString()

    if (!processedDates.has(date) && dailyForecasts.length < 5) {
      processedDates.add(date)
      dailyForecasts.push({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: {
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max),
          avg: Math.round(item.main.temp),
        },
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind?.speed || 0,
        precipitation: item.rain?.["3h"] || item.snow?.["3h"] || 0,
        cloudiness: item.clouds?.all || 0,
        farmingAdvice: getDailyFarmingAdvice(item.main.temp, item.main.humidity, item.weather[0].main),
      })
    }
  }

  return dailyForecasts
}

function getDailyFarmingAdvice(temp: number, humidity: number, condition: string): string {
  if (condition.includes("rain")) {
    return "Plan indoor activities, check drainage systems"
  }
  if (temp > 35) {
    return "Provide shade for livestock, increase irrigation"
  }
  if (temp < 5) {
    return "Protect sensitive crops from frost damage"
  }
  if (humidity < 30 && temp > 25) {
    return "Monitor crop water stress, consider additional irrigation"
  }
  return "Normal farming operations can continue"
}

function generateWeatherAlerts(weatherData: any): Array<{ type: string; severity: string; message: string }> {
  const alerts = []
  const temp = weatherData.main.temp
  const humidity = weatherData.main.humidity
  const windSpeed = weatherData.wind?.speed || 0
  const condition = weatherData.weather[0].main.toLowerCase()

  // Temperature alerts
  if (temp > 40) {
    alerts.push({
      type: "heat",
      severity: "critical",
      message: "Extreme heat warning - Protect crops and livestock from heat stress",
    })
  } else if (temp > 35) {
    alerts.push({
      type: "heat",
      severity: "high",
      message: "High temperature alert - Increase irrigation and provide shade",
    })
  }

  if (temp < 0) {
    alerts.push({
      type: "frost",
      severity: "critical",
      message: "Frost warning - Protect sensitive crops immediately",
    })
  } else if (temp < 5) {
    alerts.push({
      type: "cold",
      severity: "high",
      message: "Cold weather alert - Monitor crop health closely",
    })
  }

  // Wind alerts
  if (windSpeed > 15) {
    alerts.push({
      type: "wind",
      severity: "high",
      message: "High wind warning - Secure equipment and avoid spraying operations",
    })
  }

  // Humidity alerts
  if (humidity < 20) {
    alerts.push({
      type: "drought",
      severity: "medium",
      message: "Low humidity alert - Increase irrigation frequency",
    })
  }

  // Weather condition alerts
  if (condition.includes("thunderstorm")) {
    alerts.push({
      type: "storm",
      severity: "critical",
      message: "Thunderstorm warning - Secure livestock and equipment",
    })
  }

  return alerts
}
