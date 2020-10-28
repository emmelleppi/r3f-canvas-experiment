import { createRef } from "react";
import create from "zustand";

export const animationRef = createRef();
export const useStore = create((set) => ({
  step: -1,
  increaseStep: () =>
    set((state) => ({ step: state.step === -1 ? 1 : state.step + 1 })),
  resetStep: () => set({ step: 0 }),
}));
