import React, { useRef, useEffect, useState } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useGameState } from '../../hooks/useGameState';
import { DinoCharacter } from '../Dino';
import { ObstacleManager } from '../Obstacles';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, setState, score, setScore, highScore, setHighScore, reset } = useGameState();
  const [dino] = useState(() => new DinoCharacter());
  const [obstacleManager] = useState(() => new ObstacleManager());

  const resetGame = () => {
    dino.reset();
    obstacleManager.reset();
    reset();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp')) {
        if (state === 'IDLE') {
          setState('PLAYING');
        } else if (state === 'PLAYING') {
          dino.jump();
        } else if (state === 'GAME_OVER') {
          resetGame();
          setState('PLAYING');
        }
      } else if (e.code === 'ArrowDown') {
        dino.duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        dino.duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, setState, dino, reset]);

  useGameLoop((deltaTime) => {
    if (state !== 'PLAYING') return;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(CANVAS_WIDTH, 350);
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Update and draw game objects
    dino.update(deltaTime);
    obstacleManager.update(deltaTime);
    
    dino.draw(ctx);
    obstacleManager.draw(ctx);
    
    // Check collisions
    if (obstacleManager.checkCollision(dino)) {
      setState('GAME_OVER');
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }
    
    // Update score
    setScore(score + Math.floor(deltaTime / 100));
  });

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full border border-gray-200 bg-white"
      />
      {state === 'IDLE' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setState('PLAYING')}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Press Space to Start
          </button>
        </div>
      )}
      {state === 'GAME_OVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-2">Score: {score}</p>
            <p className="text-xl mb-4">High Score: {highScore}</p>
            <button
              onClick={() => {
                resetGame();
                setState('PLAYING');
              }}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Press Space to Restart
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 text-xl font-mono">
        Score: {score}
      </div>
    </div>
  );
};