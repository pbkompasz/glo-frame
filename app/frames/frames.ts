import { createFrames } from "frames.js/next";

export const frames = createFrames({
  basePath: "/frames",
  initialState: {
    randCount: 0,
    randomCharities: [] as any[],
  },
});
