import type { GeminiConversation } from '../types/gemini'

const STORAGE_KEY = 'gemini-chat-conversations'
const APP_STATE_KEY = 'gemini-chat-app-state'

export interface AppState {
  conversations: GeminiConversation[]
  activeConversationId: string
  selectedModelId: string
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export const storage = {
  // Save conversations to localStorage
  saveConversations: (conversations: GeminiConversation[]) => {
    if (!isBrowser) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
      console.log('Conversations saved to localStorage:', conversations.length, 'conversations')
    } catch (error) {
      console.error('Failed to save conversations:', error)
    }
  },

  // Load conversations from localStorage
  loadConversations: (): GeminiConversation[] => {
    if (!isBrowser) return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const conversations = JSON.parse(stored)
      
      // Convert timestamp strings back to Date objects
      return conversations.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Failed to load conversations:', error)
      return []
    }
  },

  // Save app state (active conversation, selected model, etc.)
  saveAppState: (appState: Partial<AppState>) => {
    if (!isBrowser) return
    
    try {
      const currentState = storage.loadAppState()
      const newState = { ...currentState, ...appState }
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(newState))
      console.log('App state saved:', newState)
    } catch (error) {
      console.error('Failed to save app state:', error)
    }
  },

  // Load app state
  loadAppState: (): Partial<AppState> => {
    if (!isBrowser) return {}
    
    try {
      const stored = localStorage.getItem(APP_STATE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load app state:', error)
      return {}
    }
  },

  // Clear all stored data (for debugging or reset)
  clearAll: () => {
    if (!isBrowser) return
    
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(APP_STATE_KEY)
    console.log('All stored data cleared')
  }
}

// Auto-save hook for conversations
export const usePersistentConversations = () => {
  const saveConversations = (conversations: GeminiConversation[]) => {
    storage.saveConversations(conversations)
  }

  const saveAppState = (appState: Partial<AppState>) => {
    storage.saveAppState(appState)
  }

  return {
    saveConversations,
    saveAppState,
    loadConversations: storage.loadConversations,
    loadAppState: storage.loadAppState
  }
}
