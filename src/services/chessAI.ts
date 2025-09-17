import { Chess } from 'chess.js'

export type AILevel = 'easy' | 'medium' | 'hard' | 'worstfish' | 'random' | 'huddle' | 'swarm' | 'custom'

export interface AISettings {
  level: AILevel
  depth?: number        // Search depth (for custom)
  time?: number         // Time limit in ms (for custom)
  nodes?: number        // Node limit (for custom)
  eloRating?: number    // ELO rating for UCI_LimitStrength
  limitStrength?: boolean // Whether to use UCI_LimitStrength
  skillLevel?: number   // Skill Level 0-20 (alternative to ELO)
}

export interface AIMove {
  from: string
  to: string
  promotion?: string
}

const DEFAULT_SETTINGS: Record<Exclude<AILevel, 'custom'>, AISettings> = {
  easy: { level: 'easy', eloRating: 1320, limitStrength: true, skillLevel: 1, time: 500 },      // ~400 ELO equivalent
  medium: { level: 'medium', eloRating: 1800, limitStrength: true, skillLevel: 8, time: 1000 }, // ~1000 ELO equivalent  
  hard: { level: 'hard', eloRating: 2400, limitStrength: true, skillLevel: 15, time: 2000 },    // ~1800 ELO equivalent
  worstfish: { level: 'worstfish', depth: 8 },
  random: { level: 'random' },
  huddle: { level: 'huddle' },
  swarm: { level: 'swarm' }
}

class ChessAI {
  private worker: Worker | null = null
  private isReady = false
  private messageHandlers: Array<(message: string) => void> = []
  private initializePromise: Promise<void> | null = null

  async initialize(): Promise<void> {
    // Don't initialize if already ready
    if (this.isReady && this.worker) {
      return Promise.resolve()
    }

    // If already initializing, return the existing promise
    if (this.initializePromise) {
      return this.initializePromise
    }

    this.initializePromise = new Promise((resolve, reject) => {
      try {
        // Create a Web Worker to run Stockfish
        this.worker = new Worker('/stockfish/stockfish.js')
        
        let uciReceived = false
        let readyReceived = false
        
        this.worker.onmessage = (e) => {
          const message = e.data
          console.log('Stockfish:', message) // Debug logging
          
          // Handle initialization messages
          if (message === 'uciok') {
            uciReceived = true
            this.worker?.postMessage('isready')
            return
          }
          
          if (message === 'readyok') {
            readyReceived = true
            if (uciReceived && readyReceived) {
              this.isReady = true
              console.log('Stockfish initialized successfully!')
              this.initializePromise = null
              resolve()
            }
            return
          }
          
          // Pass other messages to active handlers
          this.messageHandlers.forEach(handler => handler(message))
        }
        
        this.worker.onerror = (error) => {
          console.error('Stockfish Worker Error:', error)
          this.initializePromise = null
          reject(new Error('Failed to initialize Stockfish worker'))
        }
        
        // Start UCI protocol
        this.worker.postMessage('uci')
        
        // Set a timeout for initialization
        setTimeout(() => {
          if (!this.isReady) {
            this.initializePromise = null
            reject(new Error('Stockfish initialization timed out'))
          }
        }, 10000)
        
      } catch (error) {
        this.initializePromise = null
        reject(error)
      }
    })

    return this.initializePromise
  }

  async getBestMove(fen: string, settings: AISettings, customDelay?: number): Promise<AIMove | null> {
    const startTime = Date.now()

    // Handle special algorithms that don't use Stockfish
    if (settings.level === 'worstfish') {
      const worstMove = await this.getWorstMove(fen, settings)
      
      // Apply minimum delay (custom or default 0.5 seconds)
      const elapsedTime = Date.now() - startTime
      const minDelay = customDelay || 500
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime))
      }
      
      return worstMove
    }

    if (settings.level === 'random') {
      const randomMove = this.getRandomMove(fen)
      
      // Apply minimum delay (custom or default 0.5 seconds)
      const elapsedTime = Date.now() - startTime
      const minDelay = customDelay || 500
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime))
      }
      
      return randomMove
    }

    if (settings.level === 'huddle') {
      const huddleMove = this.getHuddleMove(fen)
      
      // Apply minimum delay (custom or default 0.5 seconds)
      const elapsedTime = Date.now() - startTime
      const minDelay = customDelay || 500
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime))
      }
      
      return huddleMove
    }

    if (settings.level === 'swarm') {
      const swarmMove = this.getSwarmMove(fen)
      
      // Apply minimum delay (custom or default 0.5 seconds)
      const elapsedTime = Date.now() - startTime
      const minDelay = customDelay || 500
      if (elapsedTime < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime))
      }
      
      return swarmMove
    }

    // Regular Stockfish behavior for other levels
    if (!this.isReady || !this.worker) {
      throw new Error('Stockfish is not ready')
    }

    const move = await new Promise<AIMove | null>((resolve) => {
      let resolved = false
      
      const messageHandler = (message: string) => {
        console.log('Stockfish move response:', message) // Debug logging
        
        if (message.startsWith('bestmove') && !resolved) {
          resolved = true
          
          // Remove this handler from the list
          const index = this.messageHandlers.indexOf(messageHandler)
          if (index > -1) {
            this.messageHandlers.splice(index, 1)
          }
          
          clearTimeout(timeout)
          
          const parts = message.split(' ')
          const moveString = parts[1]
          
          console.log('Parsing bestmove:', { message, parts, moveString })
          
          if (!moveString || moveString === '(none)') {
            console.log('No valid move found')
            resolve(null)
            return
          }

          // Parse the move string (e.g., "e2e4" or "e7e8q" for promotion)
          const from = moveString.substring(0, 2)
          const to = moveString.substring(2, 4)
          const promotion = moveString.length > 4 ? moveString.substring(4) : undefined

          const move: AIMove = { from, to, promotion }
          console.log('AI move parsed:', move)
          resolve(move)
        }
      }

      // Add this handler to the list
      this.messageHandlers.push(messageHandler)

      // Default timeout to prevent hanging (max 5 seconds as requested)
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          // Remove this handler from the list
          const index = this.messageHandlers.indexOf(messageHandler)
          if (index > -1) {
            this.messageHandlers.splice(index, 1)
          }
          resolve(null)
        }
      }, 5000)
      
      // Configure UCI strength settings if specified
      if (settings.limitStrength && settings.eloRating) {
        this.worker!.postMessage(`setoption name UCI_LimitStrength value true`)
        this.worker!.postMessage(`setoption name UCI_Elo value ${settings.eloRating}`)
      } else {
        this.worker!.postMessage(`setoption name UCI_LimitStrength value false`)
      }
      
      // Set skill level if specified (0-20, where 0 is weakest)
      if (settings.skillLevel !== undefined) {
        this.worker!.postMessage(`setoption name Skill Level value ${settings.skillLevel}`)
      }

      // Set position
      this.worker!.postMessage(`position fen ${fen}`)

      // Configure search parameters based on difficulty
      let searchCommand = 'go'
      
      // Prefer time-based search for better ELO differentiation
      if (settings.time !== undefined) {
        searchCommand += ` movetime ${settings.time}`
      } else if (settings.depth !== undefined) {
        searchCommand += ` depth ${settings.depth}`
      }
      
      if (settings.nodes !== undefined) {
        searchCommand += ` nodes ${settings.nodes}`
      }

      // Start search
      this.worker!.postMessage(searchCommand)
    })

    // Apply minimum delay (smart logic for different AI levels)
    const elapsedTime = Date.now() - startTime
    let minDelay = customDelay || 500
    
    // If AI is using time-based search >= 500ms, don't add extra delay
    if (settings.time && settings.time >= 500) {
      minDelay = Math.max(settings.time + 100, customDelay || settings.time + 100) // Small buffer for UI smoothness
    }
    
    if (elapsedTime < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime))
    }

    return move
  }

  private async getWorstMove(fen: string, settings: AISettings): Promise<AIMove | null> {
    if (!this.isReady || !this.worker) {
      throw new Error('Stockfish is not ready')
    }

    // Get all legal moves from the current position
    const testGame = new Chess(fen)
    const legalMoves = testGame.moves({ verbose: true })
    
    if (legalMoves.length === 0) {
      return null
    }

    // If only one move, return it
    if (legalMoves.length === 1) {
      const move = legalMoves[0]
      return {
        from: move.from,
        to: move.to,
        promotion: move.promotion
      }
    }

    let worstMove: AIMove | null = null
    let worstScore = Infinity

    // Evaluate each legal move to find the worst one
    for (const move of legalMoves) {
      // Make the move on a test game
      const testPosition = new Chess(fen)
      testPosition.move(move)
      const newFen = testPosition.fen()
      
      try {
        // Get Stockfish evaluation for this position
        const score = await this.evaluatePosition(newFen, settings.depth || 8)
        
        // For worstfish, we want the move that gives the opponent the best advantage
        // So we look for the lowest score from our perspective
        if (score < worstScore) {
          worstScore = score
          worstMove = {
            from: move.from,
            to: move.to,
            promotion: move.promotion
          }
        }
      } catch (error) {
        console.log('Error evaluating move:', move, error)
        // If evaluation fails for this move, continue with others
      }
    }

    // If no move was successfully evaluated, return a random legal move
    if (!worstMove) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion
      }
    }

    return worstMove
  }

  private async evaluatePosition(fen: string, depth: number): Promise<number> {
    if (!this.isReady || !this.worker) {
      throw new Error('Stockfish is not ready')
    }

    return new Promise((resolve, reject) => {
      let resolved = false
      
      const messageHandler = (message: string) => {
        if (message.startsWith('info') && message.includes('score cp') && !resolved) {
          // Parse centipawn score from info line
          const match = message.match(/score cp (-?\d+)/)
          if (match) {
            const score = parseInt(match[1])
            // Don't resolve immediately, wait for the final evaluation
            if (message.includes(`depth ${depth}`)) {
              resolved = true
              // Remove this handler from the list
              const index = this.messageHandlers.indexOf(messageHandler)
              if (index > -1) {
                this.messageHandlers.splice(index, 1)
              }
              clearTimeout(timeout)
              resolve(score)
            }
          }
        } else if (message.startsWith('bestmove') && !resolved) {
          // If we get bestmove before a proper evaluation, use last known score or default
          resolved = true
          // Remove this handler from the list
          const index = this.messageHandlers.indexOf(messageHandler)
          if (index > -1) {
            this.messageHandlers.splice(index, 1)
          }
          clearTimeout(timeout)
          resolve(0) // Default score if no evaluation was found
        }
      }

      // Add this handler to the list
      this.messageHandlers.push(messageHandler)

      // Timeout for evaluation
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          const index = this.messageHandlers.indexOf(messageHandler)
          if (index > -1) {
            this.messageHandlers.splice(index, 1)
          }
          reject(new Error('Position evaluation timed out'))
        }
      }, 3000)
      
      // Set position and evaluate
      this.worker!.postMessage(`position fen ${fen}`)
      this.worker!.postMessage(`go depth ${depth}`)
    })
  }

  private getRandomMove(fen: string): AIMove | null {
    const testGame = new Chess(fen)
    const legalMoves = testGame.moves({ verbose: true })
    
    if (legalMoves.length === 0) {
      return null
    }

    // Pick a random legal move
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
    
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion
    }
  }

  private getHuddleMove(fen: string): AIMove | null {
    const testGame = new Chess(fen)
    const legalMoves = testGame.moves({ verbose: true })
    
    if (legalMoves.length === 0) {
      return null
    }

    const currentTurn = testGame.turn()
    
    // Find our own king position
    const board = testGame.board()
    let ourKingPos: { file: number, rank: number } | null = null
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file]
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          ourKingPos = { file, rank }
          break
        }
      }
      if (ourKingPos) break
    }

    if (!ourKingPos) {
      // Fallback to random move if king not found
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion
      }
    }

    // Helper function to calculate Chebyshev distance (king moves)
    const getChebyshevDistance = (square: string, target: { file: number, rank: number }) => {
      const squareFile = square.charCodeAt(0) - 97 // 'a' = 0
      const squareRank = parseInt(square[1]) - 1    // '1' = 0
      
      const fileDiff = Math.abs(squareFile - target.file)
      const rankDiff = Math.abs(squareRank - target.rank)
      
      // Chebyshev distance: maximum of file and rank differences
      return Math.max(fileDiff, rankDiff)
    }

    // Helper function to calculate total distance of all our pieces to our own king
    const getTotalDistanceToOurKing = (gameState: Chess) => {
      const boardState = gameState.board()
      let totalDistance = 0
      
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = boardState[rank][file]
          if (piece && piece.color === currentTurn) {
            // Convert board position to square name
            const square = String.fromCharCode(97 + file) + (rank + 1).toString()
            totalDistance += getChebyshevDistance(square, ourKingPos!)
          }
        }
      }
      
      return totalDistance
    }

    // Find the move that minimizes total distance of all our pieces to our own king
    let bestMove = legalMoves[0]
    let bestTotalDistance = Infinity

    for (const move of legalMoves) {
      // Create a copy of the game and make the move
      const testPosition = new Chess(testGame.fen())
      testPosition.move(move)
      
      // Calculate total distance after this move
      const totalDistance = getTotalDistanceToOurKing(testPosition)
      
      if (totalDistance < bestTotalDistance) {
        bestTotalDistance = totalDistance
        bestMove = move
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion
    }
  }

  private getSwarmMove(fen: string): AIMove | null {
    const testGame = new Chess(fen)
    const legalMoves = testGame.moves({ verbose: true })
    
    if (legalMoves.length === 0) {
      return null
    }

    // Find the opponent's king position
    const currentTurn = testGame.turn()
    const opponentColor = currentTurn === 'w' ? 'b' : 'w'
    
    // Find opponent king position by scanning the board
    const board = testGame.board()
    let opponentKingPos: { file: number, rank: number } | null = null
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file]
        if (piece && piece.type === 'k' && piece.color === opponentColor) {
          opponentKingPos = { file, rank }
          break
        }
      }
      if (opponentKingPos) break
    }

    if (!opponentKingPos) {
      // Fallback to random move if king not found
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion
      }
    }

    // Helper function to calculate Chebyshev distance (king moves)
    const getChebyshevDistance = (square: string, target: { file: number, rank: number }) => {
      const squareFile = square.charCodeAt(0) - 97 // 'a' = 0
      const squareRank = parseInt(square[1]) - 1    // '1' = 0
      
      const fileDiff = Math.abs(squareFile - target.file)
      const rankDiff = Math.abs(squareRank - target.rank)
      
      // Chebyshev distance: maximum of file and rank differences
      return Math.max(fileDiff, rankDiff)
    }

    // Helper function to calculate total distance of all our pieces to opponent king
    const getTotalDistanceToOpponentKing = (gameState: Chess) => {
      const boardState = gameState.board()
      let totalDistance = 0
      
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = boardState[rank][file]
          if (piece && piece.color === currentTurn) {
            // Convert board position to square name
            const square = String.fromCharCode(97 + file) + (rank + 1).toString()
            totalDistance += getChebyshevDistance(square, opponentKingPos!)
          }
        }
      }
      
      return totalDistance
    }

    // Find the move that minimizes total distance of all our pieces to opponent king
    let bestMove = legalMoves[0]
    let bestTotalDistance = Infinity

    for (const move of legalMoves) {
      // Create a copy of the game and make the move
      const testPosition = new Chess(testGame.fen())
      testPosition.move(move)
      
      // Calculate total distance after this move
      const totalDistance = getTotalDistanceToOpponentKing(testPosition)
      
      if (totalDistance < bestTotalDistance) {
        bestTotalDistance = totalDistance
        bestMove = move
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion
    }
  }

  getSettingsForLevel(level: AILevel, customSettings?: Partial<AISettings>): AISettings {
    if (level === 'custom' && customSettings) {
      return { level: 'custom', ...customSettings }
    }
    
    return DEFAULT_SETTINGS[level as Exclude<AILevel, 'custom'>] || DEFAULT_SETTINGS.medium
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.isReady = false
  }
}

// Export a singleton instance
export const chessAI = new ChessAI()

// Helper function to validate moves with chess.js
export function validateAndNormalizeMove(game: Chess, aiMove: AIMove): AIMove | null {
  try {
    // Create a temporary game to test the move
    const testGame = new Chess(game.fen())
    const result = testGame.move({
      from: aiMove.from,
      to: aiMove.to,
      promotion: aiMove.promotion || 'q'
    })
    
    return result ? aiMove : null
  } catch {
    return null
  }
}