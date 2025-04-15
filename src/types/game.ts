export type Vector2D = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type Sprite = {
  src: string;
  frames: number;
  frameWidth: number;
  frameHeight: number;
};

export interface GameObject {
  position: Vector2D;
  dimensions: Dimensions;
  velocity: Vector2D;
  sprite: Sprite;
}

export type GameState = 'IDLE' | 'PLAYING' | 'GAME_OVER';

export interface GameStore {
  state: GameState;
  score: number;
  highScore: number;
  setState: (state: GameState) => void;
  setScore: (score: number) => void;
  setHighScore: (score: number) => void;
  reset: () => void;
}