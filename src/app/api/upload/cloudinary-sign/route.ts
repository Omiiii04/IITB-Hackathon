// POST /api/upload/cloudinary-sign
//
// Issues a short-lived Cloudinary signed-upload token so the browser can upload
// images directly to Cloudinary without routing the binary through Next.js.
//
// Flow:
//   1. Client calls this endpoint (authenticated) to get { signature, timestamp, cloudName, apiKey, folder }.
//   2. Client posts the file + those params directly to Cloudinary's upload API.
//   3. Cloudinary validates the signature server-side and stores the asset.
//
// This keeps large binary payloads off your server and avoids Next.js body-size limits.

import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { folder?: string };
    const folder    = body?.folder ?? 'ecommerce';
    const timestamp = Math.round(Date.now() / 1000);
    const signature = generateUploadSignature(folder, timestamp);

    logger.info('Cloudinary upload signature issued', { folder });

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    logger.error('Failed to generate Cloudinary signature', { err });
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}

// GET kept for health-check / dashboard probing
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'cloudinary-sign' });
}
