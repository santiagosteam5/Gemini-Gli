"use client"

import { motion } from "framer-motion"

interface GeminiLogoProps {
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function GeminiLogo({ size = "md", animated = false }: GeminiLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const sparkVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1.2, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: animated ? Number.POSITIVE_INFINITY : 0,
        repeatType: "loop" as const,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <motion.div variants={sparkVariants} initial="initial" animate="animate" className="absolute inset-0">
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <defs>
            <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285f4" />
              <stop offset="50%" stopColor="#9c27b0" />
              <stop offset="100%" stopColor="#ea4335" />
            </linearGradient>
          </defs>

          {/* Main star shape */}
          <path
            d="M16 2l3.5 10.5L30 16l-10.5 3.5L16 30l-3.5-10.5L2 16l10.5-3.5L16 2z"
            fill="url(#gemini-gradient)"
            className="drop-shadow-sm"
          />

          {/* Inner sparkle */}
          <circle cx="16" cy="16" r="3" fill="white" opacity="0.9" />

          {/* Additional sparkles */}
          <circle cx="8" cy="8" r="1.5" fill="url(#gemini-gradient)" opacity="0.7" />
          <circle cx="24" cy="8" r="1.5" fill="url(#gemini-gradient)" opacity="0.7" />
          <circle cx="8" cy="24" r="1.5" fill="url(#gemini-gradient)" opacity="0.7" />
          <circle cx="24" cy="24" r="1.5" fill="url(#gemini-gradient)" opacity="0.7" />
        </svg>
      </motion.div>
    </div>
  )
}
