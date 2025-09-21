"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, CheckCircle, AlertCircle, MapPin, User, Settings } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAlerts } from "@/contexts/alerts-context"
import { motion } from "framer-motion"

interface AlertPreferencesFormProps {
  defaultName?: string
  defaultLocation?: string
  onPreferencesChange?: (preferences: any) => void
}

export function AlertPreferencesForm({
  defaultName = "",
  defaultLocation = "Ludhiana, Punjab",
  onPreferencesChange,
}: AlertPreferencesFormProps) {
  const { t, language } = useLanguage()
  const { addAlert, alertPreferences, updateAlertPreferences } = useAlerts()

  const [formData, setFormData] = useState({
    name: defaultName,
    location: defaultLocation,
    preferences: {
      weather: true,
      pest: true,
      market: true,
      irrigation: true,
      fertilizer: true,
      harvest: true,
    },
    notifications: {
      sound: true,
      voice: true,
      popup: true,
      desktop: false,
    },
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onPreferencesChange?.(formData)
  }, [formData, onPreferencesChange])

  const handleSavePreferences = async () => {
    setIsLoading(true)

    // Simulate saving preferences
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateAlertPreferences({
      showNotifications: formData.notifications.popup,
      autoGenerate: Object.values(formData.preferences).some(Boolean),
    })

    // Add a confirmation alert
    addAlert({
      type: "harvest",
      severity: "low",
      title: "Preferences Updated",
      message: `Your alert preferences have been successfully updated. You'll receive ${Object.entries(formData.preferences).filter(([_, enabled]) => enabled).length} types of alerts.`,
      actionRequired: false,
      location: formData.location,
    })

    setShowSuccess(true)
    setIsLoading(false)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const handleSeverityChange = (severity: string) => {
    updateAlertPreferences({
      minimumSeverity: severity as any,
    })
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
      <CardHeader>
        <CardTitle className="text-emerald-800 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Alert Preferences
        </CardTitle>
        <CardDescription className="text-emerald-600">
          Customize your farming alert preferences and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700 text-sm font-medium">Alert preferences updated successfully!</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            <Label className="text-emerald-700 font-medium">Alert Control</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-800">📱 Show Notifications</span>
              </div>
              <Switch
                checked={alertPreferences.showNotifications}
                onCheckedChange={(checked) => updateAlertPreferences({ showNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-800">🔄 Auto Generate Alerts</span>
              </div>
              <Switch
                checked={alertPreferences.autoGenerate}
                onCheckedChange={(checked) => updateAlertPreferences({ autoGenerate: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-emerald-700">Minimum Alert Severity</Label>
            <Select value={alertPreferences.minimumSeverity} onValueChange={handleSeverityChange}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - All alerts</SelectItem>
                <SelectItem value="medium">Medium - Important alerts</SelectItem>
                <SelectItem value="high">High - Urgent alerts only</SelectItem>
                <SelectItem value="critical">Critical - Emergency alerts only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-emerald-700">
              <User className="h-4 w-4 inline mr-1" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="border-emerald-200 focus:border-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-emerald-700">
              <MapPin className="h-4 w-4 inline mr-1" />
              Farm Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="border-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            <Label className="text-emerald-700 font-medium">Alert Types</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.preferences).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-800 capitalize">
                    {key === "pest"
                      ? "🐛 Pest Alerts"
                      : key === "weather"
                        ? "🌤️ Weather Alerts"
                        : key === "market"
                          ? "💰 Market Prices"
                          : key === "irrigation"
                            ? "💧 Irrigation Reminders"
                            : key === "fertilizer"
                              ? "🌱 Fertilizer Schedule"
                              : "🌾 Harvest Notifications"}
                  </span>
                </div>
                <Switch checked={value} onCheckedChange={(checked) => handlePreferenceChange(key, checked)} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <Label className="text-emerald-700 font-medium">Notification Settings</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800 capitalize">
                    {key === "sound"
                      ? "🔊 Sound Alerts"
                      : key === "voice"
                        ? "🗣️ Voice Announcements"
                        : key === "popup"
                          ? "📱 Popup Notifications"
                          : "🖥️ Desktop Notifications"}
                  </span>
                </div>
                <Switch checked={value} onCheckedChange={(checked) => handleNotificationChange(key, checked)} />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSavePreferences}
          disabled={isLoading || !formData.name}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving Preferences...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Alert Preferences
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-700 text-sm">
            Alerts are now user-controlled and will only appear when you enable notifications
          </span>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            User Controlled
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
