import { CapturedPieces as CapturedPiecesType } from '../hooks/useChess'

interface CapturedPiecesProps {
  capturedPieces: CapturedPiecesType
  materialAdvantage: number
}

const PIECE_SYMBOLS: { [key: string]: string } = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
}

const PIECE_VALUES: { [key: string]: number } = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9
}

export default function CapturedPieces({ capturedPieces, materialAdvantage }: CapturedPiecesProps) {
  const renderPieces = (pieces: string[], isWhite: boolean) => {
    const sortedPieces = [...pieces].sort((a, b) => {
      return (PIECE_VALUES[b.toLowerCase()] || 0) - (PIECE_VALUES[a.toLowerCase()] || 0)
    })

    return (
      <div className="flex flex-wrap gap-1">
        {sortedPieces.map((piece, index) => (
          <span 
            key={index} 
            className={`text-2xl ${isWhite ? 'text-gray-300' : 'text-gray-800'}`}
            title={`${piece.toUpperCase()} (${PIECE_VALUES[piece.toLowerCase()]} points)`}
          >
            {PIECE_SYMBOLS[piece.toLowerCase()]}
          </span>
        ))}
      </div>
    )
  }

  const getMaterialAdvantageDisplay = () => {
    if (materialAdvantage === 0) {
      return <span className="text-gray-600">Equal</span>
    }
    
    const advantage = Math.abs(materialAdvantage)
    const color = materialAdvantage > 0 ? 'White' : 'Black'
    const textColor = materialAdvantage > 0 ? 'text-blue-600' : 'text-red-600'
    
    return (
      <span className={`font-semibold ${textColor}`}>
        {color} +{advantage}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold mb-4">Captured Pieces</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">By White</h4>
          <div className="min-h-[40px] bg-gray-50 rounded p-2">
            {capturedPieces.white.length > 0 ? (
              renderPieces(capturedPieces.white, false)
            ) : (
              <span className="text-gray-400 text-sm">None</span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">By Black</h4>
          <div className="min-h-[40px] bg-gray-50 rounded p-2">
            {capturedPieces.black.length > 0 ? (
              renderPieces(capturedPieces.black, true)
            ) : (
              <span className="text-gray-400 text-sm">None</span>
            )}
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Material:</span>
            {getMaterialAdvantageDisplay()}
          </div>
        </div>
      </div>
    </div>
  )
}