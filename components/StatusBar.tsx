"use client"

import { motion } from "framer-motion"
import { Wifi, WifiOff, Zap, Clock, Cpu } from "lucide-react"

interface StatusBarProps {
  isConnected: boolean
  tokenUsage: number
  maxTokens: number
  responseTime: number
  modelPerformance: "fast" | "normal" | "slow"
}

export function StatusBar({ isConnected, tokenUsage, maxTokens, responseTime, modelPerformance }: StatusBarProps) {
  const getPerformanceColor = () => {
    switch (modelPerformance) {
      case "fast":
        return "text-green-500"
      case "normal":
        return "text-yellow-500"
      case "slow":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getPerformanceIcon = () => {
    switch (modelPerformance) {
      case "fast":
        return <Zap className="w-3 h-3" />
      case "normal":
        return <Cpu className="w-3 h-3" />
      case "slow":
        return <Clock className="w-3 h-3" />
      default:
        return <Cpu className="w-3 h-3" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs"
    >
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Token Usage */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Tokens:</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(tokenUsage / maxTokens) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              {tokenUsage.toLocaleString()}/{maxTokens.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Response Time */}
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">{responseTime}ms</span>
        </div>

        {/* Model Performance */}
        <div className={`flex items-center space-x-1 ${getPerformanceColor()}`}>
          {getPerformanceIcon()}
          <span className="capitalize">{modelPerformance}</span>
        </div>
      </div>
    </motion.div>
  )
}
