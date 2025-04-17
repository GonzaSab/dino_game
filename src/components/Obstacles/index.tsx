import { GameObject } from '../../types/game';

const MIN_GAP = 500;
const GROUND_HEIGHT = 355;

// Define obstacle variants for both ground and aerial positions
const OBSTACLE_VARIANTS = {
  ground: [
    { width: 30, height: 60, type: 'ground' },
    { width: 50, height: 50, type: 'ground' },
    { width: 40, height: 70, type: 'ground' }
  ],
  aerial: [
    { width: 40, height: 40, type: 'aerial' },
    { width: 50, height: 30, type: 'aerial' }
  ]
};

export class Obstacle implements GameObject {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  velocity = { x: -5, y: 0 };
  type: 'ground' | 'aerial';
  sprite = {
    src: '/obs1.png',
    frames: 1,
    frameWidth: 1024,
    frameHeight: 1024
  };
  image: HTMLImageElement;
  imageLoaded = false;
  imageError = false;

  constructor(x: number, speed: number) {
    // Randomly choose between ground and aerial obstacles
    const isAerial = Math.random() > 0.6; // 40% chance for aerial obstacles
    const variants = isAerial ? OBSTACLE_VARIANTS.aerial : OBSTACLE_VARIANTS.ground;
    const variant = variants[Math.floor(Math.random() * variants.length)];

    this.dimensions = variant;
    this.type = variant.type;

    // Position the obstacle based on its type
    const y = this.type === 'aerial'
      ? GROUND_HEIGHT - variant.height - 50 // Position above ground
      : GROUND_HEIGHT - variant.height;      // Position on ground

    this.position = { x, y };
    this.velocity.x = speed;

    // Pre-load image
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
      console.log('Obstacle image loaded successfully');
    };
    this.image.onerror = (e) => {
      this.imageError = true;
      console.error('Failed to load obstacle image:', e);
    };
    this.image.src = this.sprite.src;
  }

  update(deltaTime: number) {
    this.position.x += this.velocity.x;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.imageLoaded || this.imageError) {
      // Draw a fallback rectangle if image fails to load
      ctx.fillStyle = '#535353';
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
      return;
    }

    // Draw the entire image, scaled to the desired dimensions
    ctx.drawImage(
      this.image,
      0,
      0,
      this.sprite.frameWidth,
      this.sprite.frameHeight,
      this.position.x,
      this.position.y,
      this.dimensions.width,
      this.dimensions.height
    );
  }
}

export class ObstacleManager {
  obstacles: Obstacle[] = [];
  lastObstacleX = 800;
  baseSpeed = -5;
  currentSpeed = -5;
  maxSpeed = -12;
  speedIncrement = -0.001;
  passedObstacles: Set<Obstacle> = new Set();

  reset() {
    this.obstacles = [];
    this.lastObstacleX = 800;
    this.currentSpeed = this.baseSpeed;
    this.passedObstacles.clear();
  }

  hasPassedObstacle(dino: GameObject): boolean {
    let passedNewObstacle = false;
    this.obstacles.forEach(obstacle => {
      // Check if obstacle is completely behind the dino and hasn't been counted yet
      if (!this.passedObstacles.has(obstacle) &&
        obstacle.position.x + obstacle.dimensions.width < dino.position.x + 10) {
        this.passedObstacles.add(obstacle);
        passedNewObstacle = true;
      }
    });
    return passedNewObstacle;
  }

  update(deltaTime: number) {
    // Increase speed over time
    this.currentSpeed = Math.max(this.maxSpeed, this.currentSpeed + this.speedIncrement * deltaTime);

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obstacle => obstacle.position.x > -100);

    // Update existing obstacles
    this.obstacles.forEach(obstacle => {
      obstacle.velocity.x = this.currentSpeed;
      obstacle.update(deltaTime);
    });

    // Add new obstacles with proper spacing
    if (this.obstacles.length === 0 ||
      this.lastObstacleX - this.obstacles[this.obstacles.length - 1].position.x >= MIN_GAP) {
      const newObstacle = new Obstacle(800, this.currentSpeed);
      this.obstacles.push(newObstacle);
      this.lastObstacleX = 800;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.obstacles.forEach(obstacle => obstacle.draw(ctx));
  }

  checkCollision(dino: GameObject): boolean {
    return this.obstacles.some(obstacle => {
      const dinoRight = dino.position.x + dino.dimensions.width - 10;
      const dinoLeft = dino.position.x + 10;
      const dinoBottom = dino.position.y + dino.dimensions.height - 5;
      const dinoTop = dino.position.y + 5;

      const obstacleRight = obstacle.position.x + obstacle.dimensions.width;
      const obstacleLeft = obstacle.position.x;
      const obstacleBottom = obstacle.position.y + obstacle.dimensions.height;
      const obstacleTop = obstacle.position.y;

      return !(
        dinoRight < obstacleLeft ||
        dinoLeft > obstacleRight ||
        dinoBottom < obstacleTop ||
        dinoTop > obstacleBottom
      );
    });
  }
}