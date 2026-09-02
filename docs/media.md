# Media Processing Pipeline

## Architecture Overview

Media processing is handled asynchronously to prevent blocking API threads and to handle large files efficiently. 
We use **S3-compatible Object Storage (MinIO)** for storage and **BullMQ** for the processing queue.

## 1. Upload Flow (Direct to S3)

To save backend bandwidth and CPU, files are uploaded directly from the client to MinIO using Presigned URLs.

1. **Client** requests upload URL: `POST /api/v1/media/upload-url { type: 'image', size, ext }`
2. **Backend** validates request, generates unique object key (e.g., `raw/uuid.jpg`), and creates a short-lived MinIO Presigned URL.
3. **Backend** returns URL to Client.
4. **Client** uploads file directly to MinIO using `PUT`.
5. **Client** calls backend: `POST /api/v1/media/confirm { objectKey }`
6. **Backend** adds job to `bull:media-processing` queue.

## 2. Processing Flow (Worker)

1. Worker picks up job from `bull:media-processing`.
2. Downloads `raw/uuid.jpg` from MinIO to local temp storage.
3. Depending on media type:

### Image Pipeline (Sharp)
- Strip EXIF metadata.
- Resize to max dimensions (e.g., 1080x1080).
- Convert to modern format (WebP / AVIF).
- Generate thumbnail (e.g., 250x250).
- Upload optimized versions to `processed/images/uuid.webp` and `processed/thumbnails/uuid.webp`.

### Video Pipeline (FFmpeg)
- Extract metadata (duration, resolution).
- Generate video thumbnail (first frame / 1s mark).
- Transcode to H.264/AAC or H.265 (if needed) for web compatibility.
- (Future) Generate HLS playlist for adaptive bitrate streaming.
- Upload variants to `processed/videos/...`

4. Worker deletes raw file from MinIO.
5. Worker fires `MediaProcessed` Kafka event.
6. PostService listens to event, updates post media URLs from `pending` to actual CDN URLs.

## 3. Storage Buckets

- `social-media-raw` (Private, temp storage, auto-delete policy)
- `social-media-public` (Public read, CDN attached)
  - `/avatars`
  - `/covers`
  - `/posts`
  - `/stories`
- `social-media-private` (Private read, requires signed URLs)
  - `/messages`

## 4. Security
- Max file size limits enforced during Presigned URL generation.
- Allowed MIME types strictly checked.
- ClamAV integration (future) for malware scanning on raw bucket.
