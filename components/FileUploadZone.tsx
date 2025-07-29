"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { FileAttachment } from "../types"

interface FileUploadZoneProps {
  files: FileAttachment[]
  onFilesChange: (files: FileAttachment[]) => void
  maxFiles?: number
}

export function FileUploadZone({ files, onFilesChange, maxFiles = 10 }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      const newFiles: FileAttachment[] = droppedFiles.map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadProgress: 0,
      }))

      // Simulate upload progress
      newFiles.forEach((file) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
          }
          onFilesChange((prev) => prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress } : f)))
        }, 200)
      })

      onFilesChange([...files, ...newFiles].slice(0, maxFiles))
    },
    [files, onFilesChange, maxFiles],
  )

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (type.includes("text") || type.includes("document")) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
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
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
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
          <motion.div animate={{ y: isDragOver ? -10 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">{isDragOver ? "Drop files here" : "Upload files"}</h3>
          <p className="text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
          <Button variant="outline">Choose Files</Button>
        </div>
      </motion.div>

      {/* File Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className="space-y-2">
                    <Progress value={file.uploadProgress} className="h-1" />
                    <p className="text-xs text-gray-500">{Math.round(file.uploadProgress)}% uploaded</p>
                  </div>
                )}

                {/* File Preview */}
                {file.type.startsWith("image/") && (
                  <div className="mt-3">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded"
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
