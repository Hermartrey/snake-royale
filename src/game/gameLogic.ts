// Snake Game Logic - Pure functions for testability

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameMode = 'passthrough' | 'walls';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  gridSize: number;
}

export const GRID_SIZE = 20;
export const INITIAL_SNAKE_LENGTH = 3;

export function createInitialState(mode: GameMode): GameState {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  
  const snake: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: centerX - i, y: centerY });
  }

  return {
    snake,
    food: generateFood(snake, GRID_SIZE),
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    isGameOver: false,
    isPaused: false,
    mode,
    gridSize: GRID_SIZE,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (isPositionOnSnake(food, snake));
  return food;
}

export function isPositionOnSnake(position: Position, snake: Position[]): boolean {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

export function getOppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return opposites[direction];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== getOppositeDirection(current);
}

export function setDirection(state: GameState, newDirection: Direction): GameState {
  if (!isValidDirectionChange(state.direction, newDirection)) {
    return state;
  }
  return { ...state, nextDirection: newDirection };
}

export function moveSnake(state: GameState): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const { snake, food, nextDirection, mode, gridSize } = state;
  const head = snake[0];
  
  // Calculate new head position
  let newHead: Position;
  switch (nextDirection) {
    case 'up':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'down':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'left':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'right':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (mode === 'passthrough') {
    // Wrap around
    if (newHead.x < 0) newHead.x = gridSize - 1;
    if (newHead.x >= gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = gridSize - 1;
    if (newHead.y >= gridSize) newHead.y = 0;
  } else {
    // Walls mode - check collision
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
      return { ...state, isGameOver: true, direction: nextDirection };
    }
  }

  // Check self collision (excluding tail which will move)
  const bodyWithoutTail = snake.slice(0, -1);
  if (isPositionOnSnake(newHead, bodyWithoutTail)) {
    return { ...state, isGameOver: true, direction: nextDirection };
  }

  // Check if eating food
  const ateFood = newHead.x === food.x && newHead.y === food.y;
  
  let newSnake: Position[];
  let newFood = food;
  let newScore = state.score;

  if (ateFood) {
    newSnake = [newHead, ...snake];
    newFood = generateFood(newSnake, gridSize);
    newScore += 10;
  } else {
    newSnake = [newHead, ...snake.slice(0, -1)];
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: nextDirection,
    score: newScore,
  };
}

export function togglePause(state: GameState): GameState {
  if (state.isGameOver) return state;
  return { ...state, isPaused: !state.isPaused };
}

export function restartGame(mode: GameMode): GameState {
  return createInitialState(mode);
}

// AI movement for spectator mode simulation
export function calculateAIMove(state: GameState): Direction {
  const { snake, food, direction, gridSize, mode } = state;
  const head = snake[0];
  
  const possibleMoves: Direction[] = ['up', 'down', 'left', 'right'].filter(
    d => isValidDirectionChange(direction, d as Direction)
  ) as Direction[];

  // Calculate next positions for each move
  const moveResults = possibleMoves.map(move => {
    let nextPos: Position;
    switch (move) {
      case 'up': nextPos = { x: head.x, y: head.y - 1 }; break;
      case 'down': nextPos = { x: head.x, y: head.y + 1 }; break;
      case 'left': nextPos = { x: head.x - 1, y: head.y }; break;
      case 'right': nextPos = { x: head.x + 1, y: head.y }; break;
    }

    // Handle passthrough mode
    if (mode === 'passthrough') {
      if (nextPos.x < 0) nextPos.x = gridSize - 1;
      if (nextPos.x >= gridSize) nextPos.x = 0;
      if (nextPos.y < 0) nextPos.y = gridSize - 1;
      if (nextPos.y >= gridSize) nextPos.y = 0;
    }

    // Check if move is safe
    const hitsWall = mode === 'walls' && (
      nextPos.x < 0 || nextPos.x >= gridSize || nextPos.y < 0 || nextPos.y >= gridSize
    );
    const hitsBody = isPositionOnSnake(nextPos, snake.slice(0, -1));
    const isSafe = !hitsWall && !hitsBody;

    // Calculate distance to food
    const distanceToFood = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);

    return { move, nextPos, isSafe, distanceToFood };
  });

  // Prefer safe moves that get closer to food
  const safeMoves = moveResults.filter(r => r.isSafe);
  if (safeMoves.length === 0) {
    return direction; // No safe moves, continue current direction
  }

  // Add some randomness to make it more interesting
  if (Math.random() < 0.1) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)].move;
  }

  // Pick the move that gets closest to food
  safeMoves.sort((a, b) => a.distanceToFood - b.distanceToFood);
  return safeMoves[0].move;
}
