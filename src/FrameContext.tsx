import React, { createContext, useEffect, useState } from "react";

interface FrameContextValue {
  frame: number;
  play: () => void;
  stop: () => void;
  seek: (frame: number) => void;
  isPlaying: boolean;
  isEnded: boolean;
}

export const FrameContext = createContext<FrameContextValue | undefined>(
  undefined
);

interface FrameProviderProps {
  children: React.ReactNode;
  fps?: number;
  initialFrame?: number;
  durationInFrames?: number;
}

export const FrameProvider: React.FC<FrameProviderProps> = ({
  children,
  fps = 60,
  initialFrame = 0,
  durationInFrames,
}) => {
  const [frame, setFrame] = useState(initialFrame);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const play = () => setIsPlaying(true);
  const stop = () => setIsPlaying(false);
  const seek = (f: number) => {
    setFrame(f);
    if (durationInFrames !== undefined) {
      if (f < 0) {
        setIsPlaying(false);
        setIsEnded(false);
      } else if (f >= durationInFrames) {
        setIsPlaying(false);
        setIsEnded(true);
      } else {
        setIsPlaying(false);
        setIsEnded(false);
      }
    } else {
      setIsPlaying(false);
      setIsEnded(false);
    }
  };

  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;
    const tick = () => {
      if (!isPlaying) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const interval = 1000 / fps;
      if (now - lastTime >= interval) {
        setFrame((f) => {
          if (durationInFrames !== undefined && f + 1 > durationInFrames) {
            setIsPlaying(false);
            setIsEnded(true);
            return f;
          }
          return f + 1;
        });
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [fps, isPlaying, durationInFrames]);

  const contextValue: FrameContextValue = {
    frame,
    play,
    stop,
    seek,
    isPlaying,
    isEnded,
  };

  return (
    <FrameContext.Provider value={contextValue}>
      {children}
    </FrameContext.Provider>
  );
};
