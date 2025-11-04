import { FrameProvider } from "./FrameContext";
import { useCurrentFrame } from "./useCurrentFrame";

import "./App.css";

interface AnimationProps {
  id: number;
  x: number;
  y: number;
  startMs: number;
  durationMs: number;
  bgColor: string;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2);
}

function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: { ease?: (t: number) => number }
) {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  let t = (input - inMin) / (inMax - inMin);
  t = Math.max(0, Math.min(1, t));
  if (options?.ease) t = options.ease(t);
  return outMin + (outMax - outMin) * t;
}

function Animation({ startMs, durationMs, bgColor, x }: AnimationProps) {
  const { frame } = useCurrentFrame();
  const msPerFrame = 1000 / 60;
  const currentMs = frame * msPerFrame;
  const before = currentMs < startMs;
  const after = currentMs >= startMs + durationMs;
  if (before) return null;

  // 动画时间插值
  const time = after ? durationMs : currentMs - startMs;
  const opacity = interpolate(time, [0, 250], [0, 1]);
  const translateY = interpolate(time, [0, durationMs], [100, 0], {
    ease: easeOut,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: bgColor,
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: "none",
      }}
    ></div>
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
      <p>{JSON.stringify(nodes, null, 2)}</p>

      <div style={{ position: "relative", height: 180, width: 200 }}>
        {nodes.map((node) => (
          <Animation key={node.id} {...node} />
        ))}
      </div>

      <div style={{ width: 200, textAlign: "center" }}>当前帧: {frame}</div>

      <div>
        <button onClick={() => seek(0)}>重置到第 0 帧</button>
        <button disabled={isPlaying || isEnded} onClick={() => play()}>
          播放
        </button>
        <button disabled={!isPlaying} onClick={() => stop()}>
          停止
        </button>
        <button disabled={isPlaying} onClick={() => seek(frame - 1)}>
          上一帧
        </button>
        <button disabled={isPlaying} onClick={() => seek(frame + 1)}>
          下一帧
        </button>
      </div>
    </div>
  );
}

function getMaxFrameFromNodes(
  nodes: AnimationProps[],
  fps: number = 60
): number {
  // 计算所有节点的结束时间（ms），取最大值
  const maxEndMs = Math.max(...nodes.map((n) => n.startMs + n.durationMs));
  // 转换为帧数
  return Math.ceil(maxEndMs / (1000 / fps));
}

function App() {
  const fps = 60;
  const durationInFrames = getMaxFrameFromNodes(nodes, fps);
  console.log("计算得到的总帧数:", durationInFrames);

  return (
    <FrameProvider fps={fps} durationInFrames={durationInFrames}>
      <FrameDemo />
    </FrameProvider>
  );
}

export default App;
