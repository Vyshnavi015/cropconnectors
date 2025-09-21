"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string
  }
}

interface UseTranslationReturn {
  translateText: (text: string, targetLang?: string) => Promise<string>
  isTranslating: boolean
  error: string | null
  clearCache: () => void
}

export function useTranslation(): UseTranslationReturn {
  const { language } = useLanguage()
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<TranslationCache>({})

  const translateText = useCallback(
    async (text: string, targetLang?: string): Promise<string> => {
      const target = targetLang || language

      // Return original text if it's English and target is English
      if (target === "en") {
        return text
      }

      // Check cache first
      const cacheKey = `${text}_${target}`
      if (cache[text]?.[target]) {
        return cache[text][target]
      }

      setIsTranslating(true)
      setError(null)

      try {
        // Use LibreTranslate API for dynamic translation
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            source: "en",
            target,
          }),
        })

        if (!response.ok) {
          throw new Error("Translation failed")
        }

        const data = await response.json()
        const translatedText = data.translatedText || text

        // Cache the translation
        setCache((prev) => ({
          ...prev,
          [text]: {
            ...prev[text],
            [target]: translatedText,
          },
        }))

        // Store in localStorage for persistence
        const cacheData = JSON.parse(localStorage.getItem("translationCache") || "{}")
        cacheData[cacheKey] = translatedText
        localStorage.setItem("translationCache", JSON.stringify(cacheData))

        return translatedText
      } catch (err) {
        console.error("Translation error:", err)
        setError(err instanceof Error ? err.message : "Translation failed")
        return text // Return original text on error
      } finally {
        setIsTranslating(false)
      }
    },
    [language, cache],
  )

  const clearCache = useCallback(() => {
    setCache({})
    localStorage.removeItem("translationCache")
  }, [])

  return {
    translateText,
    isTranslating,
    error,
    clearCache,
  }
}
