"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Settings,
  Download,
  Minimize2,
  Maximize2,
  X,
  Pin,
  PinOff,
  Folder,
  Terminal,
  Sun,
  Moon,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  Trash2,
} from "lucide-react"
import { GeminiLogo } from "../components/GeminiLogo"
import { GeminiButton } from "../components/GeminiButton"
import { GeminiInput } from "../components/GeminiInput"
import { GeminiMessage } from "../components/GeminiMessage"
import { GeminiFileUpload } from "../components/GeminiFileUpload"
import { GeminiCLIPanel } from "../components/GeminiCLIPanel"
import { useGeminiTheme } from "../hooks/useGeminiTheme"
import { useElectron } from "../hooks/useElectron"
import { WorkingDirectoryProvider, useWorkingDirectory } from "../contexts/WorkingDirectoryContext"
import { usePersistentConversations } from "../lib/storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type {
  GeminiConversation,
  GeminiMessage as GeminiMessageType,
  GeminiFile,
  GeminiModel,
  GeminiCodeBlock,
} from "../types/gemini"

const GEMINI_MODELS: GeminiModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Fast and efficient model (recommended for daily use)",
    capabilities: ["Text", "Code", "Fast Response", "Higher Quota"],
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Latest and most advanced model (limited daily quota)",
    capabilities: ["Text", "Code", "Math", "Advanced Reasoning"],
  },
]

export default function GeminiDesktopApp() {
  return (
    <WorkingDirectoryProvider>
      <GeminiDesktopAppContent />
    </WorkingDirectoryProvider>
  )
}

function GeminiDesktopAppContent() {
  const { theme, setTheme, resolvedTheme } = useGeminiTheme()
  const { isElectron, minimizeWindow, maximizeWindow, closeWindow, executeCommand } = useElectron()
  const { currentDir } = useWorkingDirectory()
  const { saveConversations, saveAppState, loadConversations, loadAppState } = usePersistentConversations()

  const [conversations, setConversations] = useState<GeminiConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState("")
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0]) // This will now be gemini-2.5-flash
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<"files" | "settings">("files")
  const [cliPanelOpen, setCLIPanelOpen] = useState(false)
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<GeminiFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isConnected, setIsConnected] = useState(true)
  const [apiStatus, setApiStatus] = useState<"connected" | "connecting" | "error">("connected")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  // Load persisted data on component mount
  useEffect(() => {
    const loadedConversations = loadConversations()
    const loadedAppState = loadAppState()

    if (loadedConversations.length > 0) {
      setConversations(loadedConversations)
      
      // Set active conversation from saved state or first conversation
      if (loadedAppState.activeConversationId && loadedConversations.find(c => c.id === loadedAppState.activeConversationId)) {
        setActiveConversationId(loadedAppState.activeConversationId)
      } else {
        setActiveConversationId(loadedConversations[0].id)
      }
    } else {
      // Create default conversation if none exist
      const defaultConversation: GeminiConversation = {
        id: "1",
        title: "Getting Started with Gemini",
        lastMessage: "Hello! I'm Gemini, your AI assistant. How can I help you today?",
        timestamp: new Date(),
        isPinned: false,
        model: GEMINI_MODELS[0],
        tokenUsage: 1250,
        messages: [
          {
            id: "1",
            content:
              "Hello! I'm Gemini, your AI assistant. I can help you with coding, analysis, creative writing, math problems, and much more. What would you like to explore today?",
            role: "assistant",
            timestamp: new Date(),
            tokens: 45,
          },
        ],
      }
      setConversations([defaultConversation])
      setActiveConversationId("1")
      saveConversations([defaultConversation])
      saveAppState({ activeConversationId: "1", selectedModelId: GEMINI_MODELS[0].id })
    }

    // Load selected model from saved state
    if (loadedAppState.selectedModelId) {
      const savedModel = GEMINI_MODELS.find(m => m.id === loadedAppState.selectedModelId)
      if (savedModel) {
        setSelectedModel(savedModel)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeConversation?.messages])

  const createNewConversation = () => {
    const newConversation: GeminiConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      isPinned: false,
      model: selectedModel,
      tokenUsage: 0,
      messages: [],
    }
    
    const updatedConversations = [newConversation, ...conversations]
    setConversations(updatedConversations)
    setActiveConversationId(newConversation.id)
    
    // Save to localStorage
    saveConversations(updatedConversations)
    saveAppState({ activeConversationId: newConversation.id })
  }

  const switchModel = async (model: GeminiModel) => {
    setSelectedModel(model);
    
    // Optionally show a toast or notification
    console.log(`Switched to model: ${model.name} (${model.id})`);
    
    // Update the current conversation's model
    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConversationId
        ? { ...conv, model }
        : conv,
    )
    setConversations(updatedConversations)
    
    // Save changes
    saveConversations(updatedConversations)
    saveAppState({ selectedModelId: model.id })
  }

  // Helper function to update and save conversations
  const updateConversations = (updater: (prev: GeminiConversation[]) => GeminiConversation[]) => {
    setConversations((prev) => {
      const updatedConversations = updater(prev)
      saveConversations(updatedConversations)
      return updatedConversations
    })
  }

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return

    const userMessage: GeminiMessageType = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
      files: files.length > 0 ? [...files] : undefined,
      tokens: Math.ceil(input.length / 4),
    }

    const userInput = input;

    // Actualizar conversación con mensaje del usuario
    updateConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              lastMessage: input || "Sent files",
              timestamp: new Date(),
              title: conv.messages.length === 0 ? input.slice(0, 40) + "..." : conv.title,
              tokenUsage: conv.tokenUsage + (userMessage.tokens || 0),
              model: selectedModel, // Update conversation model
            }
          : conv,
      ),
    )

    setInput("")
    setFiles([])
    setIsLoading(true)
    setApiStatus("connecting")

    try {
      // Switch model first, then send the prompt
      const command = `gemini -m "${selectedModel.id}" -p "${userInput}" --yolo`;
      
      // Llamar al endpoint de Gemini CLI
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          cwd: currentDir, // Use the shared working directory
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini')
      }

      // Check for API errors in the response
      if (data.stderr) {
        const errorOutput = data.stderr.toLowerCase();
        
        // Check for quota exceeded errors
        if (errorOutput.includes('quota exceeded') || errorOutput.includes('429')) {
          throw new Error('Daily quota limit reached for this model. Try switching to a different model or wait until tomorrow for quota reset. You can also upgrade your Gemini plan for higher limits.');
        }
        
        // Check for model not found errors
        if (errorOutput.includes('404') || errorOutput.includes('not found')) {
          throw new Error(`Model "${selectedModel.id}" not found. Try selecting a different model from the dropdown.`);
        }
        
        // Check for authentication errors
        if (errorOutput.includes('401') || errorOutput.includes('unauthorized')) {
          throw new Error('Authentication failed. Please check your Gemini CLI authentication with "gemini auth" command.');
        }
        
        // Generic error from stderr
        throw new Error(`Gemini CLI Error: ${data.stderr}`);
      }

      // Procesar la respuesta de Gemini
      let geminiResponse = data.stdout || data.stderr || 'No response received'
      
      // Limpiar la respuesta si contiene caracteres de control o formato extra
      geminiResponse = geminiResponse.trim()

      // Check if response is empty or contains only error markers
      if (!geminiResponse || geminiResponse.length < 3) {
        throw new Error('Received empty response from Gemini. This might indicate a quota limit or service issue.');
      }

      // Estimar tokens de la respuesta
      const responseTokens = Math.ceil(geminiResponse.length / 4)

      // Detectar bloques de código en la respuesta
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      const codeBlocks: GeminiCodeBlock[] = []
      let match
      let blockIndex = 0

      while ((match = codeBlockRegex.exec(geminiResponse)) !== null) {
        codeBlocks.push({
          id: `code-${Date.now()}-${blockIndex}`,
          language: match[1] || 'text',
          code: match[2].trim(),
        })
        blockIndex++
      }

      const aiMessage: GeminiMessageType = {
        id: (Date.now() + 1).toString(),
        content: geminiResponse,
        role: "assistant",
        timestamp: new Date(),
        tokens: responseTokens,
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      }

      // Actualizar conversación con respuesta de Gemini
      updateConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                lastMessage: geminiResponse.length > 50 
                  ? geminiResponse.substring(0, 50) + "..." 
                  : geminiResponse,
                tokenUsage: conv.tokenUsage + responseTokens,
              }
            : conv,
        ),
      )

      setApiStatus("connected")
    } catch (error) {
      console.error('Error calling Gemini:', error)
      
      // Crear mensaje de error
      const errorMessage: GeminiMessageType = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: "assistant",
        timestamp: new Date(),
        tokens: 20,
      }

      updateConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                lastMessage: "Error occurred",
                tokenUsage: conv.tokenUsage + 20,
              }
            : conv,
        ),
      )

      setApiStatus("error")
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const runCode = (codeBlock: GeminiCodeBlock) => {
    updateConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.codeBlocks
                  ? {
                      ...msg,
                      codeBlocks: msg.codeBlocks.map((cb) =>
                        cb.id === codeBlock.id ? { ...cb, isExecuting: true } : cb,
                      ),
                    }
                  : msg,
              ),
            }
          : conv,
      ),
    )

    // Ejecutar el código usando el endpoint
    fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: codeBlock.language === 'python' 
          ? `python -c "${codeBlock.code.replace(/"/g, '\\"')}"` 
          : codeBlock.language === 'javascript' || codeBlock.language === 'js'
          ? `node -e "${codeBlock.code.replace(/"/g, '\\"')}"` 
          : codeBlock.code,
      }),
    })
    .then(response => response.json())
    .then(data => {
      const output = data.stdout || data.stderr || data.error || 'Code executed'

      updateConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.codeBlocks
                    ? {
                        ...msg,
                        codeBlocks: msg.codeBlocks.map((cb) =>
                          cb.id === codeBlock.id ? { ...cb, isExecuting: false, output } : cb,
                        ),
                      }
                    : msg,
                ),
              }
            : conv,
        ),
      )
    })
    .catch(error => {
      updateConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.codeBlocks
                    ? {
                        ...msg,
                        codeBlocks: msg.codeBlocks.map((cb) =>
                          cb.id === codeBlock.id 
                            ? { ...cb, isExecuting: false, output: `Error: ${error.message}` } 
                            : cb,
                        ),
                      }
                    : msg,
                ),
              }
            : conv,
        ),
      )
    })
  }

  const togglePin = (conversationId: string) => {
    updateConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv)),
    )
  }

  const deleteConversation = (conversationId: string) => {
    // Don't delete if it's the only conversation
    if (conversations.length <= 1) {
      console.log("Cannot delete the only conversation")
      return
    }

    // If we're deleting the active conversation, switch to another one first
    if (conversationId === activeConversationId) {
      const remainingConversations = conversations.filter(conv => conv.id !== conversationId)
      const newActiveId = remainingConversations[0]?.id
      if (newActiveId) {
        setActiveConversationId(newActiveId)
        saveAppState({ activeConversationId: newActiveId })
      }
    }

    // Remove the conversation from the list
    updateConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
  }

  const exportConversation = (format: "markdown" | "pdf" | "json") => {
    if (!activeConversation) return

    const data = {
      title: activeConversation.title,
      model: activeConversation.model.name,
      messages: activeConversation.messages,
      timestamp: new Date().toISOString(),
      tokenUsage: activeConversation.tokenUsage,
      format,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeConversation.title}.${format === "json" ? "json" : format}`
    a.click()
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const groupedConversations = {
    pinned: filteredConversations.filter((c) => c.isPinned),
    today: filteredConversations.filter(
      (c) => !c.isPinned && new Date(c.timestamp).toDateString() === new Date().toDateString(),
    ),
    yesterday: filteredConversations.filter((c) => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return !c.isPinned && new Date(c.timestamp).toDateString() === yesterday.toDateString()
    }),
    older: filteredConversations.filter((c) => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      return !c.isPinned && new Date(c.timestamp) < twoDaysAgo
    }),
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      case "auto":
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-[#1a1a1a] font-['Inter'] text-[#202124] dark:text-[#e8eaed]">
      {/* Header Bar */}
      <div className="h-16 bg-white/80 dark:bg-[#2d2d2d]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-6 z-10">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <GeminiLogo size="md" animated />
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-[#4285f4] via-[#9c27b0] to-[#ea4335] bg-clip-text text-transparent">
                Gemini
              </h1>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">AI Assistant</p>
            </div>
          </div>

          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GeminiButton variant="secondary" className="flex items-center space-x-2">
                <span>{selectedModel.name}</span>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      apiStatus === "connected"
                        ? "bg-green-500"
                        : apiStatus === "connecting"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                    {selectedModel.id}
                  </span>
                </div>
              </GeminiButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  💡 If you get quota errors, try switching to a Flash model or wait for daily quota reset.
                </p>
              </div>
              {GEMINI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => switchModel(model)}
                  className="flex flex-col items-start space-y-1 p-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{model.name}</span>
                    <div className="flex items-center space-x-2">
                      {selectedModel.id === model.id && <Zap className="w-4 h-4 text-[#4285f4]" />}
                      {model.id.includes('2.5-pro') && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Limited Quota
                        </span>
                      )}
                      {model.id.includes('flash') && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Higher Quota
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{model.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <GeminiButton
            variant="ghost"
            size="sm"
            onClick={() => setCLIPanelOpen(!cliPanelOpen)}
            className={cliPanelOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
          >
            <Terminal className="w-4 h-4" />
          </GeminiButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GeminiButton variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </GeminiButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportConversation("markdown")}>Export as Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportConversation("pdf")}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportConversation("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <GeminiButton
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={rightPanelOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
          >
            <Folder className="w-4 h-4" />
          </GeminiButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GeminiButton variant="ghost" size="sm">
                {getThemeIcon()}
              </GeminiButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("auto")}>
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <GeminiButton variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </GeminiButton>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          <GeminiButton variant="ghost" size="sm" onClick={minimizeWindow}>
            <Minimize2 className="w-4 h-4" />
          </GeminiButton>
          <GeminiButton variant="ghost" size="sm" onClick={maximizeWindow}>
            <Maximize2 className="w-4 h-4" />
          </GeminiButton>
          <GeminiButton variant="ghost" size="sm" className="text-[#ea4335] hover:text-[#ea4335]" onClick={closeWindow}>
            <X className="w-4 h-4" />
          </GeminiButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 60 : 340 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white/80 dark:bg-[#2d2d2d]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="font-semibold text-lg"
                  >
                    Conversations
                  </motion.h2>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-2">
                <GeminiButton 
                  size="sm" 
                  gradient 
                  onClick={createNewConversation} 
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                </GeminiButton>
                <GeminiButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <Search className="w-4 h-4" />
                  </motion.div>
                </GeminiButton>
              </div>
            </div>

            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5f6368] dark:text-[#9aa0a6]" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#4285f4] rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-2">
                  {Object.entries(groupedConversations).map(([group, convs]) => {
                    if (convs.length === 0) return null

                    return (
                      <div key={group} className="mb-6">
                        <h3 className="px-3 py-2 text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">
                          {group === "pinned"
                            ? "Pinned"
                            : group === "today"
                              ? "Today"
                              : group === "yesterday"
                                ? "Yesterday"
                                : "Older"}
                        </h3>

                        {convs.map((conversation, index) => (
                          <motion.div
                            key={conversation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                              activeConversationId === conversation.id
                                ? "bg-gradient-to-r from-[#4285f4]/10 via-[#9c27b0]/10 to-[#ea4335]/10 border border-[#4285f4]/20"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => {
                              setActiveConversationId(conversation.id)
                              saveAppState({ activeConversationId: conversation.id })
                            }}
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <GeminiLogo size="sm" />
                                {conversation.isPinned && (
                                  <Pin className="absolute -top-1 -right-1 w-3 h-3 text-[#4285f4]" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-sm truncate pr-2">{conversation.title}</h3>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                                    <GeminiButton
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        togglePin(conversation.id)
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                      title={conversation.isPinned ? "Unpin conversation" : "Pin conversation"}
                                    >
                                      {conversation.isPinned ? (
                                        <PinOff className="w-3 h-3" />
                                      ) : (
                                        <Pin className="w-3 h-3" />
                                      )}
                                    </GeminiButton>
                                    
                                    <GeminiButton
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteConversation(conversation.id)
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                                      title="Delete conversation"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </GeminiButton>
                                  </div>
                                </div>

                                <p className="text-[#5f6368] dark:text-[#9aa0a6] text-xs truncate mt-1">
                                  {conversation.lastMessage}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[#5f6368] dark:text-[#9aa0a6] text-xs">
                                    {conversation.timestamp.toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                      {conversation.tokenUsage}
                                    </span>
                                    <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                                      {conversation.model.name.split(" ")[1]}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#fafafa]/50 to-white dark:from-[#1a1a1a]/50 dark:to-[#1a1a1a]">
            <div className="max-w-[780px] mx-auto p-6 space-y-6">
              {activeConversation?.messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <GeminiLogo size="lg" animated />
                  <h2 className="text-2xl font-semibold mt-6 mb-4 bg-gradient-to-r from-[#4285f4] via-[#9c27b0] to-[#ea4335] bg-clip-text text-transparent">
                    Hello! I'm Gemini
                  </h2>
                  <p className="text-[#5f6368] dark:text-[#9aa0a6] mb-8">
                    I'm here to help you with coding, analysis, creative writing, and much more.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {[
                      "Explain quantum computing concepts",
                      "Write a Python web scraper",
                      "Analyze this data visualization",
                      "Help debug my JavaScript code",
                    ].map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 text-left bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#4285f4] transition-colors"
                        onClick={() => setInput(suggestion)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                      >
                        <p className="text-sm font-medium">{suggestion}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                activeConversation?.messages.map((message, index) => (
                  <GeminiMessage key={message.id} message={message} onRunCode={runCode} />
                ))
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-4"
                >
                  <GeminiLogo size="sm" animated />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#4285f4] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#9c27b0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-[#ea4335] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                    Gemini is thinking...
                  </span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/80 dark:bg-[#2d2d2d]/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-[780px] mx-auto space-y-4">
              {files.length > 0 && <GeminiFileUpload files={files} onFilesChange={setFiles} />}

              <GeminiInput
                value={input}
                onChange={setInput}
                onSubmit={sendMessage}
                onFileUpload={() => setRightPanelOpen(true)}
                disabled={isLoading}
                suggestions={[
                  "Explain how neural networks work",
                  "Write a React component for a todo list",
                  "Analyze this code for performance issues",
                  "Help me understand blockchain technology",
                ]}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="h-8 bg-gray-50 dark:bg-[#2d2d2d] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                <span>
                  {apiStatus === "connected" ? "Connected to Gemini CLI" : 
                   apiStatus === "connecting" ? "Connecting..." : "Connection Error"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span>Tokens:</span>
                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#4285f4] to-[#9c27b0]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeConversation?.tokenUsage || 0) / 32000) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span>{activeConversation?.tokenUsage || 0}/32,000</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span>Model: Gemini CLI</span>
              <div className="flex items-center space-x-1">
                <Zap className={`w-3 h-3 ${isLoading ? 'text-yellow-500' : 'text-green-500'}`} />
                <span>{isLoading ? 'Processing...' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/80 dark:bg-[#2d2d2d]/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{rightPanelTab === "files" ? "Files" : "Settings"}</h3>
                    <GeminiButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightPanelOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </GeminiButton>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {rightPanelTab === "files" ? (
                    <GeminiFileUpload files={files} onFilesChange={setFiles} />
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Theme</h4>
                        <div className="space-y-2">
                          {[
                            { value: "light", label: "Light", icon: Sun },
                            { value: "dark", label: "Dark", icon: Moon },
                            { value: "auto", label: "Auto", icon: Monitor },
                          ].map(({ value, label, icon: Icon }) => (
                            <GeminiButton
                              key={value}
                              variant={theme === value ? "primary" : "secondary"}
                              onClick={() => setTheme(value as any)}
                              className="w-full justify-start"
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {label}
                            </GeminiButton>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">CLI Settings</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mb-1 block">
                              Connection Status
                            </label>
                            <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${
                                apiStatus === "connected" ? "bg-green-500" : 
                                apiStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                              }`} />
                              <span className="text-sm">
                                {apiStatus === "connected" ? "Connected" : 
                                 apiStatus === "connecting" ? "Connecting..." : "Error"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mb-1 block">
                              Default Model
                            </label>
                            <select className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 text-sm">
                              {GEMINI_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>New conversation</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘N</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Search</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘K</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Settings</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘,</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Toggle CLI</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘`</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CLI Panel */}
      <GeminiCLIPanel isOpen={cliPanelOpen} onToggle={() => setCLIPanelOpen(!cliPanelOpen)} />
    </div>
  )
}