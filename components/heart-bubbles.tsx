'use client'; // Ensures this runs only on the client

import { useEffect, useRef } from 'react';

type MouseType = {
  x?: number;
  y?: number;
};

const HeartBubbles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w: number, h: number;
    let bubbles: Bubble[] = [];
    const bubbleCount = 28;
    const bubbleChance = 0.2;

    const mouse: MouseType = { x: undefined, y: undefined };

    function resizeReset() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function mousemove(e: MouseEvent) {
      mouse.x = e.x;
      mouse.y = e.y;
    }

    function mouseout() {
      mouse.x = undefined;
      mouse.y = undefined;
    }

    function animationLoop() {
      if (bubbles.length < bubbleCount && Math.random() < bubbleChance) {
        bubbles.push(new Bubble());
      }
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = 'lighter';

      collisionDetect();
      drawScene();
      arrayCleanup();
      requestAnimationFrame(animationLoop);
    }

    function drawScene() {
      bubbles.forEach((bubble) => {
        bubble.update();
        bubble.draw();
      });
    }

    function arrayCleanup() {
      bubbles = bubbles.filter((bubble) => !bubble.destroyed);
    }

    function getRandomInt(min: number, max: number) {
      return Math.round(Math.random() * (max - min)) + min;
    }

    function easeOutQuad(x: number) {
      return 1 - (1 - x) * (1 - x);
    }

    function easeInOutSine(x: number) {
      return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    class Bubble {
      bottom: number;
      x: number;
      y: number;
      size: number;
      sizeMax: number;
      targetY: number;
      tick: number;
      burstedTick: number;
      sizeTick: number;
      moveTick: number;
      burstTick: number;
      bursted: boolean;
      destroyed: boolean;

      constructor() {
        this.bottom = h - 20;
        this.x = Math.random() * w;
        this.y = this.bottom;
        this.size = 0;
        this.sizeMax = getRandomInt(15, 40);
        this.targetY = this.sizeMax;
        this.tick = 0;
        this.burstedTick = 0;
        this.sizeTick = 80; // Slower expansion
        this.moveTick = 800; // Slower movement
        this.burstTick = 80;
        this.bursted = false;
        this.destroyed = false;
      }

      draw() {
        if (!this.bursted) {
          ctx!.save();
          ctx!.beginPath();

          const topCurveHeight = this.size * 0.75;
          const widthFactor = this.size * 0.8;

          ctx!.moveTo(this.x, this.y + this.size / 2);
          ctx!.bezierCurveTo(
            this.x - widthFactor,
            this.y + this.size / 3,
            this.x - widthFactor * 1.3,
            this.y - topCurveHeight * 0.8,
            this.x,
            this.y - this.size / 5
          );

          ctx!.bezierCurveTo(
            this.x + widthFactor * 1.3,
            this.y - topCurveHeight * 0.8,
            this.x + widthFactor,
            this.y + this.size / 3,
            this.x,
            this.y + this.size / 2
          );

          ctx!.fillStyle = 'hsla(356, 100%, 50%, 0.5)';
          ctx!.fill();
          ctx!.closePath();
          ctx!.restore();
        } else {
          ctx!.beginPath();
          for (let a = 0; a < 10; a++) {
            const angle = 36 * a;
            const radian = (Math.PI / 180) * angle;
            const s = 10 + this.burstedTick * 1;
            const e = 20 + this.burstedTick * 0.5;
            ctx!.moveTo(
              this.x + s * Math.sin(radian),
              this.y + s * Math.cos(radian)
            );
            ctx!.lineTo(
              this.x + e * Math.sin(radian),
              this.y + e * Math.cos(radian)
            );
          }
          ctx!.strokeStyle = 'hsla(339.68, 88.06%, 38.82%, 1)';
          ctx!.stroke();
          ctx!.closePath();
        }
      }

      update() {
        if (this.bursted) {
          this.burstUpdate();
        } else if (this.size < this.sizeMax) {
          this.sizeUpdate();
        } else if (this.y > this.targetY) {
          this.moveUpdate();
        } else if (
          this.tick ===
          this.sizeTick + this.moveTick + this.burstTick
        ) {
          this.bursted = true;
        }
        this.tick++;
      }

      sizeUpdate() {
        const progress = 1 - (this.sizeTick - this.tick) / this.sizeTick;
        this.size = this.sizeMax * easeOutQuad(progress);
      }

      moveUpdate() {
        const progress =
          1 - (this.moveTick - (this.tick - this.sizeTick)) / this.moveTick;
        this.y =
          this.bottom - (this.bottom - this.targetY) * easeInOutSine(progress);
      }

      burstUpdate() {
        this.burstedTick++;
        if (this.burstedTick > 15) {
          this.destroyed = true;
        }
      }
    }

    function collisionDetect() {
      bubbles.forEach((bubble) => {
        if (mouse.x === undefined || mouse.y === undefined) return;
        const dx = bubble.x - mouse.x;
        const dy = bubble.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bubble.size + 20) {
          bubble.bursted = true;
        }
      });
    }

    // Initialize
    resizeReset();
    animationLoop();

    // Event Listeners
    window.addEventListener('resize', resizeReset);
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseout', mouseout);

    return () => {
      window.removeEventListener('resize', resizeReset);
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseout', mouseout);
    };
  }, []);

  return <canvas id='canvas' ref={canvasRef} />;
};

export default HeartBubbles;
