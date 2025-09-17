import { useState } from 'react'
import { AILevel, AISettings } from '../services/chessAI'

export type OpponentType = 'human' | 'ai'

interface AIControlsProps {
  opponentType: OpponentType
  aiLevel: AILevel
  aiSettings: AISettings
  isGameActive: boolean
  onOpponentTypeChange: (type: OpponentType) => void
  onAILevelChange: (level: AILevel) => void
  onAISettingsChange: (settings: AISettings) => void
}

export default function AIControls({
  opponentType,
  aiLevel,
  aiSettings,
  isGameActive,
  onOpponentTypeChange,
  onAILevelChange,
  onAISettingsChange
}: AIControlsProps) {
  const [showCustomSettings, setShowCustomSettings] = useState(false)
  const [customDepth, setCustomDepth] = useState(aiSettings.depth?.toString() || '5')
  const [customTime, setCustomTime] = useState(aiSettings.time?.toString() || '1000')

  const handleLevelChange = (level: AILevel) => {
    onAILevelChange(level)
    if (level === 'custom') {
      setShowCustomSettings(true)
      // Update settings with current custom values
      onAISettingsChange({
        level: 'custom',
        depth: parseInt(customDepth) || 5,
        time: parseInt(customTime) || 1000
      })
    } else {
      setShowCustomSettings(false)
    }
  }

  const handleCustomSettingsUpdate = () => {
    if (aiLevel === 'custom') {
      const depth = parseInt(customDepth) || 5
      const time = parseInt(customTime) || 1000
      onAISettingsChange({
        level: 'custom',
        depth: Math.max(1, Math.min(depth, 20)), // Clamp between 1-20
        time: Math.max(100, Math.min(time, 10000)) // Clamp between 100ms-10s
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎯</span>
        <span>Opponent Settings</span>
      </h3>
      
      {/* Opponent Type Selection */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="flex items-center">
            <input
              type="radio"
              name="opponent"
              value="human"
              checked={opponentType === 'human'}
              onChange={() => onOpponentTypeChange('human')}
              disabled={isGameActive}
              className="mr-2"
            />
            <span>Human vs Human</span>
          </label>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="radio"
              name="opponent"
              value="ai"
              checked={opponentType === 'ai'}
              onChange={() => onOpponentTypeChange('ai')}
              disabled={isGameActive}
              className="mr-2"
            />
            <span>Human vs AI</span>
          </label>
        </div>
      </div>

      {/* AI Difficulty Settings */}
      {opponentType === 'ai' && (
        <div className="border-t pt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Variant
            </label>
            <select
              value={aiLevel}
              onChange={(e) => handleLevelChange(e.target.value as AILevel)}
              disabled={isGameActive}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <optgroup label="🏆 Traditional AI">
                <option value="easy">Easy (~400 ELO)</option>
                <option value="medium">Medium (~1000 ELO)</option>
                <option value="hard">Hard (~1800 ELO)</option>
                <option value="custom">Custom Settings</option>
              </optgroup>
              <optgroup label="🤖 Unconventional AI">
                <option value="random">Random Move</option>
                <option value="huddle">Huddle (Stay Close to King)</option>
                <option value="swarm">Swarm (Hunt King)</option>
                <option value="worstfish">Worstfish (Worst Moves)</option>
              </optgroup>
            </select>
          </div>

          {/* Custom Settings Panel */}
          {showCustomSettings && aiLevel === 'custom' && (
            <div className="bg-gray-50 p-3 rounded-md space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Custom AI Settings</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Search Depth (1-20)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={customDepth}
                  onChange={(e) => setCustomDepth(e.target.value)}
                  onBlur={handleCustomSettingsUpdate}
                  disabled={isGameActive}
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Time Limit (100-10000ms)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  onBlur={handleCustomSettingsUpdate}
                  disabled={isGameActive}
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              
              <div className="text-xs text-gray-500">
                Higher depth = stronger but slower AI
              </div>
            </div>
          )}

          {/* AI Level Info */}
          {!showCustomSettings && (
            <div className="text-sm text-gray-600">
              {aiLevel === 'easy' && '~400 ELO: Quick moves, beginner level'}
              {aiLevel === 'medium' && '~1000 ELO: Intermediate strength'}
              {aiLevel === 'hard' && '~1800 ELO: Strong tactical play'}
              {aiLevel === 'random' && 'Selects completely random legal moves'}
              {aiLevel === 'huddle' && 'Keeps all pieces close to own king for defense'}
              {aiLevel === 'swarm' && 'All pieces try to converge on your king'}
              {aiLevel === 'worstfish' && 'Intentionally plays the worst moves possible'}
            </div>
          )}
        </div>
      )}

      {isGameActive && (
        <div className="mt-4 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          Settings locked during game. Start a new game to change.
        </div>
      )}
    </div>
  )
}