"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("gemini-theme") as "light" | "dark" | "high-contrast"
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("gemini-theme", theme)
    document.documentElement.className = theme
  }, [theme])

  return { theme, setTheme }
}
