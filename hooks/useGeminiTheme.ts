"use client"

import { useState, useEffect } from "react"
import type { GeminiTheme } from "../types/gemini"

export function useGeminiTheme() {
  const [theme, setTheme] = useState<GeminiTheme>("auto")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("gemini-theme") as GeminiTheme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === "auto") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setResolvedTheme(isDark ? "dark" : "light")
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()
    localStorage.setItem("gemini-theme", theme)

    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", updateResolvedTheme)
      return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  return { theme, setTheme, resolvedTheme }
}
