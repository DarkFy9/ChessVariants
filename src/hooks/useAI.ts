import { useState, useEffect, useCallback, useRef } from 'react'
import { chessAI, AILevel, AISettings, validateAndNormalizeMove } from '../services/chessAI'
import { Chess } from 'chess.js'
import { Move } from './useChess'

export type OpponentType = 'human' | 'ai'

interface UseAIProps {
  game: Chess
  currentTurn: 'w' | 'b'
  isGameOver: boolean
  makeMove: (move: Move) => boolean
  opponentType: OpponentType | 'ai_vs_ai'
  aiLevel: AILevel
  customSettings?: Partial<AISettings>
  aiColor?: 'w' | 'b' // Color that AI plays as
  whiteAI?: AILevel // For AI vs AI mode
  blackAI?: AILevel // For AI vs AI mode
  customDelay?: number // Custom delay for watch mode
  isPaused?: boolean // For watch mode pause control
}

export function useAI({
  game,
  currentTurn,
  isGameOver,
  makeMove,
  opponentType,
  aiLevel,
  customSettings,
  aiColor = 'b', // Default to black for backward compatibility
  whiteAI,
  blackAI,
  customDelay,
  isPaused = false
}: UseAIProps) {
  const [isAIInitialized, setIsAIInitialized] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [initializationAttempts, setInitializationAttempts] = useState(0)
  const isMountedRef = useRef(true)

  // Initialize AI when component mounts or when switching to AI mode
  useEffect(() => {
    let isMounted = true

    const initializeAI = async () => {
      console.log('initializeAI called with:', { opponentType, isAIInitialized, initializationAttempts })
      
      // Only initialize if we're in AI mode (including AI vs AI) and not already initialized
      if ((opponentType !== 'ai' && opponentType !== 'ai_vs_ai') || isAIInitialized || initializationAttempts >= 3) {
        console.log('Skipping initialization')
        return
      }

      try {
        setInitializationAttempts(prev => prev + 1)
        console.log('Starting AI initialization...')
        await chessAI.initialize()
        console.log('AI initialization completed!')
        
        console.log('isMounted check:', isMounted)
        if (isMounted) {
          console.log('About to set isAIInitialized to true')
          setIsAIInitialized(true)
          setAiError(null)
          console.log('AI state updated to initialized')
        } else {
          console.log('Component unmounted, skipping state update')
        }
      } catch (error) {
        if (isMounted) {
          setAiError(error instanceof Error ? error.message : 'Failed to initialize AI')
          
          // Retry after delay if we haven't exceeded max attempts
          if (initializationAttempts < 2) {
            setTimeout(() => {
              if (isMounted) {
                initializeAI()
              }
            }, 2000)
          }
        }
      }
    }

    initializeAI()

    return () => {
      isMounted = false
    }
  }, [opponentType])

  // Stable makeMove function
  const stableMakeMove = useCallback((move: Move) => {
    console.log('Making AI move:', move)
    const success = makeMove(move)
    console.log('Move success:', success)
    return success
  }, [makeMove])

  // Make AI move when it's AI's turn
  useEffect(() => {
    // Check if AI should move based on mode
    const shouldMakeMove = () => {
      if (!isAIInitialized || isAIThinking || isGameOver || isPaused) {
        return false
      }
      
      if (opponentType === 'ai_vs_ai') {
        // In AI vs AI mode, both colors are AI
        return true
      }
      
      if (opponentType === 'ai' && currentTurn === aiColor) {
        // In Human vs AI mode, only AI color moves
        return true
      }
      
      return false
    }

    const makeAIMove = async () => {
      console.log('AI Move Check:', {
        isAIInitialized,
        isAIThinking,
        isGameOver,
        opponentType,
        currentTurn,
        isPaused,
        shouldMove: shouldMakeMove()
      })

      if (!shouldMakeMove()) {
        return
      }

      setIsAIThinking(true)
      setAiError(null)

      try {
        // Determine which AI to use based on mode and current turn
        let currentAI = aiLevel
        if (opponentType === 'ai_vs_ai') {
          currentAI = currentTurn === 'w' ? (whiteAI || 'medium') : (blackAI || 'medium')
        }
        
        const settings = chessAI.getSettingsForLevel(currentAI, customSettings)
        console.log('Requesting AI move with settings:', settings)
        const aiMove = await chessAI.getBestMove(game.fen(), settings, customDelay)
        console.log('AI returned move:', aiMove)

        if (!isMountedRef.current) {
          console.log('Component unmounted during AI move, skipping')
          setIsAIThinking(false)
          return
        }

        if (aiMove) {
          // Validate the move with chess.js
          const validatedMove = validateAndNormalizeMove(game, aiMove)
          console.log('Validated move:', validatedMove)
          
          if (validatedMove) {
            // Make the move immediately instead of using setTimeout
            console.log('About to make AI move')
            const success = stableMakeMove(validatedMove)
            if (!success) {
              setAiError('AI made an invalid move')
            }
            setIsAIThinking(false)
          } else {
            console.log('Move validation failed')
            setAiError('AI suggested an invalid move')
            setIsAIThinking(false)
          }
        } else {
          console.log('AI returned no move')
          setAiError('AI could not find a move')
          setIsAIThinking(false)
        }
      } catch (error) {
        console.log('AI move error:', error)
        setAiError(error instanceof Error ? error.message : 'AI move failed')
        setIsAIThinking(false)
      }
    }

    makeAIMove()
  }, [
    isAIInitialized,
    isAIThinking,
    isGameOver,
    opponentType,
    currentTurn,
    game.fen(), // Use FEN to detect position changes
    aiLevel,
    customSettings,
    stableMakeMove,
    whiteAI,
    blackAI,
    customDelay,
    isPaused
  ])

  // Update mounted ref
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  })

  const resetAI = useCallback(() => {
    setIsAIThinking(false)
    setAiError(null)
  }, [])

  const retryInitialization = useCallback(() => {
    setInitializationAttempts(0)
    setAiError(null)
    setIsAIInitialized(false)
  }, [])

  return {
    isAIInitialized,
    isAIThinking,
    aiError,
    resetAI,
    retryInitialization,
    canRetryInit: initializationAttempts >= 3 && !isAIInitialized
  }
}