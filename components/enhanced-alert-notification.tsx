"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAlerts, type Alert } from "@/contexts/alerts-context"
import { useVoice } from "@/contexts/voice-context"
import { X, Volume2, CheckCircle, Bell, Zap, AlertTriangle, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function EnhancedAlertNotification() {
  const { alerts, markAsRead, dismissAlert } = useAlerts()
  const { speak } = useVoice()
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])
  const [hasSpoken, setHasSpoken] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Show up to 3 most recent unread critical or high severity alerts
    const criticalAlerts = alerts
      .filter((alert) => !alert.isRead && (alert.severity === "critical" || alert.severity === "high"))
      .slice(0, 3)

    setVisibleAlerts(criticalAlerts)

    // Speak new alerts
    criticalAlerts.forEach((alert) => {
      if (!hasSpoken.has(alert.id)) {
        speak(`${alert.severity} alert: ${alert.title}. ${alert.message}`)
        setHasSpoken((prev) => new Set(prev).add(alert.id))
      }
    })
  }, [alerts, speak, hasSpoken])

  const handleDismiss = (alertId: string) => {
    setVisibleAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const handleMarkAsRead = (alert: Alert) => {
    markAsRead(alert.id)
    setVisibleAlerts((prev) => prev.filter((a) => a.id !== alert.id))
  }

  const handleSpeak = (alert: Alert) => {
    speak(`${alert.severity} ${alert.type} alert: ${alert.title}. ${alert.message}`)
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50 shadow-red-100"
      case "high":
        return "border-orange-500 bg-orange-50 shadow-orange-100"
      case "medium":
        return "border-yellow-500 bg-yellow-50 shadow-yellow-100"
      case "low":
        return "border-blue-500 bg-blue-50 shadow-blue-100"
      default:
        return "border-gray-500 bg-gray-50 shadow-gray-100"
    }
  }

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <Zap className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  if (visibleAlerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3">
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`border-l-4 ${getSeverityColor(alert.severity)} shadow-lg backdrop-blur-sm`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <Badge
                      className={
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800 animate-pulse"
                          : alert.severity === "high"
                            ? "bg-orange-100 text-orange-800"
                            : alert.severity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-gray-700 text-sm mb-3">{alert.message}</p>

                {alert.location && <p className="text-xs text-gray-500 mb-3">📍 {alert.location}</p>}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsRead(alert)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSpeak(alert)}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
