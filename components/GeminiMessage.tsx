"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Play, Square, Check } from "lucide-react"
import { GeminiLogo } from "./GeminiLogo"
import { GeminiButton } from "./GeminiButton"
import type { GeminiMessage as GeminiMessageType, GeminiCodeBlock } from "../types/gemini"

interface GeminiMessageProps {
  message: GeminiMessageType
  onRunCode?: (codeBlock: GeminiCodeBlock) => void
}

export function GeminiMessage({ message, onRunCode }: GeminiMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedContent(message.content)
      return
    }

    const interval = setInterval(() => {
      if (currentIndex < message.content.length) {
        setDisplayedContent(message.content.slice(0, currentIndex + 1))
        setCurrentIndex((prev) => prev + 1)
      } else {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [message.content, message.isStreaming, currentIndex])

  const copyToClipboard = async (text: string, blockId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedBlocks((prev) => new Set(prev).add(blockId))
    setTimeout(() => {
      setCopiedBlocks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
    }, 2000)
  }

  const renderCodeBlock = (codeBlock: GeminiCodeBlock) => (
    <motion.div
      key={codeBlock.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6] capitalize">{codeBlock.language}</span>
        <div className="flex items-center space-x-2">
          <GeminiButton
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(codeBlock.code, codeBlock.id)}
            className="h-8 w-8 p-0"
          >
            {copiedBlocks.has(codeBlock.id) ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </GeminiButton>
          {onRunCode && (
            <GeminiButton
              size="sm"
              variant="ghost"
              onClick={() => onRunCode(codeBlock)}
              disabled={codeBlock.isExecuting}
              className="h-8 w-8 p-0"
            >
              {codeBlock.isExecuting ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </GeminiButton>
          )}
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto text-sm font-mono">
        <code>{codeBlock.code}</code>
      </pre>

      {/* Code Output */}
      {codeBlock.output && (
        <div className="border-t border-gray-700">
          <div className="px-4 py-2 bg-gray-800 text-xs text-gray-400">Output:</div>
          <pre className="p-4 bg-gray-900 text-green-400 text-sm font-mono overflow-x-auto">{codeBlock.output}</pre>
        </div>
      )}
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
        {/* AI Avatar and Label */}
        {message.role === "assistant" && (
          <div className="flex items-center mb-3">
            <GeminiLogo size="sm" />
            <span className="ml-2 text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6]">Gemini</span>
          </div>
        )}

        {/* Message Bubble */}
        <motion.div
          className={`rounded-2xl px-6 py-4 ${
            message.role === "user"
              ? "bg-gradient-to-r from-[#4285f4] via-[#9c27b0] to-[#ea4335] text-white shadow-lg"
              : "bg-white dark:bg-[#2d2d2d] shadow-sm border border-gray-200 dark:border-gray-700"
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {message.files.map((file) => (
                <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail || "/placeholder.svg"}
                      alt={file.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">{file.name.split(".").pop()?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap m-0">
              {displayedContent}
              {message.isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-2 h-4 bg-current ml-1"
                />
              )}
            </p>
          </div>

          {/* Code Blocks */}
          {message.codeBlocks?.map(renderCodeBlock)}
        </motion.div>

        {/* Message Metadata */}
        <div
          className={`flex items-center mt-2 text-xs text-[#5f6368] dark:text-[#9aa0a6] ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {message.tokens && <span className="ml-2">• {message.tokens} tokens</span>}
        </div>
      </div>
    </motion.div>
  )
}
