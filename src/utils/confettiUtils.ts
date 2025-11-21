import confetti from 'canvas-confetti';

export const createEmojiShape = (emoji: string): confetti.Shape => {
  return confetti.shapeFromText({ text: emoji, scalar: 2 });
};

export const getConfettiOptions = (settings: any): confetti.Options => {
  const shapes: any[] = [];

  if (settings.useEmojis && settings.emojis.length > 0) {
    settings.emojis.forEach((emoji: string) => {
      shapes.push(confetti.shapeFromText({ text: emoji, scalar: 2 }));
    });
  }

  if (!settings.useEmojis || settings.shapes.length > 0) {
    if (settings.shapes && settings.shapes.length > 0) {
      shapes.push(...settings.shapes);
    }
  }

  return {
    particleCount: settings.particleCount,
    spread: settings.spread,
    startVelocity: settings.startVelocity,
    scalar: settings.scalar,
    colors: settings.colors,
    shapes: shapes as confetti.Shape[], // Cast to satisfy TS, library supports mixing strings and objects
    disableForReducedMotion: true,
  };
};
