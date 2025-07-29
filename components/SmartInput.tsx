"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Mic, Hash, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface SmartInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFileUpload: () => void
  placeholder?: string
}

interface Suggestion {
  id: string
  text: string
  description: string
  type: "command" | "mention" | "completion"
}

export function SmartInput({ value, onChange, onSubmit, onFileUpload, placeholder }: SmartInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const slashCommands: Suggestion[] = [
    { id: "1", text: "/explain", description: "Explain a concept", type: "command" },
    { id: "2", text: "/code", description: "Generate code", type: "command" },
    { id: "3", text: "/debug", description: "Debug code", type: "command" },
    { id: "4", text: "/optimize", description: "Optimize code", type: "command" },
  ]

  useEffect(() => {
    const lastWord = value.split(" ").pop() || ""

    if (lastWord.startsWith("/")) {
      const filtered = slashCommands.filter((cmd) => cmd.text.toLowerCase().includes(lastWord.toLowerCase()))
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else if (lastWord.startsWith("@")) {
      // File mentions would go here
      setSuggestions([])
      setShowSuggestions(false)
    } else {
      setShowSuggestions(false)
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault()
        applySuggestion(suggestions[selectedSuggestion])
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  const applySuggestion = (suggestion: Suggestion) => {
    const words = value.split(" ")
    words[words.length - 1] = suggestion.text + " "
    onChange(words.join(" "))
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message... Use / for commands, @ for files"}
          className="min-h-[60px] max-h-[200px] resize-none border-0 focus:ring-0 rounded-2xl pr-24"
        />

        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onFileUpload}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Mic className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-8 w-8 p-0" onClick={onSubmit} disabled={!value.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  index === selectedSuggestion ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => applySuggestion(suggestion)}
                whileHover={{ x: 4 }}
              >
                <div className="flex-shrink-0">
                  {suggestion.type === "command" && <Hash className="w-4 h-4 text-blue-500" />}
                  {suggestion.type === "mention" && <AtSign className="w-4 h-4 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{suggestion.text}</p>
                  <p className="text-sm text-gray-500">{suggestion.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input hints */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>⌘↵ to send</span>
          <span>/ for commands</span>
          <span>@ for files</span>
        </div>
        <span>{value.length}/4000</span>
      </div>
    </div>
  )
}
