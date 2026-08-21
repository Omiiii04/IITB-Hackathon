import { prisma } from '@/lib/prisma';
import { renderInvoicePdf } from './pdf-generator';

export class OrderNotFoundError extends Error {}

export interface InvoiceItem {
  productTitle: string;
  storeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  orderId: string;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string;
  shippingAddress: unknown;
  items: InvoiceItem[];
  financials: {
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    subtotal: number;
  };
}

export async function buildInvoiceData(orderId: string, customerId: string): Promise<InvoiceData> {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: orderId }, { orderNumber: orderId }], customerId },
    include: {
      customer: { select: { name: true, email: true } },
      orderItems: { include: { store: { select: { storeName: true } } } },
    },
  });

  if (!order) throw new OrderNotFoundError();

  const invoiceNumber = `INV-${(order.orderNumber ?? order.id).slice(0, 8).toUpperCase()}`;

  return {
    invoiceNumber,
    invoiceDate: order.createdAt,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name ?? 'Customer',
    customerEmail: order.customer.email,
    shippingAddress: order.shippingAddressSnapshot,
    items: order.orderItems.map((item) => ({
      productTitle: item.productTitleSnapshot,
      storeName: item.store?.storeName ?? 'Seller Store',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice ?? item.unitPrice * item.quantity,
    })),
    financials: {
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      subtotal: order.totalAmount - order.taxAmount - order.shippingAmount + order.discountAmount,
    },
  };
}

export async function generateInvoicePdf(orderId: string, customerId: string): Promise<Buffer> {
  const data = await buildInvoiceData(orderId, customerId);
  return renderInvoicePdf(data);
}