import { type NextRequest, NextResponse } from "next/server"

const LIBRETRANSLATE_API_URL = "https://libretranslate.de/translate"

// Language code mapping for LibreTranslate
const languageMap: Record<string, string> = {
  en: "en",
  hi: "hi",
  bn: "bn",
  te: "te",
  mr: "mr",
  ta: "ta",
  gu: "gu",
  kn: "kn",
  or: "or",
  pa: "pa",
  ml: "ml",
}

export async function POST(request: NextRequest) {
  try {
    const { text, source, target } = await request.json()

    if (!text || !target) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Map language codes
    const sourceCode = languageMap[source] || "en"
    const targetCode = languageMap[target] || target

    // If source and target are the same, return original text
    if (sourceCode === targetCode) {
      return NextResponse.json({ translatedText: text })
    }

    // Call LibreTranslate API
    const response = await fetch(LIBRETRANSLATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode,
        format: "text",
      }),
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      translatedText: data.translatedText || text,
    })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json({ error: "Translation service unavailable" }, { status: 500 })
  }
}
