"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, ImageIcon, FileText, Code, Copy, FolderPlus } from "lucide-react"
import { GeminiButton } from "./GeminiButton"
import { useElectron } from "../hooks/useElectron"
import { useWorkingDirectory } from "../contexts/WorkingDirectoryContext"
import type { GeminiFile } from "../types/gemini"

interface GeminiFileUploadProps {
  files: GeminiFile[]
  onFilesChange: (files: GeminiFile[]) => void
  onFileProcessed?: (fileName: string, content: string) => void
  maxFiles?: number
  maxSize?: number
}

export function GeminiFileUpload({
  files,
  onFilesChange,
  onFileProcessed,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
}: GeminiFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [localFiles, setLocalFiles] = useState<GeminiFile[]>([])
  const { isElectron, copyFile, writeFile, readFile } = useElectron()
  const { currentDir } = useWorkingDirectory()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize local files only once from props
  useEffect(() => {
    if (files.length > 0 && localFiles.length === 0) {
      setLocalFiles(files)
    }
  }, [files, localFiles.length])

  const copyFileToWorkingDirectory = useCallback(async (file: File) => {
    if (!isElectron) {
      console.warn('File copying is only available in Electron')
      return { success: false, error: 'File copying is only available in Electron' }
    }

    try {
      // Check if the file has a path property (from file explorer drag & drop)
      const tempPath = (file as any).path;
      
      if (tempPath) {
        // Use direct file copy for files with path
        console.log(`Copying file from path: ${tempPath}`);
        const result = await copyFile(tempPath, currentDir, file.name);
        return result;
      } else {
        // Use writeFile for files without path (from file dialog or browser drag)
        console.log(`Writing file content: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        const result = await writeFile(arrayBuffer, currentDir, file.name);
        return result;
      }
    } catch (error) {
      console.error('Error copying file:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [isElectron, copyFile, writeFile, currentDir])

  const isTextFile = (fileName: string) => {
    const textExtensions = ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.json', '.xml', '.yaml', '.yml', '.sh', '.bat', '.sql', '.csv']
    return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      
      // Update files using the current state
      setLocalFiles(currentFiles => {
        const newFiles: GeminiFile[] = droppedFiles
          .filter((file) => file.size <= maxSize)
          .slice(0, maxFiles - currentFiles.length)
          .map((file) => ({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadProgress: 0,
            thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
            copyStatus: 'pending',
          }))

        // Start copying files to working directory for each new file
        newFiles.forEach(async (geminiFile) => {
          const originalFile = droppedFiles.find(f => f.name === geminiFile.name)
          if (originalFile) {
            // Simulate upload progress while copying
            let progress = 0
            const progressInterval = setInterval(() => {
              progress += Math.random() * 25 + 5
              if (progress >= 100) {
                progress = 100
                clearInterval(progressInterval)
              }
              // Update progress using setLocalFiles
              setLocalFiles(prevFiles => 
                prevFiles.map((f) => 
                  f.id === geminiFile.id ? { ...f, uploadProgress: progress } : f
                )
              )
            }, 200)

            // Try to copy the file
            try {
              const copyResult = await copyFileToWorkingDirectory(originalFile)
              
              // Update file status
              setLocalFiles(prevFiles =>
                prevFiles.map((f) => 
                  f.id === geminiFile.id 
                    ? { 
                        ...f, 
                        uploadProgress: 100,
                        copyStatus: copyResult.success ? 'success' : 'error',
                        copyError: copyResult.error
                      } 
                    : f
                )
              )
            } catch (error) {
              setLocalFiles(prevFiles =>
                prevFiles.map((f) => 
                  f.id === geminiFile.id 
                    ? { 
                        ...f, 
                        uploadProgress: 100,
                        copyStatus: 'error',
                        copyError: error instanceof Error ? error.message : 'Copy failed'
                      } 
                    : f
                )
              )
            }
          }
        })

        return [...currentFiles, ...newFiles]
      })
    },
    [maxFiles, maxSize, copyFileToWorkingDirectory],
  )

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const filesArray = Array.from(selectedFiles);
    
    // Update files using the current state
    setLocalFiles(currentFiles => {
      const newFiles: GeminiFile[] = filesArray
        .filter((file) => file.size <= maxSize)
        .slice(0, maxFiles - currentFiles.length)
        .map((file) => ({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadProgress: 0,
          thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          copyStatus: 'pending',
        }))

      // Start copying files to working directory for each new file
      newFiles.forEach(async (geminiFile) => {
        const originalFile = filesArray.find(f => f.name === geminiFile.name)
        if (originalFile) {
          // Simulate upload progress while copying
          let progress = 0
          const progressInterval = setInterval(() => {
            progress += Math.random() * 25 + 5
            if (progress >= 100) {
              progress = 100
              clearInterval(progressInterval)
            }
            // Update progress using setLocalFiles
            setLocalFiles(prevFiles => 
              prevFiles.map((f) => 
                f.id === geminiFile.id ? { ...f, uploadProgress: progress } : f
              )
            )
          }, 200)

          // Try to copy the file
          try {
            const copyResult = await copyFileToWorkingDirectory(originalFile)
            
            // Update file status
            setLocalFiles(prevFiles =>
              prevFiles.map((f) => 
                f.id === geminiFile.id 
                  ? { 
                      ...f, 
                      uploadProgress: 100,
                      copyStatus: copyResult.success ? 'success' : 'error',
                      copyError: copyResult.error
                    } 
                  : f
              )
            )
          } catch (error) {
            setLocalFiles(prevFiles =>
              prevFiles.map((f) => 
                f.id === geminiFile.id 
                  ? { 
                      ...f, 
                      uploadProgress: 100,
                      copyStatus: 'error',
                      copyError: error instanceof Error ? error.message : 'Copy failed'
                    } 
                  : f
              )
            )
          }
        }
      })

      return [...currentFiles, ...newFiles]
    })
  }, [maxFiles, maxSize, copyFileToWorkingDirectory])

  const handleChooseFiles = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileId: string) => {
    setLocalFiles(localFiles.filter((f) => f.id !== fileId))
  }

  const handleClearAll = () => {
    setLocalFiles([])
  }

  const handleUploadFiles = async () => {
    // Process all files that have been successfully copied
    const copiedFiles = localFiles.filter(f => f.copyStatus === 'success')
    
    for (const file of copiedFiles) {
      if (onFileProcessed && readFile) {
        try {
          // Read the file content from the working directory
          const result = await readFile(file.name)
          if (result.success && result.content) {
            onFileProcessed(file.name, result.content)
          } else {
            console.error(`Failed to read file ${file.name}:`, result.error)
            // Still call onFileProcessed with empty content to trigger analysis
            onFileProcessed(file.name, '')
          }
        } catch (error) {
          console.error(`Failed to read file ${file.name}:`, error)
          // Still call onFileProcessed with empty content to trigger analysis
          onFileProcessed(file.name, '')
        }
      }
    }
    
    // Clear all files after processing
    setLocalFiles([])
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
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

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

          <GeminiButton variant="secondary" onClick={handleChooseFiles}>
            Choose Files
          </GeminiButton>
        </div>
      </motion.div>

      {/* File Grid */}
      <AnimatePresence>
        {localFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {localFiles.map((file, index) => (
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
                      <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Processing...</span>
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

                {/* Copy Status */}
                {file.copyStatus && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {file.copyStatus === 'success' && (
                          <>
                            <FolderPlus className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">Copied to working directory</span>
                          </>
                        )}
                        {file.copyStatus === 'error' && (
                          <>
                            <X className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600 dark:text-red-400">Copy failed</span>
                          </>
                        )}
                        {file.copyStatus === 'pending' && (
                          <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Copying...</span>
                        )}
                      </div>
                    </div>
                    {file.copyError && (
                      <p className="text-xs text-red-600 dark:text-red-400">{file.copyError}</p>
                    )}
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

      {/* Action Buttons */}
      {localFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <GeminiButton 
            onClick={handleClearAll}
            variant="secondary" 
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </GeminiButton>
          <GeminiButton 
            onClick={handleUploadFiles}
            disabled={localFiles.length === 0 || localFiles.some(f => f.copyStatus === 'pending')}
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Process Files ({localFiles.filter(f => f.copyStatus === 'success').length})
          </GeminiButton>
        </motion.div>
      )}
    </div>
  )
}
