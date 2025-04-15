import React from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Dino Runner</h1>
        <GameCanvas />
      </div>
    </div>
  );
}

export default App;