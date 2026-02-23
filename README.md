# ALICE Motion Cloud

Motion capture compression powered by Project A.L.I.C.E.

License: AGPL-3.0

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Next.js) | 3000 | UI console and landing page |
| API Gateway | 8080 | Reverse proxy / auth layer |
| Motion Engine (Rust/Axum) | 8082 | Core motion processing |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/motion/compress` | Compress motion capture data |
| POST | `/api/v1/motion/decompress` | Decompress motion data |
| POST | `/api/v1/motion/retarget` | Retarget motion between skeletons |
| GET | `/api/v1/motion/library` | List built-in motion clips |
| GET | `/health` | Engine health check |

## Motion Library

`walk`, `run`, `jump`, `idle`, `wave`, `crouch`, `dance`

## Supported Formats

| Format | Notes |
|--------|-------|
| BVH | Biovision Hierarchy — widely supported |
| FBX | Autodesk FBX — Maya / 3ds Max / Unity |
| GLTF | GL Transmission Format — web / real-time |

## Quick Start

```bash
# Run the Motion Engine
cd services/core-engine
cargo run --release

# Run the Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOTION_ADDR` | `0.0.0.0:8082` | Motion engine bind address |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API gateway URL for the frontend |

## License

AGPL-3.0 — Project A.L.I.C.E.
