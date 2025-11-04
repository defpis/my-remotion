import { FrameProvider } from "./FrameContext";

import { useCurrentFrame } from "./useCurrentFrame";

import "./App.css";
import {
  motion,
  useTransform,
  easeOut,
  useMotionValueEvent,
} from "motion/react";
import { useState } from "react";

interface AnimationProps {
  id: number;
  x: number;
  y: number;
  startMs: number;
  durationMs: number;
  bgColor: string;
}

const fps = 60;
const msPerFrame = 1000 / fps;

function Animation({ startMs, durationMs, bgColor, x, y }: AnimationProps) {
  const { frame } = useCurrentFrame();

  const currentMS = useTransform(frame, (v) => v * msPerFrame);

  const [visible, setVisible] = useState(frame.get() * msPerFrame >= startMs);

  const after = useTransform(currentMS, (v) => v >= startMs);
  useMotionValueEvent(after, "change", () => setVisible(true));

  const time = useTransform(currentMS, (v) => {
    if (v < startMs) return 0;
    if (v >= startMs + durationMs) return durationMs;
    return v - startMs;
  });

  const opacity = useTransform(time, [0, 250], [0, 1]);

  const transform = useTransform(
    time,
    [0, durationMs],
    ["translateY(100px)", "translateY(0px)"],
    { ease: easeOut }
  );

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: bgColor,
        opacity,
        transform,
        transition: "none",
      }}
    ></motion.div>
  );
}

const nodes = [
  { id: 1, x: 0, y: 0, startMs: 0, durationMs: 1000, bgColor: "red" },
  { id: 2, x: 100, y: 0, startMs: 500, durationMs: 1000, bgColor: "green" },
];

function FrameDemo() {
  const { frame, seek, play, stop, isPlaying, isEnded } = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          position: "relative",
          height: 180,
          width: 200,
          marginTop: 100,
        }}
      >
        {nodes.map((node) => (
          <Animation key={node.id} {...node} />
        ))}
      </div>

      <div style={{ width: 200, textAlign: "center" }}>
        当前帧: <motion.span>{frame}</motion.span>
      </div>

      <div>
        <button onClick={() => seek(0)}>重置到第 0 帧</button>
        <button disabled={isPlaying || isEnded} onClick={() => play()}>
          播放
        </button>
        <button disabled={!isPlaying} onClick={() => stop()}>
          停止
        </button>
        <button disabled={isPlaying} onClick={() => seek(frame.get() - 1)}>
          上一帧
        </button>
        <button disabled={isPlaying} onClick={() => seek(frame.get() + 1)}>
          下一帧
        </button>
      </div>
    </div>
  );
}

function getMaxFrameFromNodes(nodes: AnimationProps[]): number {
  const maxEndMs = Math.max(...nodes.map((n) => n.startMs + n.durationMs));
  return Math.ceil(maxEndMs / msPerFrame);
}

function App() {
  const durationInFrames = getMaxFrameFromNodes(nodes);

  return (
    <FrameProvider fps={fps} durationInFrames={durationInFrames}>
      <FrameDemo />
    </FrameProvider>
  );
}

export default App;
