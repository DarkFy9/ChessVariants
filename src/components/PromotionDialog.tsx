interface PromotionDialogProps {
  isOpen: boolean
  color: 'white' | 'black'
  onSelect: (piece: string) => void
  onCancel: () => void
}

const PROMOTION_PIECES = [
  { piece: 'q', symbol: '♛', name: 'Queen' },
  { piece: 'r', symbol: '♜', name: 'Rook' },
  { piece: 'b', symbol: '♝', name: 'Bishop' },
  { piece: 'n', symbol: '♞', name: 'Knight' }
]

export default function PromotionDialog({ isOpen, color, onSelect, onCancel }: PromotionDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Choose promotion piece
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {PROMOTION_PIECES.map(({ piece, symbol, name }) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span 
                className={`text-4xl mb-2 ${color === 'white' ? 'text-gray-300' : 'text-gray-800'}`}
              >
                {symbol}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {name}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}