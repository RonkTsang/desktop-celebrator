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
  const myConfettiRef = useRef<confetti.CreateTypes | null>(null);

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
        myConfettiRef.current = myConfetti; // Store the confetti instance

        // Register shortcuts
        const registerShortcuts = async () => {
          try {
            await unregisterAll(); // Clear previous shortcuts

            const currentShortcuts = settingsRef.current;

            await register(currentShortcuts.shortcutSmall, (event) => {
              if (event.state === "Pressed") {
                const options = getConfettiOptions(settingsRef.current);
                myConfettiRef.current?.({
                  ...options,
                  origin: { y: 0.6 },
                });
              }
            });
            await register(currentShortcuts.shortcutBig, (event) => {
              if (event.state === "Pressed") {
                const duration = 3000;
                const end = Date.now() + duration;
                (function frame() {
                  const currentSettings = settingsRef.current;
                  const options = getConfettiOptions(currentSettings);

                  myConfettiRef.current?.({
                    ...options,
                    particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)), // Scale down for continuous
                    angle: 60,
                    origin: { x: 0 },
                  });
                  myConfettiRef.current?.({
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
        };

        await registerShortcuts();

        const unlistenSmall = await listen('celebrate-small', () => {
          console.log('Received celebrate-small event');
          const options = getConfettiOptions(settingsRef.current);
          myConfettiRef.current?.({
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

            myConfettiRef.current?.({
              ...options,
              particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)),
              angle: 60,
              origin: { x: 0 },
            });
            myConfettiRef.current?.({
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

  // Re-register shortcuts when they change
  useEffect(() => {
    const reregisterShortcuts = async () => {
      if (!myConfettiRef.current) return; // Ensure confetti instance is available

      try {
        await unregisterAll();

        await register(settings.shortcutSmall, (event) => {
          if (event.state === "Pressed") {
            const options = getConfettiOptions(settingsRef.current);
            myConfettiRef.current?.({
              ...options,
              origin: { y: 0.6 },
            });
          }
        });

        await register(settings.shortcutBig, (event) => {
          if (event.state === "Pressed") {
            const duration = 3000;
            const end = Date.now() + duration;
            (function frame() {
              const currentSettings = settingsRef.current;
              const options = getConfettiOptions(currentSettings);

              myConfettiRef.current?.({
                ...options,
                particleCount: Math.max(2, Math.floor(currentSettings.particleCount / 50)),
                angle: 60,
                origin: { x: 0 },
              });
              myConfettiRef.current?.({
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
        console.error('Failed to re-register shortcuts:', error);
      }
    };

    reregisterShortcuts();

    // Cleanup function for this useEffect to unregister shortcuts when component unmounts
    // or when dependencies change before re-registering.
    return () => {
      unregisterAll().catch(console.error);
    };
  }, [settings.shortcutSmall, settings.shortcutBig, myConfettiRef]); // Add myConfettiRef to dependencies

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
