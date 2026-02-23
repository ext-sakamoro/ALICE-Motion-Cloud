use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, sync::Arc, time::Instant};
use tracing::info;
use tracing_subscriber::EnvFilter;

// ── State ─────────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    start_time: Instant,
}

// ── Request / Response types ──────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct CompressRequest {
    format: String,
    quality: f64,
    fps: u32,
}

#[derive(Debug, Serialize)]
struct CompressResponse {
    ok: bool,
    format: String,
    quality: f64,
    fps: u32,
    original_bytes: usize,
    compressed_bytes: usize,
    ratio: f64,
    message: String,
}

#[derive(Debug, Deserialize)]
struct DecompressRequest {
    format: String,
}

#[derive(Debug, Serialize)]
struct DecompressResponse {
    ok: bool,
    format: String,
    frames_decoded: u64,
    duration_secs: f64,
    message: String,
}

#[derive(Debug, Deserialize)]
struct RetargetRequest {
    source_skeleton: String,
    target_skeleton: String,
}

#[derive(Debug, Serialize)]
struct JointMapping {
    source_joint: String,
    target_joint: String,
    confidence: f64,
}

#[derive(Debug, Serialize)]
struct RetargetResponse {
    ok: bool,
    source_skeleton: String,
    target_skeleton: String,
    joint_count: usize,
    mappings: Vec<JointMapping>,
    message: String,
}

#[derive(Debug, Serialize)]
struct MotionClip {
    id: String,
    name: String,
    category: String,
    duration_secs: f64,
    fps: u32,
    joint_count: usize,
}

#[derive(Debug, Serialize)]
struct LibraryResponse {
    ok: bool,
    clips: Vec<MotionClip>,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async fn handle_compress(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<CompressRequest>,
) -> Result<Json<CompressResponse>, StatusCode> {
    info!(
        format = %req.format,
        quality = req.quality,
        fps = req.fps,
        "compress request"
    );

    // Compression ratio based on format and quality
    let base_ratio: f64 = match req.format.to_uppercase().as_str() {
        "BVH" => 0.45,
        "FBX" => 0.38,
        "GLTF" | "GLB" => 0.30,
        _ => 0.50,
    };
    let quality_factor = req.quality.clamp(0.0, 1.0);
    let ratio = base_ratio + (1.0 - base_ratio) * quality_factor;

    let original_bytes: usize = 1_024 * 1_024 * 10; // 10 MB placeholder
    let compressed_bytes = (original_bytes as f64 * ratio) as usize;

    Ok(Json(CompressResponse {
        ok: true,
        format: req.format.clone(),
        quality: req.quality,
        fps: req.fps,
        original_bytes,
        compressed_bytes,
        ratio,
        message: format!(
            "Compressed {} at quality {:.2}, {} fps — {:.1}% of original size",
            req.format,
            req.quality,
            req.fps,
            ratio * 100.0
        ),
    }))
}

async fn handle_decompress(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<DecompressRequest>,
) -> Result<Json<DecompressResponse>, StatusCode> {
    info!(format = %req.format, "decompress request");

    let (frames_decoded, duration_secs): (u64, f64) = match req.format.to_uppercase().as_str() {
        "BVH" => (3600, 120.0),
        "FBX" => (7200, 240.0),
        "GLTF" | "GLB" => (1800, 60.0),
        _ => (1000, 33.3),
    };

    Ok(Json(DecompressResponse {
        ok: true,
        format: req.format.clone(),
        frames_decoded,
        duration_secs,
        message: format!(
            "Decoded {} frames ({:.1} s) from {} stream",
            frames_decoded, duration_secs, req.format
        ),
    }))
}

async fn handle_retarget(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<RetargetRequest>,
) -> Result<Json<RetargetResponse>, StatusCode> {
    info!(
        source = %req.source_skeleton,
        target = %req.target_skeleton,
        "retarget request"
    );

    // Placeholder joint mappings for common skeleton pairs
    let joint_names = [
        ("Hips", "pelvis"),
        ("Spine", "spine_01"),
        ("Spine1", "spine_02"),
        ("Spine2", "spine_03"),
        ("LeftArm", "upperarm_l"),
        ("LeftForeArm", "lowerarm_l"),
        ("LeftHand", "hand_l"),
        ("RightArm", "upperarm_r"),
        ("RightForeArm", "lowerarm_r"),
        ("RightHand", "hand_r"),
        ("LeftUpLeg", "thigh_l"),
        ("LeftLeg", "calf_l"),
        ("LeftFoot", "foot_l"),
        ("RightUpLeg", "thigh_r"),
        ("RightLeg", "calf_r"),
        ("RightFoot", "foot_r"),
    ];

    let mappings: Vec<JointMapping> = joint_names
        .iter()
        .map(|(src, tgt)| JointMapping {
            source_joint: src.to_string(),
            target_joint: tgt.to_string(),
            confidence: 0.95,
        })
        .collect();

    let joint_count = mappings.len();

    Ok(Json(RetargetResponse {
        ok: true,
        source_skeleton: req.source_skeleton.clone(),
        target_skeleton: req.target_skeleton.clone(),
        joint_count,
        mappings,
        message: format!(
            "Retargeted {} -> {}: {} joints mapped",
            req.source_skeleton, req.target_skeleton, joint_count
        ),
    }))
}

async fn handle_library(State(_state): State<Arc<AppState>>) -> Json<LibraryResponse> {
    let clips = vec![
        MotionClip {
            id: "walk".into(),
            name: "Walk Cycle".into(),
            category: "Locomotion".into(),
            duration_secs: 1.2,
            fps: 30,
            joint_count: 65,
        },
        MotionClip {
            id: "run".into(),
            name: "Run Cycle".into(),
            category: "Locomotion".into(),
            duration_secs: 0.8,
            fps: 60,
            joint_count: 65,
        },
        MotionClip {
            id: "jump".into(),
            name: "Jump".into(),
            category: "Locomotion".into(),
            duration_secs: 1.5,
            fps: 30,
            joint_count: 65,
        },
        MotionClip {
            id: "idle".into(),
            name: "Idle".into(),
            category: "Locomotion".into(),
            duration_secs: 3.0,
            fps: 30,
            joint_count: 65,
        },
        MotionClip {
            id: "wave".into(),
            name: "Wave".into(),
            category: "Gesture".into(),
            duration_secs: 2.0,
            fps: 30,
            joint_count: 65,
        },
        MotionClip {
            id: "crouch".into(),
            name: "Crouch".into(),
            category: "Locomotion".into(),
            duration_secs: 0.6,
            fps: 30,
            joint_count: 65,
        },
        MotionClip {
            id: "dance".into(),
            name: "Dance".into(),
            category: "Emote".into(),
            duration_secs: 8.0,
            fps: 60,
            joint_count: 65,
        },
    ];

    Json(LibraryResponse { ok: true, clips })
}

async fn handle_health(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        uptime_secs: state.start_time.elapsed().as_secs(),
    })
}

// ── Main ──────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("motion_engine=info")),
        )
        .init();

    let state = Arc::new(AppState {
        start_time: Instant::now(),
    });

    let app = Router::new()
        .route("/health", get(handle_health))
        .route("/api/v1/motion/compress", post(handle_compress))
        .route("/api/v1/motion/decompress", post(handle_decompress))
        .route("/api/v1/motion/retarget", post(handle_retarget))
        .route("/api/v1/motion/library", get(handle_library))
        .with_state(state);

    let addr_str = std::env::var("MOTION_ADDR").unwrap_or_else(|_| "0.0.0.0:8082".into());
    let addr: SocketAddr = addr_str.parse().expect("invalid MOTION_ADDR");

    info!("ALICE Motion Engine listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind failed");
    axum::serve(listener, app).await.expect("server error");
}
