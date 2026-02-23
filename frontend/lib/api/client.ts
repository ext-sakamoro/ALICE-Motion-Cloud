const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface CompressRequest {
  format: string;
  quality: number;
  fps: number;
}

export interface CompressResponse {
  ok: boolean;
  format: string;
  quality: number;
  fps: number;
  original_bytes: number;
  compressed_bytes: number;
  ratio: number;
  message: string;
}

export interface DecompressRequest {
  format: string;
}

export interface DecompressResponse {
  ok: boolean;
  format: string;
  frames_decoded: number;
  duration_secs: number;
  message: string;
}

export interface RetargetRequest {
  source_skeleton: string;
  target_skeleton: string;
}

export interface JointMapping {
  source_joint: string;
  target_joint: string;
  confidence: number;
}

export interface RetargetResponse {
  ok: boolean;
  source_skeleton: string;
  target_skeleton: string;
  joint_count: number;
  mappings: JointMapping[];
  message: string;
}

export interface MotionClip {
  id: string;
  name: string;
  category: string;
  duration_secs: number;
  fps: number;
  joint_count: number;
}

export interface LibraryResponse {
  ok: boolean;
  clips: MotionClip[];
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export class MotionClient {
  private readonly base: string;

  constructor(base?: string) {
    this.base = base ?? BASE_URL;
  }

  compress(body: CompressRequest): Promise<CompressResponse> {
    return request<CompressResponse>("/api/v1/motion/compress", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  decompress(body: DecompressRequest): Promise<DecompressResponse> {
    return request<DecompressResponse>("/api/v1/motion/decompress", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  retarget(body: RetargetRequest): Promise<RetargetResponse> {
    return request<RetargetResponse>("/api/v1/motion/retarget", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  library(): Promise<LibraryResponse> {
    return request<LibraryResponse>("/api/v1/motion/library");
  }
}
