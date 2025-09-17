# Chess Variants - AI Battle Arena

A React-based chess application featuring unconventional AI algorithms and AI vs AI watch mode. Inspired by Tom's exploration of over 30 deliberately "lousy" chess algorithms, this project brings quirky AI opponents like "Worstfish", "Swarm", and "Huddle" to life with modern web technology.

## Features

### Game Modes
- **Human vs Human** - Classic chess between two players
- **Human vs AI** - Play against various AI opponents
- **AI vs AI** - Watch mode with two AIs battling each other

### AI Opponents

#### Traditional AI
- **Easy** (~400 ELO) - Beginner level with quick moves
- **Medium** (~1000 ELO) - Intermediate strength
- **Hard** (~1800 ELO) - Strong tactical play

#### Unconventional AI
- **Random Move** - Completely random legal moves
- **Huddle** - Keeps all pieces close to own king for defense
- **Swarm** - All pieces try to converge on your king
- **Worstfish** - Intentionally plays the worst moves possible

### Future AI Implementations
Planned unconventional algorithms inspired by Tom's research:

#### Chess-Oriented Strategies
- **CCCP** - Checkmate, Check, Capture, Push priority system
- **Alphabetical** - Plays first legal move alphabetically
- **Same/Opposite Color** - Moves to squares of same/opposite color

#### Survival-Based Strategies  
- **Safe/Dangerous** - Seeks squares with highest/lowest survival probability
- **Survivalist/Fatalist** - Maximizes/minimizes piece survival chances
- **Popular/Rare** - Moves to most/least common square destinations

#### Aggressive & Mathematical
- **Suicide King** - King moves closest to enemy king
- **Pi/E Moves** - Moves based on digits of mathematical constants
- **Minimum Opponent** - Leaves opponent with fewest legal moves

#### "Wimpy" Strategies
- **Pacifist** - Avoids all captures and checks
- **Generous** - Constantly offers pieces for capture
- **No, I Insist** - Forces opponent to capture pieces

### Watch Mode Features
- Speed control slider (0.3s - 3s between moves)
- Pause/play controls
- Real-time move tracking
- Material advantage display

### Game Features
- Player color selection (White/Black)
- Move history tracking
- Captured pieces display
- Material advantage calculation
- Threefold repetition detection
- Check/checkmate/stalemate detection

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Chess Logic**: chess.js
- **Chess Engine**: Stockfish (Web Worker)
- **Styling**: Tailwind CSS
- **Board Component**: react-chessboard

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess-variants
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── Game.tsx              # Main game component
│   ├── ChessBoard.tsx         # Chess board wrapper
│   ├── CapturedPieces.tsx     # Captured pieces display
│   └── AIControls.tsx         # AI configuration controls
├── hooks/
│   ├── useChess.ts            # Chess game state management
│   └── useAI.ts               # AI integration and control
├── services/
│   └── chessAI.ts            # Stockfish integration and custom AIs
└── App.tsx                   # Main app with game setup
```

## AI Implementation Details

### Stockfish Integration
- Uses UCI (Universal Chess Interface) protocol
- Configurable ELO ratings with `UCI_LimitStrength` and `UCI_Elo`
- Skill levels (0-20) for fine-tuned strength control
- Web Worker implementation for non-blocking gameplay

### Custom AI Algorithms
- **Worstfish**: Evaluates all moves and selects the worst
- **Swarm**: Uses Chebyshev distance to converge on opponent king
- **Huddle**: Minimizes distance from own pieces to own king
- **Random**: Selects from all legal moves randomly

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by **Tom's research** on unconventional chess algorithms (30+ "deliberately lousy" chess AI strategies)
- Built with modern React and TypeScript best practices
- Stockfish chess engine for traditional AI opponents
- chess.js library for game logic and move validation