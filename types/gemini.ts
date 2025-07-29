export interface GeminiMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: GeminiFile[]
  isStreaming?: boolean
  codeBlocks?: GeminiCodeBlock[]
  tokens?: number
}

export interface GeminiFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadProgress?: number
  thumbnail?: string
  copyStatus?: 'pending' | 'success' | 'error'
  copyError?: string
}

export interface GeminiCodeBlock {
  id: string
  language: string
  code: string
  output?: string
  isExecuting?: boolean
}

export interface GeminiConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: GeminiMessage[]
  isPinned: boolean
  model: GeminiModel
  tokenUsage: number
}

export interface GeminiModel {
  id: string
  name: string
  description: string
  capabilities: string[]
}

export interface GeminiCommand {
  command: string
  output: string
  timestamp: Date
  status: "success" | "error" | "running"
}

export type GeminiTheme = "light" | "dark" | "auto"
