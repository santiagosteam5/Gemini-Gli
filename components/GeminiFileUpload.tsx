"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, ImageIcon, FileText, Code } from "lucide-react"
import { GeminiButton } from "./GeminiButton"
import type { GeminiFile } from "../types/gemini"

interface GeminiFileUploadProps {
  files: GeminiFile[]
  onFilesChange: (files: GeminiFile[]) => void
  maxFiles?: number
  maxSize?: number
}

export function GeminiFileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
}: GeminiFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      const newFiles: GeminiFile[] = droppedFiles
        .filter((file) => file.size <= maxSize)
        .slice(0, maxFiles - files.length)
        .map((file) => ({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadProgress: 0,
          thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        }))

      // Simulate upload progress
      newFiles.forEach((file) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 25 + 5
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
          }
          onFilesChange((prev) => prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress } : f)))
        }, 200)
      })

      onFilesChange([...files, ...newFiles])
    },
    [files, onFilesChange, maxFiles, maxSize],
  )

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-[#4285f4]" />
    if (type.includes("text") || type.includes("document")) return <FileText className="w-5 h-5 text-[#ea4335]" />
    if (type.includes("code") || type.includes("javascript") || type.includes("python"))
      return <Code className="w-5 h-5 text-[#9c27b0]" />
    return <File className="w-5 h-5 text-[#5f6368]" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragOver
            ? "border-[#4285f4] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
            : "border-gray-300 dark:border-gray-600 hover:border-[#4285f4]/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ y: isDragOver ? -10 : 0, scale: isDragOver ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#4285f4] to-[#9c27b0] rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] mb-2">
            {isDragOver ? "Drop files here" : "Upload files"}
          </h3>
          <p className="text-[#5f6368] dark:text-[#9aa0a6] mb-4">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mb-4">
            Supports images, documents, and code files up to {formatFileSize(maxSize)}
          </p>

          <GeminiButton variant="secondary">Choose Files</GeminiButton>
        </div>
      </motion.div>

      {/* File Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-[#2d2d2d] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* File Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] truncate">{file.name}</p>
                      <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <GeminiButton
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0 text-[#5f6368] hover:text-[#ea4335]"
                  >
                    <X className="w-4 h-4" />
                  </GeminiButton>
                </div>

                {/* Upload Progress */}
                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Uploading...</span>
                      <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                        {Math.round(file.uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-[#4285f4] to-[#9c27b0] h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* File Preview */}
                {file.thumbnail && (
                  <div className="mt-3">
                    <img
                      src={file.thumbnail || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
