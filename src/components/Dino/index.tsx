import React from 'react';
import { GameObject } from '../../types/game';

const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const GROUND_HEIGHT = 290;
const STANDING_HEIGHT = 70;
const DUCKING_HEIGHT = 35;

export class DinoCharacter implements GameObject {
  position = { x: 50, y: GROUND_HEIGHT };
  dimensions = { width: 60, height: STANDING_HEIGHT };
  velocity = { x: 0, y: 0 };
  sprite = {
    src: '/dino.png',
    frames: 1,
    frameWidth: 1024,
    frameHeight: 1024
  };
  
  isJumping = false;
  isDucking = false;
  currentFrame = 0;
  frameCounter = 0;
  image: HTMLImageElement;
  imageLoaded = false;
  imageError = false;

  constructor() {
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
      console.log('Dino image loaded successfully');
    };
    this.image.onerror = (e) => {
      this.imageError = true;
      console.error('Failed to load dino image:', e);
    };
    this.image.src = this.sprite.src;
  }

  reset() {
    this.position = { x: 50, y: GROUND_HEIGHT };
    this.velocity = { x: 0, y: 0 };
    this.isJumping = false;
    this.isDucking = false;
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.dimensions.height = STANDING_HEIGHT;
  }

  update(deltaTime: number) {
    // Apply gravity when jumping
    if (this.position.y < GROUND_HEIGHT) {
      this.velocity.y += GRAVITY;
    }

    // Update position
    this.position.y += this.velocity.y;

    // Ground collision
    if (this.position.y > GROUND_HEIGHT) {
      this.position.y = GROUND_HEIGHT;
      this.velocity.y = 0;
      this.isJumping = false;
    }

    // Update dimensions based on ducking state
    const targetHeight = this.isDucking ? DUCKING_HEIGHT : STANDING_HEIGHT;
    this.dimensions.height = targetHeight;

    // Adjust Y position to keep feet at ground level
    const currentY = this.position.y + this.dimensions.height;
    this.position.y = GROUND_HEIGHT + (STANDING_HEIGHT - this.dimensions.height);
  }

  jump() {
    if (!this.isJumping && !this.isDucking) {
      this.velocity.y = JUMP_FORCE;
      this.isJumping = true;
    }
  }

  duck(isDucking: boolean) {
    if (!this.isJumping) {
      this.isDucking = isDucking;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.imageLoaded || this.imageError) {
      ctx.fillStyle = '#535353';
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.dimensions.width,
        this.dimensions.height
      );
      return;
    }
    
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