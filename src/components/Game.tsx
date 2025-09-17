import ChessBoard from './ChessBoard'
import CapturedPieces from './CapturedPieces'
import AIControls from './AIControls'
import { useChess, Move } from '../hooks/useChess'
import { useAI, OpponentType } from '../hooks/useAI'
import { AILevel, AISettings } from '../services/chessAI'
import { useState, useEffect } from 'react'
import { GameConfig } from '../App'

interface GameProps {
  gameConfig: GameConfig
  onBackToHome: () => void
}

export default function Game({ gameConfig, onBackToHome }: GameProps) {
  const { gameState, makeMove, resetGame, undoMove, getPossibleMoves, isValidMove } = useChess()
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>(gameConfig.playerColor)
  const [opponentType, setOpponentType] = useState<OpponentType | 'ai_vs_ai'>(gameConfig.opponentType)
  const [aiLevel, setAiLevel] = useState<AILevel>(gameConfig.aiLevel)
  const [aiSettings, setAiSettings] = useState<AISettings>({ level: gameConfig.aiLevel, depth: 8 })
  
  // Watch mode specific state
  const [isPaused, setIsPaused] = useState(false)
  const [watchSpeed, setWatchSpeed] = useState(gameConfig.watchModeSpeed || 1000)
  
  // Update settings when gameConfig changes
  useEffect(() => {
    setBoardOrientation(gameConfig.playerColor)
    setOpponentType(gameConfig.opponentType)
    setAiLevel(gameConfig.aiLevel)
    setAiSettings({ level: gameConfig.aiLevel, depth: 8 })
    setWatchSpeed(gameConfig.watchModeSpeed || 1000)
  }, [gameConfig])
  
  // Determine AI color based on player color (for human vs AI mode)
  const aiColor = gameConfig.playerColor === 'white' ? 'b' : 'w'
  
  const {
    isAIInitialized,
    isAIThinking,
    aiError,
    resetAI,
    retryInitialization,
    canRetryInit
  } = useAI({
    game: gameState.game,
    currentTurn: gameState.turn,
    isGameOver: gameState.isGameOver,
    makeMove,
    opponentType,
    aiLevel,
    customSettings: aiSettings.level === 'custom' ? aiSettings : undefined,
    aiColor,
    whiteAI: gameConfig.whiteAI,
    blackAI: gameConfig.blackAI,
    customDelay: watchSpeed,
    isPaused
  })

  const handleMove = (move: Move) => {
    makeMove(move)
  }

  const handleNewGame = () => {
    resetGame()
    resetAI()
  }

  const getStatusMessage = () => {
    if (gameState.isGameOver) {
      switch (gameState.status) {
        case 'checkmate':
          return `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins!`
        case 'stalemate':
          return 'Stalemate - Draw!'
        case 'draw':
          return 'Draw!'
      }
    }

    if (gameState.status === 'check') {
      return `${gameState.turn === 'w' ? 'White' : 'Black'} is in check!`
    }

    // Show AI thinking status
    if (opponentType === 'ai_vs_ai') {
      if (isPaused) {
        return '⏸️ Paused - Click Play to resume'
      }
      if (isAIThinking) {
        const currentAI = gameState.turn === 'w' ? (gameConfig.whiteAI || 'medium') : (gameConfig.blackAI || 'medium')
        return `${gameState.turn === 'w' ? 'White' : 'Black'} (${currentAI}) is thinking...`
      }
      const currentAI = gameState.turn === 'w' ? (gameConfig.whiteAI || 'medium') : (gameConfig.blackAI || 'medium')
      return `${gameState.turn === 'w' ? 'White' : 'Black'} (${currentAI}) to move`
    }

    if (opponentType === 'ai' && gameState.turn === aiColor && isAIThinking) {
      return 'AI is thinking...'
    }

    const currentPlayer = gameState.turn === 'w' ? 'White' : 'Black'
    const isAITurn = opponentType === 'ai' && gameState.turn === aiColor
    
    return `${currentPlayer}${isAITurn ? ' (AI)' : ''} to move`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBackToHome}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Setup
              </button>
              <h1 className="text-2xl font-bold text-gray-900">♟️ Chess Variants</h1>
            </div>
            <div className="flex space-x-4">
              {/* Watch mode controls */}
              {gameConfig.opponentType === 'ai_vs_ai' && (
                <>
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isPaused 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {isPaused ? '▶️ Play' : '⏸️ Pause'}
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Speed:</span>
                    <input
                      type="range"
                      min="300"
                      max="3000"
                      step="100"
                      value={watchSpeed}
                      onChange={(e) => setWatchSpeed(parseInt(e.target.value))}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 min-w-12">
                      {(watchSpeed / 1000).toFixed(1)}s
                    </span>
                  </div>
                </>
              )}
              
              <button 
                onClick={() => setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Flip Board
              </button>
              
              {/* Only show undo for non-AI vs AI games */}
              {gameConfig.opponentType !== 'ai_vs_ai' && (
                <button 
                  onClick={undoMove}
                  disabled={gameState.history.length === 0}
                  className="disabled:opacity-50 disabled:cursor-not-allowed bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Undo
                </button>
              )}
              
              <button 
                onClick={handleNewGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
              <p className="text-lg font-semibold text-center">
                {getStatusMessage()}
              </p>
            </div>
            
            <ChessBoard 
              position={gameState.position}
              onMove={handleMove}
              disabled={
                gameState.isGameOver || 
                (opponentType === 'ai' && gameState.turn === aiColor) ||
                opponentType === 'ai_vs_ai' // Always disabled in watch mode
              }
              boardOrientation={boardOrientation}
              getPossibleMoves={getPossibleMoves}
              isValidMove={isValidMove}
            />
          </div>
          
          <div className="lg:w-80 space-y-4">
            {/* Only show AI controls for human vs AI games */}
            {gameConfig.opponentType === 'ai' && (
              <AIControls
                opponentType={opponentType as OpponentType}
                aiLevel={aiLevel}
                aiSettings={aiSettings}
                isGameActive={gameState.history.length > 0 && !gameState.isGameOver}
                onOpponentTypeChange={setOpponentType as (type: OpponentType) => void}
                onAILevelChange={setAiLevel}
                onAISettingsChange={setAiSettings}
              />
            )}

            {/* Watch mode AI info */}
            {gameConfig.opponentType === 'ai_vs_ai' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎬</span>
                  <span>AI Battle Info</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">⚪ White:</span>{' '}
                    <span className="capitalize">{gameConfig.whiteAI || 'medium'}</span>
                  </div>
                  <div>
                    <span className="font-medium">⚫ Black:</span>{' '}
                    <span className="capitalize">{gameConfig.blackAI || 'medium'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Speed:</span>{' '}
                    <span>{(watchSpeed / 1000).toFixed(1)}s between moves</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={isPaused ? 'text-yellow-600' : 'text-green-600'}>
                      {isPaused ? 'Paused' : 'Playing'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <CapturedPieces 
              capturedPieces={gameState.capturedPieces}
              materialAdvantage={gameState.materialAdvantage}
            />
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Game Info</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Turn:</span>{' '}
                  <span className="capitalize">
                    {gameState.turn === 'w' ? 'White' : 'Black'}
                    {opponentType === 'ai' && gameState.turn === aiColor && ' (AI)'}
                    {opponentType === 'ai_vs_ai' && ` (${gameState.turn === 'w' ? (gameConfig.whiteAI || 'medium') : (gameConfig.blackAI || 'medium')})`}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{gameState.status}</span>
                </div>
                
                <div>
                  <span className="font-medium">Moves:</span>{' '}
                  <span>{gameState.history.length}</span>
                </div>

                {opponentType === 'ai' && (
                  <div>
                    <span className="font-medium">AI Status:</span>{' '}
                    <span className={`${isAIInitialized ? 'text-green-600' : 'text-yellow-600'}`}>
                      {!isAIInitialized && 'Initializing...'}
                      {isAIInitialized && !isAIThinking && 'Ready'}
                      {isAIThinking && 'Thinking...'}
                    </span>
                  </div>
                )}
              </div>

              {/* AI Error Display */}
              {aiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 text-sm font-medium">AI Error</div>
                  <div className="text-red-600 text-sm mt-1">{aiError}</div>
                  {canRetryInit && (
                    <button
                      onClick={retryInitialization}
                      className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Retry Initialize
                    </button>
                  )}
                </div>
              )}
              
              {gameState.history.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Move History</h4>
                  <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                    {gameState.history.map((move, index) => (
                      <div key={index} className="flex">
                        <span className="w-8 text-gray-500">
                          {Math.floor(index / 2) + 1}.
                        </span>
                        <span className="flex-1">
                          {index % 2 === 0 ? move : `  ${move}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}