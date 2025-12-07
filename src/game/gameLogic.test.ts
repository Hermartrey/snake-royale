import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  moveSnake,
  setDirection,
  isValidDirectionChange,
  isPositionOnSnake,
  generateFood,
  togglePause,
  restartGame,
  calculateAIMove,
  GRID_SIZE,
  INITIAL_SNAKE_LENGTH,
  type GameState,
  type Position,
} from './gameLogic';

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('creates a valid initial state for passthrough mode', () => {
      const state = createInitialState('passthrough');
      
      expect(state.snake).toHaveLength(INITIAL_SNAKE_LENGTH);
      expect(state.direction).toBe('right');
      expect(state.nextDirection).toBe('right');
      expect(state.score).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.mode).toBe('passthrough');
      expect(state.gridSize).toBe(GRID_SIZE);
    });

    it('creates a valid initial state for walls mode', () => {
      const state = createInitialState('walls');
      expect(state.mode).toBe('walls');
    });

    it('snake is positioned in the center', () => {
      const state = createInitialState('passthrough');
      const centerY = Math.floor(GRID_SIZE / 2);
      
      state.snake.forEach(segment => {
        expect(segment.y).toBe(centerY);
      });
    });

    it('food is not on the snake', () => {
      const state = createInitialState('passthrough');
      expect(isPositionOnSnake(state.food, state.snake)).toBe(false);
    });
  });

  describe('isPositionOnSnake', () => {
    it('returns true when position is on snake', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      expect(isPositionOnSnake({ x: 5, y: 5 }, snake)).toBe(true);
      expect(isPositionOnSnake({ x: 4, y: 5 }, snake)).toBe(true);
    });

    it('returns false when position is not on snake', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      expect(isPositionOnSnake({ x: 6, y: 5 }, snake)).toBe(false);
      expect(isPositionOnSnake({ x: 5, y: 6 }, snake)).toBe(false);
    });
  });

  describe('isValidDirectionChange', () => {
    it('allows perpendicular direction changes', () => {
      expect(isValidDirectionChange('right', 'up')).toBe(true);
      expect(isValidDirectionChange('right', 'down')).toBe(true);
      expect(isValidDirectionChange('up', 'left')).toBe(true);
      expect(isValidDirectionChange('up', 'right')).toBe(true);
    });

    it('prevents opposite direction changes', () => {
      expect(isValidDirectionChange('right', 'left')).toBe(false);
      expect(isValidDirectionChange('left', 'right')).toBe(false);
      expect(isValidDirectionChange('up', 'down')).toBe(false);
      expect(isValidDirectionChange('down', 'up')).toBe(false);
    });

    it('allows same direction', () => {
      expect(isValidDirectionChange('right', 'right')).toBe(true);
      expect(isValidDirectionChange('up', 'up')).toBe(true);
    });
  });

  describe('setDirection', () => {
    it('updates direction when valid', () => {
      const state = createInitialState('passthrough');
      const newState = setDirection(state, 'up');
      expect(newState.nextDirection).toBe('up');
    });

    it('does not update direction when invalid', () => {
      const state = createInitialState('passthrough'); // direction is 'right'
      const newState = setDirection(state, 'left');
      expect(newState.nextDirection).toBe('right');
    });
  });

  describe('moveSnake', () => {
    it('moves snake in the current direction', () => {
      const state = createInitialState('passthrough');
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);
      
      expect(newState.snake[0].x).toBe(initialHead.x + 1);
      expect(newState.snake[0].y).toBe(initialHead.y);
    });

    it('does not move when paused', () => {
      const state = createInitialState('passthrough');
      state.isPaused = true;
      const newState = moveSnake(state);
      expect(newState.snake).toEqual(state.snake);
    });

    it('does not move when game over', () => {
      const state = createInitialState('passthrough');
      state.isGameOver = true;
      const newState = moveSnake(state);
      expect(newState.snake).toEqual(state.snake);
    });

    it('wraps around in passthrough mode', () => {
      const state = createInitialState('passthrough');
      state.snake = [{ x: GRID_SIZE - 1, y: 5 }];
      state.direction = 'right';
      state.nextDirection = 'right';
      
      const newState = moveSnake(state);
      expect(newState.snake[0].x).toBe(0);
      expect(newState.isGameOver).toBe(false);
    });

    it('ends game on wall collision in walls mode', () => {
      const state = createInitialState('walls');
      state.snake = [{ x: GRID_SIZE - 1, y: 5 }];
      state.direction = 'right';
      state.nextDirection = 'right';
      
      const newState = moveSnake(state);
      expect(newState.isGameOver).toBe(true);
    });

    it('ends game on self collision', () => {
      const state = createInitialState('passthrough');
      // Create a snake that will collide with itself
      state.snake = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
      ];
      state.direction = 'up';
      state.nextDirection = 'up';
      
      const newState = moveSnake(state);
      expect(newState.isGameOver).toBe(true);
    });

    it('increases score when eating food', () => {
      const state = createInitialState('passthrough');
      state.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      state.food = { x: 6, y: 5 };
      state.direction = 'right';
      state.nextDirection = 'right';
      
      const newState = moveSnake(state);
      expect(newState.score).toBe(10);
    });

    it('grows snake when eating food', () => {
      const state = createInitialState('passthrough');
      const initialLength = state.snake.length;
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      
      const newState = moveSnake(state);
      expect(newState.snake.length).toBe(initialLength + 1);
    });

    it('generates new food after eating', () => {
      const state = createInitialState('passthrough');
      const initialFood = { ...state.food };
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      
      const newState = moveSnake(state);
      expect(newState.food).not.toEqual(initialFood);
    });
  });

  describe('generateFood', () => {
    it('generates food within grid bounds', () => {
      const snake: Position[] = [{ x: 5, y: 5 }];
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake, GRID_SIZE);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(GRID_SIZE);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(GRID_SIZE);
      }
    });

    it('does not generate food on snake', () => {
      const snake: Position[] = [];
      // Fill most of the grid with snake
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE - 1; y++) {
          snake.push({ x, y });
        }
      }
      
      for (let i = 0; i < 50; i++) {
        const food = generateFood(snake, GRID_SIZE);
        expect(isPositionOnSnake(food, snake)).toBe(false);
      }
    });
  });

  describe('togglePause', () => {
    it('toggles pause state', () => {
      const state = createInitialState('passthrough');
      expect(state.isPaused).toBe(false);
      
      const pausedState = togglePause(state);
      expect(pausedState.isPaused).toBe(true);
      
      const unpausedState = togglePause(pausedState);
      expect(unpausedState.isPaused).toBe(false);
    });

    it('does not toggle when game over', () => {
      const state = createInitialState('passthrough');
      state.isGameOver = true;
      state.isPaused = false;
      
      const result = togglePause(state);
      expect(result.isPaused).toBe(false);
    });
  });

  describe('restartGame', () => {
    it('creates fresh game state', () => {
      const state = createInitialState('passthrough');
      state.score = 100;
      state.isGameOver = true;
      
      const newState = restartGame('passthrough');
      expect(newState.score).toBe(0);
      expect(newState.isGameOver).toBe(false);
      expect(newState.snake.length).toBe(INITIAL_SNAKE_LENGTH);
    });

    it('respects mode parameter', () => {
      const state = restartGame('walls');
      expect(state.mode).toBe('walls');
    });
  });

  describe('calculateAIMove', () => {
    it('returns a valid direction', () => {
      const state = createInitialState('passthrough');
      const move = calculateAIMove(state);
      expect(['up', 'down', 'left', 'right']).toContain(move);
    });

    it('does not return opposite direction', () => {
      const state = createInitialState('passthrough');
      state.direction = 'right';
      
      for (let i = 0; i < 20; i++) {
        const move = calculateAIMove(state);
        expect(move).not.toBe('left');
      }
    });

    it('avoids walls in walls mode', () => {
      const state = createInitialState('walls');
      state.snake = [{ x: 0, y: 5 }];
      state.direction = 'up';
      
      for (let i = 0; i < 20; i++) {
        const move = calculateAIMove(state);
        // Should not go left into the wall
        expect(move).not.toBe('left');
      }
    });
  });
});
