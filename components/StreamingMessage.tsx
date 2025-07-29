"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message, CodeBlock } from "../types"

interface StreamingMessageProps {
  message: Message
  onRunCode?: (codeBlock: CodeBlock) => void
}

export function StreamingMessage({ message, onRunCode }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedContent(message.content)
      return
    }

    const words = message.content.split(" ")
    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedContent(words.slice(0, currentWordIndex + 1).join(" "))
        setCurrentWordIndex((prev) => prev + 1)
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [message.content, message.isStreaming, currentWordIndex])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderCodeBlock = (codeBlock: CodeBlock) => (
    <div key={codeBlock.id} className="my-4">
      <div className="bg-gray-900 rounded-t-lg">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <span className="text-sm text-gray-300">{codeBlock.language}</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-gray-300 hover:text-white"
              onClick={() => copyToClipboard(codeBlock.code)}
            >
              <Copy className="w-3 h-3" />
            </Button>
            {onRunCode && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-gray-300 hover:text-green-400"
                onClick={() => onRunCode(codeBlock)}
                disabled={codeBlock.isRunning}
              >
                {codeBlock.isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </div>
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
          <code>{codeBlock.code}</code>
        </pre>
      </div>

      {codeBlock.output && (
        <div className="bg-gray-800 rounded-b-lg border-t border-gray-700">
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">Output:</div>
          <pre className="p-4 text-sm text-green-400 overflow-x-auto">{codeBlock.output}</pre>
        </div>
      )}
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="whitespace-pre-wrap">
          {displayedContent}
          {message.isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block w-2 h-4 bg-blue-500 ml-1"
            />
          )}
        </p>
      </div>

      {message.codeBlocks?.map(renderCodeBlock)}
    </motion.div>
  )
}
