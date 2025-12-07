import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import {
  createInitialState,
  moveSnake,
  setDirection,
  togglePause,
  restartGame,
  type GameState,
  type Direction,
  type GameMode,
} from '@/game/gameLogic';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/api/mockApi';
import { toast } from 'sonner';

interface SnakeGameProps {
  initialMode?: GameMode;
}

export function SnakeGame({ initialMode = 'passthrough' }: SnakeGameProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const [gameSpeed, setGameSpeed] = useState(150);
  const gameLoopRef = useRef<number>();
  const { user } = useAuth();
  const hasSubmittedScore = useRef(false);

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = window.setInterval(() => {
      setGameState(prev => moveSnake(prev));
    }, gameSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, gameSpeed]);

  // Speed increases with score
  useEffect(() => {
    const newSpeed = Math.max(50, 150 - Math.floor(gameState.score / 50) * 10);
    setGameSpeed(newSpeed);
  }, [gameState.score]);

  // Submit score on game over
  useEffect(() => {
    if (gameState.isGameOver && user && !hasSubmittedScore.current && gameState.score > 0) {
      hasSubmittedScore.current = true;
      leaderboardApi.submitScore(gameState.score, gameState.mode).then(result => {
        if (result.success && result.rank) {
          toast.success(`Score submitted! You ranked #${result.rank} in ${gameState.mode} mode`);
        }
      });
    }
  }, [gameState.isGameOver, gameState.score, gameState.mode, user]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const directionMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };

      if (directionMap[e.key]) {
        e.preventDefault();
        setGameState(prev => setDirection(prev, directionMap[e.key]));
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDirectionChange = useCallback((direction: Direction) => {
    setGameState(prev => setDirection(prev, direction));
  }, []);

  const handlePause = useCallback(() => {
    setGameState(prev => togglePause(prev));
  }, []);

  const handleRestart = useCallback(() => {
    hasSubmittedScore.current = false;
    setGameState(restartGame(gameState.mode));
  }, [gameState.mode]);

  const handleModeChange = useCallback((mode: GameMode) => {
    hasSubmittedScore.current = false;
    setGameState(createInitialState(mode));
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <GameBoard gameState={gameState} />
      <GameControls
        isPaused={gameState.isPaused}
        isGameOver={gameState.isGameOver}
        onPause={handlePause}
        onRestart={handleRestart}
        onDirectionChange={handleDirectionChange}
        mode={gameState.mode}
        onModeChange={handleModeChange}
        score={gameState.score}
      />
    </div>
  );
}
