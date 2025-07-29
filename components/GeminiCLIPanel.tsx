"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Play, Square, Copy, Trash2, FolderOpen } from "lucide-react"
import { GeminiButton } from "./GeminiButton"
import { useWorkingDirectory } from "../contexts/WorkingDirectoryContext"
import type { GeminiCommand } from "../types/gemini"

interface GeminiCLIPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function GeminiCLIPanel({ isOpen, onToggle }: GeminiCLIPanelProps) {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<GeminiCommand[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  
  // Use shared working directory context
  const { currentDir, setCurrentDir } = useWorkingDirectory()

  const suggestions = [
    "gemini --help",
    "gemini -p \"Your prompt here\"",
    "gemini -m \"gemini-2.5-flash\" -p \"Your prompt here\"",
    "gemini -m \"gemini-2.5-pro\" -p \"Your prompt here\"",
    "gemini scan .",
    "gemini list",
    "gemini clean --delete",
    "gemini config",
    "gemini version",
    "gemini models",
    "gemini -p \"Explain this code\" < file.js",
    "gemini -p \"Debug this error: [paste error]\"",
    "gemini -p \"Write tests for this function\"",
    "gemini -p \"Optimize this code for performance\"",
    "gemini -p \"Convert this to TypeScript\"",
    "gemini -m \"gemini-2.5-flash\" -p \"Quick question about...\"",
    "gemini -m \"gemini-2.5-pro\" -p \"Complex analysis of...\"",
  ]

  // Helper function to set command and position cursor
  const setCommandWithCursor = (newCommand: string, cursorPosition?: number) => {
    setCommand(newCommand)
    setTimeout(() => {
      if (inputRef.current && cursorPosition !== undefined) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return

    const newCommand: GeminiCommand = {
      command: command.trim(),
      output: "",
      timestamp: new Date(),
      status: "running",
    }

    setHistory((prev) => [...prev, newCommand])
    setCommand("")
    setIsExecuting(true)

    try {
      let data;
      
      // Use IPC in Electron for better performance, fallback to API
      if (typeof window !== 'undefined' && window.electronAPI) {
        data = await window.electronAPI.executeCommand(newCommand.command, currentDir);
      } else {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: newCommand.command, cwd: currentDir }),
        })
        data = await res.json()
      }

      setHistory((prev) =>
        prev.map((cmd) =>
          cmd === newCommand
            ? {
                ...cmd,
                output:
                  (data.stdout || data.stderr || data.error || "Sin salida") +
                  (data.warning ? `\n\n⚠️  ${data.warning}` : '') +
                  `\n\n[Directorio de trabajo: ${data.cwd || currentDir}]`,
                status: data.error && !data.stdout ? "error" : "success",
              }
            : cmd
        )
      )
    } catch (err) {
      setHistory((prev) =>
        prev.map((cmd) =>
          cmd === newCommand
            ? { ...cmd, output: "Error ejecutando el comando", status: "error" }
            : cmd
        )
      )
    } finally {
      setIsExecuting(false)
    }
  }

  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const selectFolder = async () => {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.showFolderDialog({
          defaultPath: currentDir
        })
        
        if (!result.canceled && result.filePaths.length > 0) {
          setCurrentDir(result.filePaths[0])
        }
      } catch (error) {
        console.error('Error selecting folder:', error)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 400, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gray-900 border-t border-gray-700 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* CLI Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Gemini CLI</span>
                <div className={`w-2 h-2 rounded-full ${isExecuting ? "bg-yellow-400" : "bg-green-400"}`} />
              </div>

              <div className="flex items-center space-x-2">
                <GeminiButton
                  size="sm"
                  variant="ghost"
                  onClick={clearHistory}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </GeminiButton>
                <GeminiButton
                  size="sm"
                  variant="ghost"
                  onClick={onToggle}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Square className="w-3 h-3" />
                </GeminiButton>
              </div>
            </div>

            {/* Command Output */}
            <div ref={outputRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {history.length === 0 ? (
                <div className="text-gray-400">
                  <p>Gemini CLI v1.0.0</p>
                  <p>Type 'gemini --help' for available commands</p>
                  <br />
                  <p className="text-green-400">$</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((cmd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      {/* Command */}
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">$</span>
                        <span className="text-white">{cmd.command}</span>
                        <span className="text-xs text-gray-500">{cmd.timestamp.toLocaleTimeString()}</span>
                      </div>

                      {/* Output */}
                      {cmd.output && (
                        <div className="relative group">
                          <pre
                            className={`text-sm whitespace-pre-wrap pl-4 ${
                              cmd.status === "error" ? "text-red-400" : "text-gray-300"
                            }`}
                          >
                            {cmd.output}
                          </pre>
                          <GeminiButton
                            size="sm"
                            variant="ghost"
                            onClick={() => copyOutput(cmd.output)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </GeminiButton>
                        </div>
                      )}

                      {/* Loading */}
                      {cmd.status === "running" && (
                        <div className="flex items-center space-x-2 pl-4">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" />
                            <div
                              className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                          <span className="text-yellow-400 text-xs">Executing...</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Command Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              {/* Input de ruta */}
              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-400 mr-2">Ruta:</span>
                <input
                  type="text"
                  value={currentDir}
                  onChange={(e) => setCurrentDir(e.target.value)}
                  placeholder="/ruta/a/carpeta"
                  className="bg-transparent text-white font-mono text-xs flex-1 border border-gray-600 px-2 py-1 rounded mr-2"
                />
                <GeminiButton
                  size="sm"
                  variant="ghost"
                  onClick={selectFolder}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  title="Seleccionar carpeta"
                >
                  <FolderOpen className="w-3 h-3" />
                </GeminiButton>
              </div>

              {/* Input de comando */}
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      executeCommand()
                    }
                  }}
                  placeholder="Enter Gemini CLI command..."
                  disabled={isExecuting}
                  className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-gray-500"
                />
                <GeminiButton
                  size="sm"
                  onClick={executeCommand}
                  disabled={!command.trim() || isExecuting}
                  className="h-8 w-8 p-0"
                >
                  {isExecuting ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </GeminiButton>
              </div>

              {/* Command Suggestions */}
              {command.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
                  <div className="space-y-2">
                    {/* Quick commands */}
                    <div className="flex flex-wrap gap-1">
                      {suggestions
                        .filter((s) => s.toLowerCase().includes(command.toLowerCase()))
                        .slice(0, 4)
                        .map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                            onClick={() => setCommand(suggestion)}
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                    </div>
                    
                    {/* Show model-specific suggestions when typing 'gemini' */}
                    {command.toLowerCase().includes('gemini') && !command.includes('-m') && (
                      <div className="space-y-1">
                        <div className="text-xs text-blue-400">Quick model commands:</div>
                        <div className="flex flex-wrap gap-1">
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-2 py-1 text-xs bg-blue-700 text-blue-200 rounded hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              const cmd = 'gemini -m "gemini-2.5-flash" -p ""'
                              setCommandWithCursor(cmd, cmd.length - 1)
                            }}
                          >
                            Flash + prompt
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-2 py-1 text-xs bg-purple-700 text-purple-200 rounded hover:bg-purple-600 transition-colors"
                            onClick={() => {
                              const cmd = 'gemini -m "gemini-2.5-pro" -p ""'
                              setCommandWithCursor(cmd, cmd.length - 1)
                            }}
                          >
                            Pro + prompt
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-2 py-1 text-xs bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                            onClick={() => {
                              const cmd = 'gemini -p ""'
                              setCommandWithCursor(cmd, cmd.length - 1)
                            }}
                          >
                            Default + prompt
                          </motion.button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show prompt suggestions when typing -p */}
                    {command.includes('-p') && command.includes('""') && (
                      <div className="space-y-1">
                        <div className="text-xs text-green-400">Common prompts:</div>
                        <div className="flex flex-wrap gap-1">
                          {[
                            "Explain this code",
                            "Debug this error",
                            "Write tests for",
                            "Optimize performance",
                            "Add comments to",
                            "Convert to TypeScript"
                          ].map((prompt, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-2 py-1 text-xs bg-green-700 text-green-200 rounded hover:bg-green-600 transition-colors"
                              onClick={() => setCommand(command.replace('""', `"${prompt}:"`))}
                            >
                              {prompt}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show help when input is empty */}
              {!command && (
                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-2">Popular commands:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { cmd: "gemini --help", desc: "Show help", cursor: undefined },
                      { cmd: "gemini models", desc: "List models", cursor: undefined },
                      { cmd: "gemini -p \"\"", desc: "Send prompt", cursor: 12 },
                      { cmd: "gemini version", desc: "Show version", cursor: undefined }
                    ].map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-2 text-left bg-gray-700/50 rounded hover:bg-gray-600 transition-colors"
                        onClick={() => {
                          if (item.cursor !== undefined) {
                            setCommandWithCursor(item.cmd, item.cursor)
                          } else {
                            setCommand(item.cmd)
                          }
                        }}
                      >
                        <div className="text-xs text-white font-mono">{item.cmd}</div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
