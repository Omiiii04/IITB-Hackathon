'use client';

import React, { useState } from 'react';
import { Download, Loader2, FileText, AlertCircle } from 'lucide-react';

export interface InvoiceButtonProps {
  orderId: string;
  orderNumber?: string | null;
  className?: string;
}

export function InvoiceButton({ orderId, className = '' }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`);
      if (!res.ok) {
        throw new Error('Failed to generate invoice');
      }

      const invoiceData = await res.json();

      // Construct a clean, printable HTML window for the invoice
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups to view invoice.');
      }

      const itemsHtml = (invoiceData.items || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.productTitle}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.storeName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${item.totalPrice.toLocaleString('en-IN')}</td>
          </tr>
        `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
            .title { font-size: 20px; font-weight: 700; text-align: right; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .totals { width: 300px; margin-left: auto; margin-bottom: 30px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
            .totals-row.grand { font-size: 18px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">FlexHub</div>
            <div class="title">
              TAX INVOICE<br/>
              <span style="font-size: 13px; font-weight: normal; color: #64748b;">${invoiceData.invoiceNumber}</span>
            </div>
          </div>
          <div class="meta">
            <div class="box">
              <strong>Billed & Shipped To:</strong><br/>
              ${invoiceData.customerName}<br/>
              ${invoiceData.customerEmail}<br/>
              ${invoiceData.shippingAddress?.line1 ?? ''}, ${invoiceData.shippingAddress?.city ?? ''} - ${invoiceData.shippingAddress?.postalCode ?? ''}
            </div>
            <div class="box" style="text-align: right;">
              <strong>Order Details:</strong><br/>
              Order #: ${invoiceData.orderNumber ?? invoiceData.orderId}<br/>
              Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}<br/>
              Payment Status: ${invoiceData.paymentInfo?.status ?? 'SUCCESS'}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Store</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span><span>₹${(invoiceData.financials?.subtotal ?? 0).toLocaleString('en-IN')}</span></div>
            <div class="totals-row"><span>GST (18% est.):</span><span>₹${(invoiceData.financials?.taxAmount ?? 0).toLocaleString('en-IN')}</span></div>
            <div class="totals-row"><span>Shipping Fee:</span><span>₹${(invoiceData.financials?.shippingAmount ?? 0).toLocaleString('en-IN')}</span></div>
            ${invoiceData.financials?.discountAmount ? `<div class="totals-row" style="color: #16a34a;"><span>Discount:</span><span>-₹${invoiceData.financials.discountAmount.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="totals-row grand"><span>Grand Total:</span><span>₹${(invoiceData.financials?.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>
          </div>
          <div class="footer">
            Thank you for shopping on FlexHub! This is a computer-generated tax invoice.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleDownloadInvoice}
        disabled={loading}
        className={[
          'inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] hover:border-[#CBD5E1] px-4 py-2 text-xs font-semibold text-[#191b23] transition-all duration-200 shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
          className,
        ].join(' ')}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0058be]" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-[#0058be]" />
        )}
        <span>{loading ? 'Generating…' : 'Tax Invoice'}</span>
        <Download className="h-3 w-3 text-[#64748B]" />
      </button>

      {error && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default InvoiceButton;

