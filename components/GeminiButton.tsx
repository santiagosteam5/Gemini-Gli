"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface GeminiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  gradient?: boolean
  children: React.ReactNode
}

export function GeminiButton({
  variant = "primary",
  size = "md",
  gradient = false,
  children,
  className = "",
  ...props
}: GeminiButtonProps) {
  const baseClasses = "relative overflow-hidden font-medium transition-all duration-200"

  const variantClasses = {
    primary: gradient
      ? "bg-gradient-to-r from-[#4285f4] via-[#9c27b0] to-[#ea4335] text-white hover:shadow-lg hover:shadow-blue-500/25"
      : "bg-[#4285f4] text-white hover:bg-[#3367d6]",
    secondary:
      "bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 text-[#202124] dark:text-[#e8eaed] hover:bg-gray-50 dark:hover:bg-gray-800",
    ghost: "text-[#5f6368] dark:text-[#9aa0a6] hover:bg-gray-100 dark:hover:bg-gray-800",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  )
}
