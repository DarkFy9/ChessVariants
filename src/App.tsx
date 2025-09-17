import { useState } from 'react'
import Game from './components/Game'
import { OpponentType } from './hooks/useAI'
import { AILevel } from './services/chessAI'

type Screen = 'home' | 'game'

export interface GameConfig {
  opponentType: OpponentType | 'ai_vs_ai'
  playerColor: 'white' | 'black'
  aiLevel: AILevel
  whiteAI?: AILevel // For AI vs AI mode
  blackAI?: AILevel // For AI vs AI mode
  watchModeSpeed?: number // Delay in milliseconds
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    opponentType: 'human',
    playerColor: 'white',
    aiLevel: 'medium',
    whiteAI: 'medium',
    blackAI: 'random',
    watchModeSpeed: 1000
  })

  if (currentScreen === 'game') {
    return <Game gameConfig={gameConfig} onBackToHome={() => setCurrentScreen('home')} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chess Variants</h1>
            <nav className="flex space-x-4">
              <button 
                onClick={() => setCurrentScreen('game')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Play
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                AI Modes
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Chess Variants
            </h2>
            <p className="text-xl text-gray-600">
              Play chess against unconventional AI algorithms
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-6">
              Game Setup
            </h3>

            {/* Opponent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Game Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setGameConfig(prev => ({ ...prev, opponentType: 'human' }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    gameConfig.opponentType === 'human' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-medium">👥 Human vs Human</div>
                  <div className="text-sm text-gray-600">Play against another person</div>
                </button>
                <button
                  onClick={() => setGameConfig(prev => ({ ...prev, opponentType: 'ai' }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    gameConfig.opponentType === 'ai' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-medium">🤖 Human vs AI</div>
                  <div className="text-sm text-gray-600">Play against computer</div>
                </button>
                <button
                  onClick={() => setGameConfig(prev => ({ ...prev, opponentType: 'ai_vs_ai' }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    gameConfig.opponentType === 'ai_vs_ai' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-medium">🎬 Watch AI vs AI</div>
                  <div className="text-sm text-gray-600">Watch two AIs battle</div>
                </button>
              </div>
            </div>

            {/* Color Selection (only for human games) */}
            {gameConfig.opponentType !== 'ai_vs_ai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Play as
                </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGameConfig(prev => ({ ...prev, playerColor: 'white' }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    gameConfig.playerColor === 'white' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-medium">⚪ White</div>
                  <div className="text-sm text-gray-600">You move first</div>
                </button>
                <button
                  onClick={() => setGameConfig(prev => ({ ...prev, playerColor: 'black' }))}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    gameConfig.playerColor === 'black' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-medium">⚫ Black</div>
                  <div className="text-sm text-gray-600">Opponent moves first</div>
                </button>
              </div>
              </div>
            )}

            {/* AI vs AI Selection (watch mode) */}
            {gameConfig.opponentType === 'ai_vs_ai' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Watch Speed Control
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 min-w-16">Slow</span>
                      <input
                        type="range"
                        min="300"
                        max="3000"
                        step="100"
                        value={gameConfig.watchModeSpeed}
                        onChange={(e) => setGameConfig(prev => ({ ...prev, watchModeSpeed: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 min-w-16">Fast</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm text-gray-700 font-medium">
                        {(gameConfig.watchModeSpeed! / 1000).toFixed(1)}s between moves
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* White AI Selection */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">⚪ White AI</h4>
                    <div className="space-y-2">
                      {(['easy', 'medium', 'hard', 'random', 'huddle', 'swarm', 'worstfish'] as AILevel[]).map((ai) => (
                        <button
                          key={`white-${ai}`}
                          onClick={() => setGameConfig(prev => ({ ...prev, whiteAI: ai }))}
                          className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                            gameConfig.whiteAI === ai
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-medium text-sm capitalize">{ai}</div>
                          <div className="text-xs text-gray-600">
                            {ai === 'easy' && '~400 ELO - Beginner'}
                            {ai === 'medium' && '~1000 ELO - Intermediate'}
                            {ai === 'hard' && '~1800 ELO - Strong'}
                            {ai === 'random' && 'Random moves'}
                            {ai === 'huddle' && 'Stays close to king'}
                            {ai === 'swarm' && 'Hunts opponent king'}
                            {ai === 'worstfish' && 'Plays worst moves'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Black AI Selection */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">⚫ Black AI</h4>
                    <div className="space-y-2">
                      {(['easy', 'medium', 'hard', 'random', 'huddle', 'swarm', 'worstfish'] as AILevel[]).map((ai) => (
                        <button
                          key={`black-${ai}`}
                          onClick={() => setGameConfig(prev => ({ ...prev, blackAI: ai }))}
                          className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                            gameConfig.blackAI === ai
                              ? 'border-gray-800 bg-gray-100 text-gray-800'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-medium text-sm capitalize">{ai}</div>
                          <div className="text-xs text-gray-600">
                            {ai === 'easy' && '~400 ELO - Beginner'}
                            {ai === 'medium' && '~1000 ELO - Intermediate'}
                            {ai === 'hard' && '~1800 ELO - Strong'}
                            {ai === 'random' && 'Random moves'}
                            {ai === 'huddle' && 'Stays close to king'}
                            {ai === 'swarm' && 'Hunts opponent king'}
                            {ai === 'worstfish' && 'Plays worst moves'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentScreen('game')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                >
                  🎬 Start Watching AI Battle
                </button>
              </div>
            )}

            {/* AI Variant Selection (only when AI is selected) */}
            {gameConfig.opponentType === 'ai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose AI Variant
                </label>
                
                {/* Traditional AI Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">🏆 Traditional AI</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'easy' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Easy</div>
                      <div className="text-xs text-gray-600">~400 ELO - Beginner</div>
                    </button>
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'medium' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Medium</div>
                      <div className="text-xs text-gray-600">~1000 ELO - Intermediate</div>
                    </button>
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'hard' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Hard</div>
                      <div className="text-xs text-gray-600">~1800 ELO - Strong</div>
                    </button>
                  </div>
                </div>

                {/* Unconventional AI Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">🤖 Unconventional AI</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'random' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Random Move</div>
                      <div className="text-xs text-gray-600">Completely random moves</div>
                    </button>
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'huddle' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Huddle</div>
                      <div className="text-xs text-gray-600">Stays close to king</div>
                    </button>
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'swarm' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Swarm</div>
                      <div className="text-xs text-gray-600">Hunts your king</div>
                    </button>
                    <button
                      onClick={() => {
                        setGameConfig(prev => ({ ...prev, aiLevel: 'worstfish' }))
                        setCurrentScreen('game')
                      }}
                      className="p-3 rounded-lg border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="font-medium text-sm">Worstfish</div>
                      <div className="text-xs text-gray-600">Plays worst moves</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Start Game Button for Human vs Human */}
            {gameConfig.opponentType === 'human' && (
              <button 
                onClick={() => setCurrentScreen('game')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App