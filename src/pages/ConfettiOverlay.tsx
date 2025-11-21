import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';

const ConfettiOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('ConfettiOverlay mounted');
    // Set ignore cursor events on mount
    invoke('set_ignore_cursor_events', { ignore: true }).catch(console.error);

    const setupConfetti = async () => {
      if (canvasRef.current) {
        const myConfetti = confetti.create(canvasRef.current, {
          resize: true,
          useWorker: true,
        });

        // Register shortcuts
        try {
          await unregisterAll(); // Clear previous shortcuts
          await register('Alt+C', (event) => {
            if (event.state === "Pressed") {
              myConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            }
          });
          await register('Alt+Shift+C', (event) => {
            if (event.state === "Pressed") {
              const duration = 3000;
              const end = Date.now() + duration;
              (function frame() {
                myConfetti({
                  particleCount: 2,
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                });
                myConfetti({
                  particleCount: 2,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                });
                if (Date.now() < end) {
                  requestAnimationFrame(frame);
                }
              })();
            }
          });
        } catch (error) {
          console.error('Failed to register shortcuts:', error);
        }

        const unlistenSmall = await listen('celebrate-small', () => {
          console.log('Received celebrate-small event');
          myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        });

        const unlistenBig = await listen('celebrate-big', () => {
          const duration = 3000;
          const end = Date.now() + duration;

          (function frame() {
            myConfetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            });
            myConfetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
        });

        return () => {
          unlistenSmall();
          unlistenBig();
        };
      }
    };

    const cleanupPromise = setupConfetti();

    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default ConfettiOverlay;
