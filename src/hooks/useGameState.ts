import { create } from 'zustand';
import { GameStore } from '../types/game';

export const useGameState = create<GameStore>((set) => ({
  state: 'IDLE',
  score: 0,
  highScore: 0,
  setState: (state) => set({ state }),
  setScore: (score) => set({ score }),
  setHighScore: (highScore) => set({ highScore }),
  reset: () => set({ state: 'IDLE', score: 0 }),
}));