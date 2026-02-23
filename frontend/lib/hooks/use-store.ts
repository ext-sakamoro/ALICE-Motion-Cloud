"use client";

import { useState, useCallback } from "react";

export interface MotionState {
  format: string;
  quality: number;
  fps: number;
  result: Record<string, unknown> | null;
  loading: boolean;
}

export interface MotionActions {
  setFormat: (format: string) => void;
  setQuality: (quality: number) => void;
  setFps: (fps: number) => void;
  setResult: (result: Record<string, unknown> | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export type UseMotionStore = MotionState & MotionActions;

const DEFAULT_STATE: MotionState = {
  format: "BVH",
  quality: 0.8,
  fps: 30,
  result: null,
  loading: false,
};

export function useMotionStore(): UseMotionStore {
  const [state, setState] = useState<MotionState>(DEFAULT_STATE);

  const setFormat = useCallback((format: string) => {
    setState((s) => ({ ...s, format }));
  }, []);

  const setQuality = useCallback((quality: number) => {
    setState((s) => ({ ...s, quality }));
  }, []);

  const setFps = useCallback((fps: number) => {
    setState((s) => ({ ...s, fps }));
  }, []);

  const setResult = useCallback((result: Record<string, unknown> | null) => {
    setState((s) => ({ ...s, result }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((s) => ({ ...s, loading }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    ...state,
    setFormat,
    setQuality,
    setFps,
    setResult,
    setLoading,
    reset,
  };
}
