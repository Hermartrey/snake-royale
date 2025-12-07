import React from 'react';
import { type GameState, GRID_SIZE } from '@/game/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
  isSpectator?: boolean;
}

export function GameBoard({ gameState, cellSize = 20, isSpectator = false }: GameBoardProps) {
  const { snake, food, isGameOver, isPaused, mode } = gameState;
  const boardSize = GRID_SIZE * cellSize;

  return (
    <div className="relative">
      {/* Game Board */}
      <div
        className={cn(
          "relative game-grid border-2 rounded-lg overflow-hidden",
          mode === 'walls' ? "border-destructive/50" : "border-secondary/50",
          isGameOver && "opacity-50"
        )}
        style={{ width: boardSize, height: boardSize }}
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines" />
        
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-sm transition-all duration-75",
              index === 0 
                ? "bg-primary shadow-[0_0_10px_hsl(var(--primary))]" 
                : "bg-primary/80"
            )}
            style={{
              left: segment.x * cellSize,
              top: segment.y * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full bg-food animate-pulse-neon shadow-[0_0_15px_hsl(var(--food))]"
          style={{
            left: food.x * cellSize + 2,
            top: food.y * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
          }}
        />

        {/* Mode indicator */}
        {mode === 'walls' && (
          <div className="absolute inset-0 border-4 border-destructive/30 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Overlay messages */}
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center animate-scale-in">
            <h2 className="font-arcade text-2xl text-destructive neon-text-magenta mb-4">
              GAME OVER
            </h2>
            <p className="text-primary font-arcade text-sm">
              Score: {gameState.score}
            </p>
          </div>
        </div>
      )}

      {isPaused && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center animate-scale-in">
            <h2 className="font-arcade text-xl text-secondary neon-text-cyan animate-flicker">
              PAUSED
            </h2>
          </div>
        </div>
      )}

      {isSpectator && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-accent/20 rounded text-xs font-arcade text-accent">
          LIVE
        </div>
      )}
    </div>
  );
}
