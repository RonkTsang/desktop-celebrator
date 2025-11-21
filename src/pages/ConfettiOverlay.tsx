import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { useSettings } from '../hooks/useSettings';
import { getConfettiOptions } from '../utils/confettiUtils';

const ConfettiOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();
  const settingsRef = useRef(settings);

  // Keep settingsRef in sync with settings state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
              const options = getConfettiOptions(settingsRef.current);
              myConfetti({
                ...options,
                origin: { y: 0.6 },
              });
            }
          });
          await register('Alt+Shift+C', (event) => {
            if (event.state === "Pressed") {
              const duration = 3000;
              const end = Date.now() + duration;
              (function frame() {
                const currentSettings = settingsRef.current;
                const options = getConfettiOptions(currentSettings);

                myConfetti({
                  ...options,
                  particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)), // Scale down for continuous
                  angle: 60,
                  origin: { x: 0 },
                });
                myConfetti({
                  ...options,
                  particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)),
                  angle: 120,
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
          const options = getConfettiOptions(settingsRef.current);
          myConfetti({
            ...options,
            origin: { y: 0.6 },
          });
        });

        const unlistenBig = await listen('celebrate-big', () => {
          const duration = 3000;
          const end = Date.now() + duration;

          (function frame() {
            const currentSettings = settingsRef.current;
            const options = getConfettiOptions(currentSettings);

            myConfetti({
              ...options,
              particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)),
              angle: 60,
              origin: { x: 0 },
            });
            myConfetti({
              ...options,
              particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)),
              angle: 120,
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
