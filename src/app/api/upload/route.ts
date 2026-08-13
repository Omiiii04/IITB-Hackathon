// POST /api/upload/route.ts
//
// Server-side upload endpoint: accepts a multipart/form-data POST with a
// `file` field and an optional `folder` field, then proxies the binary to
// Cloudinary via the server SDK.
//
// Use this when:
//   - You need server-side validation / auth before upload
//   - Files are small (< 4 MB) and you don't want client-side signed uploads
//
// For large files (product images, banners), prefer /api/upload/cloudinary-sign
// so the browser uploads directly to Cloudinary.

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file   = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'ecommerce';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds max allowed size of ${MAX_SIZE_BYTES / (1024 * 1024)} MB` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);

    logger.info('File uploaded to Cloudinary', {
      folder,
      publicId: result.publicId,
      bytes: result.bytes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    logger.error('Cloudinary upload failed', { err });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
