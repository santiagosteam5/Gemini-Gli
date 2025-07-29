"use client"

import { useState, useMemo } from "react"
import type { CommandPaletteItem, Conversation } from "../types"

export function useCommandPalette(conversations: Conversation[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")

  const commands: CommandPaletteItem[] = useMemo(
    () => [
      {
        id: "new-conversation",
        title: "New Conversation",
        subtitle: "Start a fresh chat",
        icon: "💬",
        category: "command",
        action: () => {
          // Implementation would go here
          setIsOpen(false)
        },
      },
      {
        id: "export-conversation",
        title: "Export Conversation",
        subtitle: "Save as markdown, PDF, or JSON",
        icon: "📤",
        category: "command",
        action: () => {
          setIsOpen(false)
        },
      },
      {
        id: "toggle-theme",
        title: "Toggle Theme",
        subtitle: "Switch between light and dark mode",
        icon: "🎨",
        category: "command",
        action: () => {
          setIsOpen(false)
        },
      },
      ...conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        subtitle: conv.lastMessage,
        icon: "💭",
        category: "conversation" as const,
        action: () => {
          setIsOpen(false)
        },
      })),
    ],
    [conversations],
  )

  const filteredCommands = useMemo(() => {
    if (!query) return commands
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.subtitle?.toLowerCase().includes(query.toLowerCase()),
    )
  }, [commands, query])

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    commands: filteredCommands,
  }
}
