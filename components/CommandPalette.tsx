"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { CommandPaletteItem } from "../types"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  query: string
  onQueryChange: (query: string) => void
  commands: CommandPaletteItem[]
}

export function CommandPalette({ isOpen, onClose, query, onQueryChange, commands }: CommandPaletteProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search conversations and commands..."
                  className="pl-10 bg-transparent border-0 focus:ring-0 text-lg"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                    <Command className="w-3 h-3" />
                  </kbd>
                  <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">K</kbd>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {commands.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results found</p>
                </div>
              ) : (
                <div className="p-2">
                  {["command", "conversation", "file"].map((category) => {
                    const categoryCommands = commands.filter((cmd) => cmd.category === category)
                    if (categoryCommands.length === 0) return null

                    return (
                      <div key={category} className="mb-4">
                        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {category}s
                        </h3>
                        {categoryCommands.map((command, index) => (
                          <motion.button
                            key={command.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                            onClick={command.action}
                          >
                            <span className="text-2xl">{command.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{command.title}</p>
                              {command.subtitle && <p className="text-sm text-gray-500 truncate">{command.subtitle}</p>}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
