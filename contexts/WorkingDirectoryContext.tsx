import React, { createContext, useContext, useState, useEffect } from 'react'

interface WorkingDirectoryContextType {
  currentDir: string
  setCurrentDir: (dir: string) => void
}

const WorkingDirectoryContext = createContext<WorkingDirectoryContextType>({
  currentDir: '~',
  setCurrentDir: () => {},
})

export const useWorkingDirectory = () => {
  const context = useContext(WorkingDirectoryContext)
  if (!context) {
    throw new Error('useWorkingDirectory must be used within a WorkingDirectoryProvider')
  }
  return context
}

export const WorkingDirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDir, setCurrentDir] = useState('.')

  useEffect(() => {
    // Set initial directory to user home for display purposes
    setCurrentDir('~')
  }, [])

  return (
    <WorkingDirectoryContext.Provider value={{ currentDir, setCurrentDir }}>
      {children}
    </WorkingDirectoryContext.Provider>
  )
}
