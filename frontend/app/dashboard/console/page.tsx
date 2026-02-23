"use client";

import { useMotionStore } from "@/lib/hooks/use-store";
import { MotionClient } from "@/lib/api/client";

const FORMATS = ["BVH", "FBX", "GLTF"] as const;

export default function MotionConsolePage() {
  const {
    format,
    quality,
    fps,
    result,
    loading,
    setFormat,
    setQuality,
    setFps,
    setResult,
    setLoading,
  } = useMotionStore();

  async function handleCompress() {
    setLoading(true);
    setResult(null);
    try {
      const client = new MotionClient();
      const data = await client.compress({ format, quality, fps });
      setResult(data as unknown as Record<string, unknown>);
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRetarget() {
    setLoading(true);
    setResult(null);
    try {
      const client = new MotionClient();
      const data = await client.retarget({
        source_skeleton: "Mixamo",
        target_skeleton: "UE5_Mannequin",
      });
      setResult(data as unknown as Record<string, unknown>);
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Motion Console</h1>
          <p className="text-xs text-white/40 mt-0.5">
            ALICE Motion Cloud &mdash; Compression & Retargeting
          </p>
        </div>
        <span className="text-xs text-white/30">Core Engine :8082</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Parameters
          </h2>

          {/* Format selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    format === f
                      ? "bg-cyan-600 border-cyan-500 text-white"
                      : "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 flex justify-between">
              <span>Quality</span>
              <span className="text-white font-mono">{quality.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-white/25">
              <span>0.00 (max compression)</span>
              <span>1.00 (lossless)</span>
            </div>
          </div>

          {/* FPS input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50">FPS</label>
            <input
              type="number"
              min={1}
              max={240}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleCompress}
              disabled={loading}
              className="flex-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-3 text-sm font-semibold"
            >
              {loading ? "Processing..." : "Compress"}
            </button>
            <button
              onClick={handleRetarget}
              disabled={loading}
              className="flex-1 rounded-lg border border-cyan-600 hover:bg-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-3 text-sm font-semibold text-cyan-400"
            >
              {loading ? "Processing..." : "Retarget"}
            </button>
          </div>
        </section>

        {/* Result panel */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Result
          </h2>

          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-5 min-h-64 font-mono text-xs overflow-auto">
            {!result && !loading && (
              <p className="text-white/25 italic">
                Configure parameters and press Compress or Retarget.
              </p>
            )}
            {loading && (
              <p className="text-cyan-400 animate-pulse">Processing...</p>
            )}
            {result && (
              <pre className="text-emerald-300 whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>

          {result && Boolean(result.ok) && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Format",
                  value: (result.format as string | undefined) ?? "-",
                },
                {
                  label: "Ratio",
                  value: (result.ratio as number | undefined) != null
                    ? `${(((result.ratio as number | undefined) ?? 0) * 100).toFixed(1)}%`
                    : "-",
                },
                {
                  label: "Joints",
                  value: (result.joint_count as number | undefined)?.toLocaleString() ?? "-",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col gap-1"
                >
                  <span className="text-xs text-white/40">{stat.label}</span>
                  <span className="text-sm font-semibold font-mono">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
