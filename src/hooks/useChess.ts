import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'

export interface Move {
  from: string
  to: string
  promotion?: string
}

export interface CapturedPieces {
  white: string[]
  black: string[]
}

export interface MaterialCount {
  white: number
  black: number
}

export interface GameState {
  game: Chess
  position: string
  status: GameStatus
  turn: 'w' | 'b'
  history: string[]
  isGameOver: boolean
  capturedPieces: CapturedPieces
  materialAdvantage: number
}

const PIECE_VALUES: { [key: string]: number } = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
}

export function useChess() {
  const [game, setGame] = useState(new Chess())
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({ white: [], black: [] })
  
  const calculateMaterialAdvantage = useCallback((): number => {
    const whiteMaterial = capturedPieces.white.reduce((sum, piece) => sum + PIECE_VALUES[piece.toLowerCase()], 0)
    const blackMaterial = capturedPieces.black.reduce((sum, piece) => sum + PIECE_VALUES[piece.toLowerCase()], 0)
    return whiteMaterial - blackMaterial
  }, [capturedPieces])

  const getGameState = useCallback((): GameState => {
    let status: GameStatus = 'playing'
    
    if (game.isCheckmate()) {
      status = 'checkmate'
    } else if (game.isStalemate()) {
      status = 'stalemate'
    } else if (game.isDraw()) {
      status = 'draw'
    } else if (game.inCheck()) {
      status = 'check'
    }

    return {
      game,
      position: game.fen(),
      status,
      turn: game.turn(),
      history: game.history(),
      isGameOver: game.isGameOver(),
      capturedPieces,
      materialAdvantage: calculateMaterialAdvantage()
    }
  }, [game, capturedPieces, calculateMaterialAdvantage])

  const makeMove = useCallback((move: Move): boolean => {
    try {
      const result = game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q'
      })
      
      if (result) {
        if (result.captured) {
          setCapturedPieces(prev => ({
            ...prev,
            [result.color === 'w' ? 'white' : 'black']: [
              ...prev[result.color === 'w' ? 'white' : 'black'],
              result.captured
            ]
          }))
        }
        
        setGame(new Chess(game.fen()))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }, [game])

  const resetGame = useCallback(() => {
    setGame(new Chess())
    setCapturedPieces({ white: [], black: [] })
  }, [])

  const undoMove = useCallback(() => {
    const undoneMove = game.undo()
    if (undoneMove && undoneMove.captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [undoneMove.color === 'w' ? 'white' : 'black']: prev[undoneMove.color === 'w' ? 'white' : 'black'].slice(0, -1)
      }))
    }
    setGame(new Chess(game.fen()))
  }, [game])

  const isValidMove = useCallback((from: string, to: string): boolean => {
    try {
      const moves = game.moves({ square: from as any, verbose: true })
      return moves.some(move => move.to === to)
    } catch (error) {
      return false
    }
  }, [game])

  const getPossibleMoves = useCallback((square: string) => {
    try {
      return game.moves({ square: square as any, verbose: true })
    } catch (error) {
      return []
    }
  }, [game])

  return {
    gameState: getGameState(),
    makeMove,
    resetGame,
    undoMove,
    isValidMove,
    getPossibleMoves
  }
}