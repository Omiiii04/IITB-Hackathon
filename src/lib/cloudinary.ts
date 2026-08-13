// Cloudinary singleton — initialized once and reused across the request lifecycle.
//
// Guards:
// - Throws at module load time in non-build environments if credentials are
//   missing, so a misconfigured deployment fails loudly at startup.
// - During Next.js static build (SKIP_ENV_VALIDATION=1 / NEXT_PHASE=build)
//   we skip the throw so `next build` doesn't require runtime secrets.
//
// Usage:
//   import { cloudinary, uploadImage, deleteImage } from '@/lib/cloudinary';
//   const { url, publicId } = await uploadImage(buffer, 'ecommerce/products');

import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logger';

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.env.SKIP_ENV_VALIDATION === '1' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

function initCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    if (isBuildPhase) {
      logger.warn('Cloudinary: credentials not set during build phase, skipping config');
      return;
    }
    throw new Error(
      'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set'
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  logger.info('Cloudinary client initialized', { cloud: cloudName });
}

initCloudinary();

export { cloudinary };

// ─── Upload helper ────────────────────────────────────────────────────────────

export interface UploadResult {
  url:      string;   // secure HTTPS CDN URL
  publicId: string;   // Cloudinary public_id (needed for deletion / transforms)
  width?:   number;
  height?:  number;
  format?:  string;
  bytes?:   number;
}

/**
 * Upload a file Buffer or a base64-encoded data URI to Cloudinary.
 *
 * @param file    - Raw Buffer from `file.arrayBuffer()`, or a base64 data URI string.
 * @param folder  - Target Cloudinary folder (default: "ecommerce").
 * @param options - Any extra Cloudinary upload options (tags, transformation, etc.).
 */
export async function uploadImage(
  file: Buffer | string,
  folder = 'ecommerce',
  options: Record<string, unknown> = {}
): Promise<UploadResult> {
  const source =
    Buffer.isBuffer(file)
      ? `data:image/webp;base64,${file.toString('base64')}`
      : file;

  const result = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: 'auto',
    // Auto-select best quality and format (WebP/AVIF where supported)
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    ...options,
  });

  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    format:   result.format,
    bytes:    result.bytes,
  };
}

// ─── Delete helper ────────────────────────────────────────────────────────────

/**
 * Permanently delete an asset from Cloudinary by its public_id.
 * Safe to call with a stale / already-deleted ID — Cloudinary returns 'not found'
 * but does not throw; we log it instead of propagating.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== 'ok') {
    logger.warn('Cloudinary deleteImage: unexpected result', { publicId, result: result.result });
  }
}

// ─── Signed-upload helper (for client-side direct uploads) ───────────────────

/**
 * Generate a short-lived signature so the browser can upload directly to
 * Cloudinary without proxying the file through your Next.js server.
 * See: /api/upload/cloudinary-sign
 */
export function generateUploadSignature(
  folder: string,
  timestamp: number
): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error('CLOUDINARY_API_SECRET not set');
  return cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);
}
