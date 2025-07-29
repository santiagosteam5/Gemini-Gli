"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Command } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { GeminiButton } from "./GeminiButton"

interface GeminiInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFileUpload: () => void
  placeholder?: string
  suggestions?: string[]
  disabled?: boolean
}

export function GeminiInput({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  placeholder = "Ask Gemini anything...",
  suggestions = [],
  disabled = false,
}: GeminiInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !disabled) {
      e.preventDefault()
      onSubmit()
    }
  }

  // Click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div ref={containerRef} className="relative">
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#2d2d2d] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                onClick={() => {
                  onChange(suggestion)
                  setShowSuggestions(false)
                }}
                whileHover={{ x: 4 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <motion.div
        className={`relative bg-white dark:bg-[#2d2d2d] rounded-2xl border-2 transition-all duration-200 ${
          isFocused ? "border-[#4285f4] shadow-lg shadow-blue-500/10" : "border-gray-200 dark:border-gray-700"
        }`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            setShowSuggestions(true)
          }}
          onBlur={() => {
            setIsFocused(false)
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none border-0 focus:ring-0 bg-transparent rounded-2xl pr-24 text-[#202124] dark:text-[#e8eaed] placeholder-[#5f6368] dark:placeholder-[#9aa0a6]"
        />

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <motion.button
            className="p-2 text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#4285f4] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={onFileUpload}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          <GeminiButton
            size="sm"
            gradient
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            className="px-3 py-2"
          >
            <Send className="w-4 h-4" />
          </GeminiButton>
        </div>
      </motion.div>

      {/* Input Hints */}
      <div className="flex items-center justify-between mt-2 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Command className="w-3 h-3" />
            <span>⏎ to send</span>
          </span>
          <span>/ for commands</span>
        </div>
        <span>{value.length}/32,000</span>
      </div>
    </div>
  )
}
