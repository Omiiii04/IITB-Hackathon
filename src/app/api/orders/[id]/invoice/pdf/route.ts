import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import { generateInvoicePdf, OrderNotFoundError } from '@/modules/invoicing/invoice.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(request);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  try {
    const pdfBuffer = await generateInvoicePdf(id, auth.userId);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    throw err;
  }
}