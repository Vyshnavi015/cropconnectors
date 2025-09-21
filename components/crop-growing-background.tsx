"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface FloatingElement {
  id: number
  type: "leaf" | "seed" | "sprout" | "flower" | "grain"
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function CropGrowingBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const generateElements = () => {
      const newElements: FloatingElement[] = []
      const types: FloatingElement["type"][] = ["leaf", "seed", "sprout", "flower", "grain"]

      for (let i = 0; i < 25; i++) {
        newElements.push({
          id: i,
          type: types[Math.floor(Math.random() * types.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 10,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 10,
        })
      }
      setElements(newElements)
    }

    generateElements()
  }, [])

  const getElementIcon = (type: FloatingElement["type"]) => {
    switch (type) {
      case "leaf":
        return "🌿"
      case "seed":
        return "🌱"
      case "sprout":
        return "🌾"
      case "flower":
        return "🌸"
      case "grain":
        return "🌾"
      default:
        return "🌿"
    }
  }

  const getElementColor = (type: FloatingElement["type"]) => {
    switch (type) {
      case "leaf":
        return "text-emerald-400/30"
      case "seed":
        return "text-green-500/25"
      case "sprout":
        return "text-lime-400/30"
      case "flower":
        return "text-pink-400/25"
      case "grain":
        return "text-yellow-500/30"
      default:
        return "text-emerald-400/30"
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-yellow-50/80" />

      {/* Animated Growing Pattern */}
      <div className="absolute inset-0">
        {/* Root-like growing lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="growing-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <motion.path
                d="M100,200 Q120,150 100,100 Q80,50 100,0"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
              <motion.path
                d="M0,100 Q50,80 100,100 Q150,120 200,100"
                stroke="url(#gradient)"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 2 }}
              />
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#growing-pattern)" />
        </svg>
      </div>

      {/* Floating Crop Elements */}
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${getElementColor(element.type)} select-none`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
          }}
          initial={{
            opacity: 0,
            scale: 0,
            rotate: 0,
            y: 20,
          }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            scale: [0, 1, 1.1, 1, 0],
            rotate: [0, 10, -10, 5, 0],
            y: [20, -10, 0, -5, 20],
            x: [0, 10, -5, 8, 0],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {getElementIcon(element.type)}
        </motion.div>
      ))}

      {/* Growing Sprouts from Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`sprout-${i}`}
            className="absolute bottom-0 text-emerald-500/20"
            style={{
              left: `${i * 8.33 + Math.random() * 5}%`,
              fontSize: `${Math.random() * 15 + 20}px`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: [0, 1, 0.8, 1],
              opacity: [0, 0.4, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              delay: Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeOut",
            }}
            style={{ transformOrigin: "bottom" }}
          >
            🌱
          </motion.div>
        ))}
      </div>

      {/* Subtle Particle Effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              delay: Math.random() * 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Seasonal Color Shifts */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(132, 204, 22, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
}
