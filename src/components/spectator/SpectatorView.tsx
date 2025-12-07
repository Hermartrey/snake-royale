import React, { useState, useEffect, useRef } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { spectatorApi, type ActiveGame } from '@/api/mockApi';
import {
  createInitialState,
  moveSnake,
  setDirection,
  calculateAIMove,
  type GameState,
  type GameMode,
} from '@/game/gameLogic';
import { Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimulatedPlayer {
  id: string;
  name: string;
  mode: GameMode;
  gameState: GameState;
}

const SIMULATED_PLAYERS = [
  { name: 'PixelNinja', mode: 'passthrough' as GameMode },
  { name: 'RetroGamer', mode: 'walls' as GameMode },
  { name: 'ArcadeKing', mode: 'passthrough' as GameMode },
];

export function SpectatorView() {
  const [players, setPlayers] = useState<SimulatedPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<SimulatedPlayer | null>(null);
  const gameLoopRef = useRef<number>();

  // Initialize simulated players
  useEffect(() => {
    const initialPlayers = SIMULATED_PLAYERS.map((p, index) => ({
      id: `sim-${index}`,
      name: p.name,
      mode: p.mode,
      gameState: createInitialState(p.mode),
    }));
    setPlayers(initialPlayers);
    setSelectedPlayer(initialPlayers[0]);
  }, []);

  // Game loop for all simulated players
  useEffect(() => {
    gameLoopRef.current = window.setInterval(() => {
      setPlayers(prevPlayers =>
        prevPlayers.map(player => {
          if (player.gameState.isGameOver) {
            // Restart after a delay
            return {
              ...player,
              gameState: createInitialState(player.mode),
            };
          }

          // Calculate AI move
          const aiDirection = calculateAIMove(player.gameState);
          const stateWithDirection = setDirection(player.gameState, aiDirection);
          const newState = moveSnake(stateWithDirection);

          return {
            ...player,
            gameState: newState,
          };
        })
      );
    }, 150);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  // Update selected player reference when players update
  useEffect(() => {
    if (selectedPlayer) {
      const updated = players.find(p => p.id === selectedPlayer.id);
      if (updated) {
        setSelectedPlayer(updated);
      }
    }
  }, [players, selectedPlayer?.id]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <Eye className="h-5 w-5 text-accent" />
        <h2 className="font-arcade text-lg text-accent neon-text-magenta">
          SPECTATOR MODE
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Player List */}
        <div className="lg:w-48 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Live Players</span>
          </div>
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all",
                selectedPlayer?.id === player.id
                  ? "bg-accent/20 border border-accent/50"
                  : "bg-muted/50 hover:bg-muted border border-transparent"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{player.name}</span>
                <span className="text-xs text-primary font-arcade">
                  {player.gameState.score}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">
                  {player.mode}
                </span>
                {!player.gameState.isGameOver && (
                  <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Game View */}
        <div className="flex-1 flex flex-col items-center">
          {selectedPlayer && (
            <>
              <div className="text-center mb-4">
                <p className="font-mono text-lg text-foreground">
                  Watching: <span className="text-secondary">{selectedPlayer.name}</span>
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  Mode: {selectedPlayer.mode}
                </p>
              </div>
              <GameBoard
                gameState={selectedPlayer.gameState}
                isSpectator
              />
              <div className="mt-4 text-center">
                <p className="font-arcade text-2xl text-primary neon-text">
                  {selectedPlayer.gameState.score}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
