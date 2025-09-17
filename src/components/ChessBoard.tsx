import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import PromotionDialog from './PromotionDialog'

interface ChessBoardProps {
  position?: string
  onMove?: (move: { from: string; to: string; promotion?: string }) => void
  boardOrientation?: 'white' | 'black'
  disabled?: boolean
  getPossibleMoves?: (square: string) => any[]
  isValidMove?: (from: string, to: string) => boolean
}

export default function ChessBoard({ 
  position = 'start', 
  onMove, 
  boardOrientation = 'white',
  disabled = false,
  getPossibleMoves,
  isValidMove
}: ChessBoardProps) {
  const [moveFrom, setMoveFrom] = useState<string>('')
  const [rightClickedSquares, setRightClickedSquares] = useState<{ [square: string]: { backgroundColor: string } | undefined }>({})
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: { backgroundColor: string } | undefined }>({})
  const [optionSquares, setOptionSquares] = useState<{ [square: string]: { backgroundColor: string; borderRadius?: string; border?: string } | undefined }>({})
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)

  function isPromotionMove(from: string, to: string): boolean {
    if (!getPossibleMoves) return false
    const moves = getPossibleMoves(from)
    const move = moves.find(m => m.to === to)
    return move?.promotion !== undefined
  }

  function getPieceColor(square: string): 'white' | 'black' | null {
    if (!getPossibleMoves) return null
    const moves = getPossibleMoves(square)
    if (moves.length === 0) return null
    return moves[0].color === 'w' ? 'white' : 'black'
  }

  function onSquareClick(square: string) {
    if (disabled) return

    setRightClickedSquares({})

    if (!moveFrom) {
      const hasPiece = getPossibleMoves ? getPossibleMoves(square).length > 0 : false
      if (hasPiece) {
        setMoveFrom(square)
        getMoveOptions(square)
      }
      return
    }

    if (moveFrom === square) {
      setMoveFrom('')
      setMoveSquares({})
      setOptionSquares({})
      return
    }

    if (isValidMove && isValidMove(moveFrom, square)) {
      if (isPromotionMove(moveFrom, square)) {
        setPromotionMove({ from: moveFrom, to: square })
        setShowPromotionDialog(true)
        return
      }

      const move = {
        from: moveFrom,
        to: square,
        promotion: 'q'
      }

      if (onMove) {
        onMove(move)
      }
    }

    setMoveFrom('')
    setMoveSquares({})
    setOptionSquares({})
  }

  function getMoveOptions(square: string) {
    if (!getPossibleMoves) return
    
    const moves = getPossibleMoves(square)
    const newSquares: { [square: string]: { backgroundColor: string; borderRadius?: string; border?: string } | undefined } = {}
    const moveSquares: { [square: string]: { backgroundColor: string; border?: string } | undefined } = {}
    
    moves.forEach((move) => {
      newSquares[move.to] = {
        backgroundColor: 'rgba(130, 151, 105, 0.8)',
        borderRadius: '50%',
        border: '2px solid rgba(130, 151, 105, 0.9)'
      }
    })
    
    moveSquares[square] = {
      backgroundColor: 'rgba(255, 255, 130, 0.8)',
      border: '3px solid rgba(255, 255, 100, 1)'
    }
    
    setOptionSquares(newSquares)
    setMoveSquares(moveSquares)
  }

  function onSquareRightClick(square: string) {
    const colour = 'rgba(255, 0, 0, 0.4)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square]
        ? undefined
        : { backgroundColor: colour }
    })
  }

  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    if (disabled) return false

    if (isValidMove && isValidMove(sourceSquare, targetSquare)) {
      if (isPromotionMove(sourceSquare, targetSquare)) {
        setPromotionMove({ from: sourceSquare, to: targetSquare })
        setShowPromotionDialog(true)
        return true
      }

      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      }

      if (onMove) {
        onMove(move)
        setMoveFrom('')
        setMoveSquares({})
        setOptionSquares({})
        return true
      }
    }

    return false
  }

  function handlePromotionSelect(piece: string) {
    if (promotionMove && onMove) {
      const move = {
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece
      }
      onMove(move)
    }
    
    setShowPromotionDialog(false)
    setPromotionMove(null)
    setMoveFrom('')
    setMoveSquares({})
    setOptionSquares({})
  }

  function handlePromotionCancel() {
    setShowPromotionDialog(false)
    setPromotionMove(null)
    setMoveFrom('')
    setMoveSquares({})
    setOptionSquares({})
  }

  return (
    <div className="chess-board-container">
      <Chessboard
        position={position}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares
        }}
        boardWidth={560}
        areArrowsAllowed={true}
      />
      
      <PromotionDialog
        isOpen={showPromotionDialog}
        color={promotionMove ? (getPieceColor(promotionMove.from) || 'white') : 'white'}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />
    </div>
  )
}