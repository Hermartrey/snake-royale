import React, { useState } from 'react';
import { SnakeGame } from '@/components/game/SnakeGame';
import { Leaderboard } from '@/components/Leaderboard';
import { SpectatorView } from '@/components/spectator/SpectatorView';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Trophy, Eye } from 'lucide-react';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={openLogin} onSignupClick={openSignup} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-arcade text-3xl md:text-4xl text-primary neon-text mb-4 animate-fade-in">
            SNAKE GAME
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Classic arcade action with modern multiplayer features. 
            Compete for the top spot on the leaderboard!
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="play" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="play" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Play</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="spectate" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Spectate</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="animate-fade-in">
            <div className="flex justify-center">
              <SnakeGame />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="animate-fade-in">
            <div className="max-w-md mx-auto">
              <Leaderboard />
            </div>
          </TabsContent>

          <TabsContent value="spectate" className="animate-fade-in">
            <SpectatorView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Use arrow keys or WASD to control the snake</p>
          <p className="mt-1 text-xs">
            Pass-Through: Go through walls | Walls: Game over on collision
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default Index;
