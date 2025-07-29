export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: FileAttachment[]
  isStreaming?: boolean
  codeBlocks?: CodeBlock[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadProgress?: number
}

export interface CodeBlock {
  id: string
  language: string
  code: string
  output?: string
  isRunning?: boolean
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
  tokenUsage: number
}

export interface AppState {
  conversations: Conversation[]
  activeConversationId: string | null
  theme: "light" | "dark" | "high-contrast"
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  rightPanelTab: "files" | "settings"
}

export interface CommandPaletteItem {
  id: string
  title: string
  subtitle?: string
  icon?: string
  action: () => void
  category: "conversation" | "command" | "file"
}
