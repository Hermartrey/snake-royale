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

const STORAGE_KEY = 'snake_royale_token';

const getHeaders = () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        // Try to parse error message
        try {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || 'API call failed');
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
    // Handle 204 No Content
    if (response.status === 204) {
        return null as T;
    }
    return response.json();
};

export const authApi = {
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // Handle HTTP error responses (401, 400, etc.)
                const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
                return { success: false, error: errorData.detail || errorData.error || 'Login failed' };
            }

            const data = await response.json();
            if (data.success && data.user) {
                // Mock token behavior: store email as token
                localStorage.setItem(STORAGE_KEY, data.user.email);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Network error' };
        }
    },

    async signup(email: string, username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });

            if (!response.ok) {
                // Handle HTTP error responses (400, etc.)
                const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
                return { success: false, error: errorData.detail || errorData.error || 'Signup failed' };
            }

            const data = await response.json();
            if (data.success && data.user) {
                localStorage.setItem(STORAGE_KEY, data.user.email);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error || 'Signup failed' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Network error' };
        }
    },

    async logout(): Promise<{ success: boolean }> {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: getHeaders(),
            });
            localStorage.removeItem(STORAGE_KEY);
            return { success: true };
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY); // Force logout locally even if server fails
            return { success: true };
        }
    },

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem(STORAGE_KEY);
        if (!token) return null;

        try {
            const response = await fetch('/api/auth/me', {
                headers: getHeaders(),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem(STORAGE_KEY);
                    return null;
                }
                throw new Error('Failed to fetch user');
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching current user:", error);
            return null;
        }
    },
};

export const leaderboardApi = {
    async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
        const params = new URLSearchParams();
        if (mode) params.append('mode', mode);

        try {
            const response = await fetch(`/api/leaderboard?${params.toString()}`);
            return await handleResponse(response);
        } catch (error) {
            console.error("Leaderboard fetch error:", error);
            return [];
        }
    },

    async submitScore(score: number, mode: 'passthrough' | 'walls'): Promise<{ success: boolean; rank?: number }> {
        try {
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ score, mode }),
            });
            return await handleResponse(response);
        } catch (error) {
            console.error("Score submit error:", error);
            return { success: false };
        }
    },
};

export const spectatorApi = {
    async getActiveGames(): Promise<ActiveGame[]> {
        try {
            const response = await fetch('/api/games/active');
            return await handleResponse(response);
        } catch (error) {
            console.error("Active games fetch error:", error);
            return [];
        }
    },

    async watchGame(gameId: string): Promise<ActiveGame | null> {
        try {
            const response = await fetch(`/api/games/${gameId}`);
            return await handleResponse(response);
        } catch (error) {
            return null;
        }
    },

    // Simulation methods not supported by backend yet, returning defaults or doing nothing
    startSimulatedGame(_playerName: string, _mode: 'passthrough' | 'walls'): string {
        console.warn("startSimulatedGame not implemented in real API client");
        return "sim-game-id";
    },

    updateSimulatedGame(_gameId: string, _updates: Partial<ActiveGame>): void {
        // no-op
    },

    endSimulatedGame(_gameId: string): void {
        // no-op
    },
};

export const gameApi = {
    async saveGameState(state: {
        score: number;
        mode: 'passthrough' | 'walls';
    }): Promise<{ success: boolean }> {
        try {
            const response = await fetch('/api/games/save', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(state),
            });
            return await handleResponse(response);
        } catch (error) {
            return { success: false };
        }
    },
};
