"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useLanguage } from "./language-context"

export interface Alert {
  id: string
  type: "weather" | "pest" | "market" | "irrigation" | "fertilizer" | "harvest"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
  location?: string
  cropType?: string
  expiresAt?: Date
}

interface AlertsContextType {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, "id" | "timestamp" | "isRead">) => void
  markAsRead: (alertId: string) => void
  markAllAsRead: () => void
  dismissAlert: (alertId: string) => void
  getAlertsByType: (type: Alert["type"]) => Alert[]
  getActiveAlerts: () => Alert[]
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined)

export const useAlerts = () => {
  const context = useContext(AlertsContext)
  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider")
  }
  return context
}

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Initialize with sample alerts and set up auto-generation
  useEffect(() => {
    const sampleAlerts: Alert[] = [
      {
        id: "1",
        type: "weather",
        severity: "high",
        title: t("alerts.weather"),
        message: "Heavy rainfall expected in next 24 hours. Protect your crops and ensure proper drainage.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        actionRequired: true,
        location: "Punjab, Ludhiana",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        type: "pest",
        severity: "critical",
        title: t("alerts.pest"),
        message: "Brown plant hopper detected in nearby farms. Immediate action recommended.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        actionRequired: true,
        cropType: "Rice",
        location: "Punjab, Ludhiana",
      },
      {
        id: "3",
        type: "market",
        severity: "medium",
        title: t("alerts.market"),
        message: "Wheat prices increased by 8% in Ludhiana mandi. Good time to sell.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: true,
        actionRequired: false,
        cropType: "Wheat",
        location: "Ludhiana Mandi",
      },
      {
        id: "4",
        type: "irrigation",
        severity: "medium",
        title: t("alerts.irrigation"),
        message: "Soil moisture levels are low. Consider irrigation for optimal crop growth.",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        isRead: false,
        actionRequired: true,
        cropType: "Cotton",
      },
      {
        id: "5",
        type: "fertilizer",
        severity: "low",
        title: t("alerts.fertilizer"),
        message: "Time for nitrogen application based on your crop growth stage.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: false,
        actionRequired: true,
        cropType: "Wheat",
      },
    ]

    setAlerts(sampleAlerts)

    // Set up periodic alert generation for demo purposes
    const alertInterval = setInterval(() => {
      generateRandomAlert()
    }, 300000) // Generate new alert every 5 minutes

    return () => clearInterval(alertInterval)
  }, [t])

  const generateRandomAlert = useCallback(() => {
    const alertTypes: Alert["type"][] = ["weather", "pest", "market", "irrigation", "fertilizer", "harvest"]
    const severities: Alert["severity"][] = ["low", "medium", "high", "critical"]
    const locations = ["Punjab, Ludhiana", "Punjab, Amritsar", "Punjab, Jalandhar", "Haryana, Karnal"]
    const crops = ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize"]

    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    const randomCrop = crops[Math.floor(Math.random() * crops.length)]

    const alertMessages = {
      weather: [
        "Temperature expected to rise above 40°C. Increase irrigation frequency.",
        "Strong winds predicted. Secure your crops and equipment.",
        "Hailstorm warning issued for your area. Take protective measures.",
        "Humidity levels dropping rapidly. Monitor crop stress indicators.",
      ],
      pest: [
        "Aphid infestation detected in nearby fields. Check your crops immediately.",
        "Bollworm activity increased. Consider pest control measures.",
        "Fungal disease symptoms reported. Apply preventive treatments.",
        "Locust swarm approaching your region. Prepare protective measures.",
      ],
      market: [
        `${randomCrop} prices showing upward trend. Consider selling strategy.`,
        "New government subsidy announced for organic farming.",
        "Export demand increased for your crop variety.",
        "Local mandi prices fluctuating. Monitor for best selling opportunity.",
      ],
      irrigation: [
        "Soil moisture below optimal levels. Schedule irrigation immediately.",
        "Water table levels dropping. Consider water conservation methods.",
        "Irrigation system maintenance due. Check for blockages and leaks.",
        "Optimal irrigation window opening based on weather forecast.",
      ],
      fertilizer: [
        "Nitrogen deficiency symptoms detected. Apply urea fertilizer.",
        "Phosphorus application recommended for current growth stage.",
        "Organic compost application window opening.",
        "Micronutrient deficiency indicators present. Consider foliar spray.",
      ],
      harvest: [
        `${randomCrop} reaching maturity. Prepare for harvest in 7-10 days.`,
        "Optimal harvest conditions expected next week.",
        "Post-harvest storage facilities booking recommended.",
        "Quality testing scheduled for your crop batch.",
      ],
    }

    const messages = alertMessages[randomType]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: randomType,
      severity: randomSeverity,
      title: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Alert`,
      message: randomMessage,
      timestamp: new Date(),
      isRead: false,
      actionRequired: randomSeverity === "high" || randomSeverity === "critical",
      location: randomLocation,
      cropType: randomCrop,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]) // Keep only latest 50 alerts
  }, [])

  const addAlert = useCallback((alertData: Omit<Alert, "id" | "timestamp" | "isRead">) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    }
    setAlerts((prev) => [newAlert, ...prev])
  }, [])

  const markAsRead = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })))
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }, [])

  const getAlertsByType = useCallback(
    (type: Alert["type"]) => {
      return alerts.filter((alert) => alert.type === type)
    },
    [alerts],
  )

  const getActiveAlerts = useCallback(() => {
    const now = new Date()
    return alerts.filter((alert) => !alert.expiresAt || alert.expiresAt > now)
  }, [alerts])

  const unreadCount = alerts.filter((alert) => !alert.isRead).length

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        unreadCount,
        addAlert,
        markAsRead,
        markAllAsRead,
        dismissAlert,
        getAlertsByType,
        getActiveAlerts,
      }}
    >
      {children}
    </AlertsContext.Provider>
  )
}
