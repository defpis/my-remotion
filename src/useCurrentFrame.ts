import { useContext } from "react";
import { FrameContext } from "./FrameContext";

export const useCurrentFrame = () => {
  const ctx = useContext(FrameContext);
  if (!ctx) {
    throw new Error("useCurrentFrame must be used within a FrameProvider");
  }
  return ctx;
};
