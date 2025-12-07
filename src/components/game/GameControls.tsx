import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { type Direction, type GameMode } from '@/game/gameLogic';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  isPaused: boolean;
  isGameOver: boolean;
  onPause: () => void;
  onRestart: () => void;
  onDirectionChange: (direction: Direction) => void;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  score: number;
}

export function GameControls({
  isPaused,
  isGameOver,
  onPause,
  onRestart,
  onDirectionChange,
  mode,
  onModeChange,
  score,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Score</p>
        <p className="font-arcade text-3xl text-primary neon-text">{score}</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wider text-center">Mode</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'passthrough' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('passthrough')}
            className={cn(
              "flex-1 font-mono text-xs",
              mode === 'passthrough' && "neon-border"
            )}
          >
            Pass-Through
          </Button>
          <Button
            variant={mode === 'walls' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('walls')}
            className={cn(
              "flex-1 font-mono text-xs",
              mode === 'walls' && "neon-border"
            )}
          >
            Walls
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onPause}
          disabled={isGameOver}
          className="neon-border-cyan"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onRestart}
          className="neon-border-cyan"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Direction Pad (for mobile) */}
      <div className="grid grid-cols-3 gap-2 w-32 mx-auto md:hidden">
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange('up')}
          className="neon-border"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange('left')}
          className="neon-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange('right')}
          className="neon-border"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange('down')}
          className="neon-border"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div />
      </div>

      {/* Keyboard hints */}
      <div className="hidden md:block text-center text-muted-foreground text-xs">
        <p>Use Arrow Keys or WASD to move</p>
        <p>Space to pause • R to restart</p>
      </div>
    </div>
  );
}
