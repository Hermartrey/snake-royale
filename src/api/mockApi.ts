// Centralized Mock API Service
// All backend calls are routed through here for easy migration to real backend

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  date: Date;
}

export interface ActiveGame {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  mode: 'passthrough' | 'walls';
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isActive: boolean;
}

// Simulated database
let currentUser: User | null = null;
const users: Map<string, User & { password: string }> = new Map();
const leaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', date: new Date('2024-12-01') },
  { id: '2', username: 'PixelNinja', score: 2100, mode: 'passthrough', date: new Date('2024-12-03') },
  { id: '3', username: 'RetroGamer', score: 1850, mode: 'walls', date: new Date('2024-12-05') },
  { id: '4', username: 'ArcadeKing', score: 1720, mode: 'passthrough', date: new Date('2024-12-04') },
  { id: '5', username: 'NeonPlayer', score: 1650, mode: 'walls', date: new Date('2024-12-06') },
  { id: '6', username: 'GridRunner', score: 1500, mode: 'passthrough', date: new Date('2024-12-02') },
  { id: '7', username: 'ByteHunter', score: 1350, mode: 'walls', date: new Date('2024-12-01') },
  { id: '8', username: 'VectorViper', score: 1200, mode: 'passthrough', date: new Date('2024-12-05') },
];

// Simulate active games for spectator mode
const activeGames: ActiveGame[] = [];

// Initialize some demo users
users.set('demo@snake.game', {
  id: 'demo-user',
  username: 'DemoPlayer',
  email: 'demo@snake.game',
  password: 'demo123',
  createdAt: new Date(),
});

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    const userData = users.get(email);
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    if (userData.password !== password) {
      return { success: false, error: 'Invalid password' };
    }
    const { password: _, ...user } = userData;
    currentUser = user;
    return { success: true, user };
  },

  async signup(email: string, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    if (users.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      username,
      email,
      createdAt: new Date(),
    };
    users.set(email, { ...user, password });
    currentUser = user;
    return { success: true, user };
  },

  async logout(): Promise<{ success: boolean }> {
    await delay(200);
    currentUser = null;
    return { success: true };
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    return currentUser;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
    await delay(300);
    if (mode) {
      return leaderboard.filter(e => e.mode === mode).sort((a, b) => b.score - a.score);
    }
    return [...leaderboard].sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: 'passthrough' | 'walls'): Promise<{ success: boolean; rank?: number }> {
    await delay(300);
    if (!currentUser) {
      return { success: false };
    }
    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      username: currentUser.username,
      score,
      mode,
      date: new Date(),
    };
    leaderboard.push(entry);
    const sorted = leaderboard.filter(e => e.mode === mode).sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(e => e.id === entry.id) + 1;
    return { success: true, rank };
  },
};

// Spectator API
export const spectatorApi = {
  async getActiveGames(): Promise<ActiveGame[]> {
    await delay(200);
    return activeGames.filter(g => g.isActive);
  },

  async watchGame(gameId: string): Promise<ActiveGame | null> {
    await delay(100);
    return activeGames.find(g => g.id === gameId) || null;
  },

  // For simulation purposes
  startSimulatedGame(playerName: string, mode: 'passthrough' | 'walls'): string {
    const gameId = crypto.randomUUID();
    const game: ActiveGame = {
      id: gameId,
      playerId: crypto.randomUUID(),
      playerName,
      score: 0,
      mode,
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'right',
      isActive: true,
    };
    activeGames.push(game);
    return gameId;
  },

  updateSimulatedGame(gameId: string, updates: Partial<ActiveGame>): void {
    const game = activeGames.find(g => g.id === gameId);
    if (game) {
      Object.assign(game, updates);
    }
  },

  endSimulatedGame(gameId: string): void {
    const game = activeGames.find(g => g.id === gameId);
    if (game) {
      game.isActive = false;
    }
  },
};

// Game state management
export const gameApi = {
  async saveGameState(state: {
    score: number;
    mode: 'passthrough' | 'walls';
  }): Promise<{ success: boolean }> {
    await delay(100);
    // In real implementation, this would sync to server
    return { success: true };
  },
};
