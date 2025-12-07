import React, { useState, useEffect } from 'react';
import { leaderboardApi, type LeaderboardEntry } from '@/api/mockApi';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  filterMode?: 'passthrough' | 'walls' | 'all';
}

export function Leaderboard({ filterMode = 'all' }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedMode, setSelectedMode] = useState<'passthrough' | 'walls' | 'all'>(filterMode);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const mode = selectedMode === 'all' ? undefined : selectedMode;
    leaderboardApi.getLeaderboard(mode).then(data => {
      setEntries(data);
      setIsLoading(false);
    });
  }, [selectedMode]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 neon-border-cyan">
      <h2 className="font-arcade text-lg text-secondary neon-text-cyan mb-6 text-center">
        LEADERBOARD
      </h2>

      {/* Mode Filter */}
      <div className="flex gap-2 mb-6 justify-center">
        {(['all', 'passthrough', 'walls'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={cn(
              "px-3 py-1 rounded text-xs font-mono uppercase transition-all",
              selectedMode === mode
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === 'all' ? 'All' : mode}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No scores yet!</div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all",
                index === 0 && "bg-yellow-400/10 border border-yellow-400/30",
                index === 1 && "bg-gray-400/10 border border-gray-400/30",
                index === 2 && "bg-amber-600/10 border border-amber-600/30",
                index > 2 && "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-foreground truncate">{entry.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{entry.mode}</p>
              </div>
              <div className="text-right">
                <p className="font-arcade text-sm text-primary">{entry.score}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
