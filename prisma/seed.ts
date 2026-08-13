import { PrismaClient, Role, StoreStatus, OrderStatus, SubOrderStatus, DiscountType, PaymentProvider, PaymentStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  const defaultPasswordHash = await hashPassword('Password123!');

  // ─── 1. Users ────────────────────────────────────────────────────────────────
  console.log('Creating demo users...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@markethub.com' },
    update: {},
    create: {
      email: 'admin@markethub.com',
      name: 'System Admin',
      phone: '9876543210',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@markethub.com' },
    update: {},
    create: {
      email: 'seller1@markethub.com',
      name: 'Aarav Sharma',
      phone: '9876543211',
      passwordHash: defaultPasswordHash,
      role: Role.SELLER,
      isEmailVerified: true,
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@markethub.com' },
    update: {},
    create: {
      email: 'seller2@markethub.com',
      name: 'Priya Patel',
      phone: '9876543212',
      passwordHash: defaultPasswordHash,
      role: Role.SELLER,
      isEmailVerified: true,
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: 'seller3@markethub.com' },
    update: {},
    create: {
      email: 'seller3@markethub.com',
      name: 'Vikram Singh',
      phone: '9876543213',
      passwordHash: defaultPasswordHash,
      role: Role.SELLER,
      isEmailVerified: true,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@markethub.com' },
    update: {},
    create: {
      email: 'customer@markethub.com',
      name: 'Rahul Verma',
      phone: '9876543214',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      isEmailVerified: true,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@markethub.com' },
    update: {},
    create: {
      email: 'customer2@markethub.com',
      name: 'Neha Gupta',
      phone: '9876543215',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      isEmailVerified: true,
    },
  });

  const deliveryAgent = await prisma.user.upsert({
    where: { email: 'delivery@markethub.com' },
    update: {},
    create: {
      email: 'delivery@markethub.com',
      name: 'Karan Kumar',
      phone: '9876543216',
      passwordHash: defaultPasswordHash,
      role: Role.DELIVERY,
      isEmailVerified: true,
    },
  });

  console.log(`✓ Seeded ${7} users (Admin, 3 Sellers, 2 Customers, 1 Delivery Agent).`);

  // ─── 2. Stores ───────────────────────────────────────────────────────────────
  console.log('Creating demo stores...');

  const store1 = await prisma.store.upsert({
    where: { sellerId: seller1.id },
    update: {},
    create: {
      sellerId: seller1.id,
      storeName: 'Aura Apparel',
      slug: 'aura-apparel',
      description: 'Modern, minimalist everyday streetwear crafted with 100% organic combed cotton.',
      status: StoreStatus.APPROVED,
      commissionRate: 0.10,
      logoUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    },
  });

  const store2 = await prisma.store.upsert({
    where: { sellerId: seller2.id },
    update: {},
    create: {
      sellerId: seller2.id,
      storeName: 'TechNova Electronics',
      slug: 'technova-electronics',
      description: 'High-performance audio gear, smart accessories, and next-generation power banks.',
      status: StoreStatus.APPROVED,
      commissionRate: 0.08,
      logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=400&fit=crop',
    },
  });

  const store3 = await prisma.store.upsert({
    where: { sellerId: seller3.id },
    update: {},
    create: {
      sellerId: seller3.id,
      storeName: 'GreenLeaf Organics',
      slug: 'greenleaf-organics',
      description: 'Pure cold-pressed oils, organic superfoods, and clean wellness essentials.',
      status: StoreStatus.PENDING, // Pending approval for Admin Governance demo!
      commissionRate: 0.12,
      logoUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=400&fit=crop',
    },
  });

  console.log('✓ Seeded stores (2 Approved, 1 Pending).');

  // ─── 3. Categories ───────────────────────────────────────────────────────────
  console.log('Creating category taxonomy...');

  const catFashion = await prisma.category.upsert({
    where: { slug: 'fashion-apparel' },
    update: {},
    create: {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Trending urban apparel, sustainable fabrics, and premium streetwear.',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
    },
  });

  const catMens = await prisma.category.upsert({
    where: { slug: 'mens-clothing' },
    update: {},
    create: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      parentCategoryId: catFashion.id,
      description: 'Hoodies, oversized tees, and jackets.',
    },
  });

  const catWomens = await prisma.category.upsert({
    where: { slug: 'womens-clothing' },
    update: {},
    create: {
      name: "Women's Clothing",
      slug: 'womens-clothing',
      parentCategoryId: catFashion.id,
      description: 'Dresses, co-ords, and knitwear.',
    },
  });

  const catElectronics = await prisma.category.upsert({
    where: { slug: 'electronics-gadgets' },
    update: {},
    create: {
      name: 'Electronics & Gadgets',
      slug: 'electronics-gadgets',
      description: 'Audio devices, smart charging, and mobile peripherals.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
    },
  });

  const catAudio = await prisma.category.upsert({
    where: { slug: 'audio-wearables' },
    update: {},
    create: {
      name: 'Audio & Wearables',
      slug: 'audio-wearables',
      parentCategoryId: catElectronics.id,
      description: 'Noise-canceling headphones, earbuds, and speakers.',
    },
  });

  const catHealth = await prisma.category.upsert({
    where: { slug: 'health-organic' },
    update: {},
    create: {
      name: 'Health & Organic',
      slug: 'health-organic',
      description: '100% natural wellness products and cold-pressed elixirs.',
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=400&fit=crop',
    },
  });

  console.log('✓ Seeded category hierarchy.');

  // ─── 4. Products & Variants ──────────────────────────────────────────────────
  console.log('Creating products and variants...');

  // Product 1: Hoodie (Aura Apparel)
  const product1 = await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      storeId: store1.id,
      categoryId: catMens.id,
      title: 'Heavyweight Oversized Cotton Hoodie',
      slug: 'heavyweight-oversized-cotton-hoodie',
      description: 'Crafted from ultra-soft 450 GSM organic French terry cotton. Features double-stitched drop shoulders and ribbed cuffs for an elevated casual silhouette.',
      brand: 'Aura',
      basePrice: 1499.0,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=800&fit=crop',
      ],
      variants: {
        create: [
          {
            id: '00000000-0000-0000-0001-000000000001',
            storeId: store1.id,
            sku: 'AURA-HD-BLK-M',
            title: 'Medium / Onyx Black',
            variantPrice: 1499.0,
            stock: 45,
            attributes: { size: 'M', color: 'Onyx Black' },
            imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop',
          },
          {
            id: '00000000-0000-0000-0001-000000000002',
            storeId: store1.id,
            sku: 'AURA-HD-BLK-L',
            title: 'Large / Onyx Black',
            variantPrice: 1499.0,
            stock: 50,
            attributes: { size: 'L', color: 'Onyx Black' },
            imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop',
          },
          {
            id: '00000000-0000-0000-0001-000000000003',
            storeId: store1.id,
            sku: 'AURA-HD-BGE-XL',
            title: 'XL / Sand Beige',
            variantPrice: 1599.0,
            stock: 30,
            attributes: { size: 'XL', color: 'Sand Beige' },
            imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop',
          },
        ],
      },
    },
  });

  // Product 2: Headphones (TechNova)
  const product2 = await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      storeId: store2.id,
      categoryId: catAudio.id,
      title: 'AeroSound Pro ANC Wireless Headphones',
      slug: 'aerosound-pro-anc-wireless-headphones',
      description: 'Hybrid Active Noise Cancellation with 40mm custom bio-cellulose drivers, 45-hour battery playback, and multipoint Bluetooth 5.4 connectivity.',
      brand: 'TechNova',
      basePrice: 4999.0,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
      ],
      variants: {
        create: [
          {
            id: '00000000-0000-0000-0002-000000000001',
            storeId: store2.id,
            sku: 'TN-ANC-BLK',
            title: 'Midnight Stealth Black',
            variantPrice: 4999.0,
            stock: 25,
            attributes: { color: 'Stealth Black', finish: 'Matte' },
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
          },
          {
            id: '00000000-0000-0000-0002-000000000002',
            storeId: store2.id,
            sku: 'TN-ANC-SLV',
            title: 'Lunar Silver Aluminum',
            variantPrice: 5299.0,
            stock: 15,
            attributes: { color: 'Lunar Silver', finish: 'Brushed Aluminum' },
            imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
          },
        ],
      },
    },
  });

  // Product 3: PowerBank (TechNova)
  const product3 = await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      storeId: store2.id,
      categoryId: catElectronics.id,
      title: 'MagCharge Slim 10000mAh Magnetic Power Bank',
      slug: 'magcharge-slim-10000mah-magnetic-power-bank',
      description: 'Ultra-thin 15W Qi2 wireless magnetic power bank with 30W Power Delivery USB-C bi-directional fast charging and LED digital display.',
      brand: 'TechNova',
      basePrice: 1999.0,
      images: [
        'https://images.unsplash.com/photo-1609592424368-80fbfbe0cb29?w=800&h=800&fit=crop',
      ],
      variants: {
        create: [
          {
            id: '00000000-0000-0000-0003-000000000001',
            storeId: store2.id,
            sku: 'TN-MAG-10K',
            title: 'Carbon Fiber Slate',
            variantPrice: 1999.0,
            stock: 40,
            attributes: { capacity: '10000mAh', color: 'Slate Gray' },
            imageUrl: 'https://images.unsplash.com/photo-1609592424368-80fbfbe0cb29?w=600&h=600&fit=crop',
          },
        ],
      },
    },
  });

  // Product 4: Organic Coconut Oil (GreenLeaf)
  const product4 = await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      storeId: store3.id,
      categoryId: catHealth.id,
      title: 'Cold-Pressed Extra Virgin Coconut Oil 500ml',
      slug: 'cold-pressed-extra-virgin-coconut-oil-500ml',
      description: 'Raw, unrefined organic coconut oil extracted from fresh coconuts within 2 hours of harvesting. Ideal for culinary and skin care use.',
      brand: 'GreenLeaf',
      basePrice: 449.0,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop',
      ],
      variants: {
        create: [
          {
            id: '00000000-0000-0000-0004-000000000001',
            storeId: store3.id,
            sku: 'GL-VCO-500',
            title: '500ml Glass Jar',
            variantPrice: 449.0,
            stock: 100,
            attributes: { volume: '500ml', packaging: 'Glass Jar' },
            imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
          },
        ],
      },
    },
  });

  console.log('✓ Seeded products and inventory variants.');

  // ─── 5. Coupons ──────────────────────────────────────────────────────────────
  console.log('Creating promotional coupons...');

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      storeId: store1.id,
      code: 'WELCOME10',
      description: '10% instant discount on all Aura Apparel fashion items.',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.0,
      minOrderValue: 999.0,
      maxDiscountAmount: 300.0,
      maxUses: 500,
      usedCount: 12,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'TECH200' },
    update: {},
    create: {
      storeId: store2.id,
      code: 'TECH200',
      description: 'Flat ₹200 off on TechNova Electronics orders over ₹2000.',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 200.0,
      minOrderValue: 2000.0,
      maxUses: 200,
      usedCount: 8,
    },
  });

  console.log('✓ Seeded coupons.');

  // ─── 6. Addresses ────────────────────────────────────────────────────────────
  console.log('Creating customer addresses...');

  const address1 = await prisma.address.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      customerId: customer1.id,
      recipientName: 'Rahul Verma',
      line1: 'Flat 402, Sunshine Heights',
      line2: 'Near Powai Lake, Hiranandani',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400076',
      phone: '9876543214',
      isDefault: true,
    },
  });

  console.log('✓ Seeded address.');

  // ─── 7. Demo Historical Orders & Split Items ──────────────────────────────────
  console.log('Creating demo orders and OTP verification handshakes...');

  const order1 = await prisma.order.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      orderNumber: 'ORD-DEMO-001',
      customerId: customer1.id,
      totalAmount: 1573.95,
      discountAmount: 0.0,
      taxAmount: 74.95,
      shippingAmount: 0.0,
      orderStatus: OrderStatus.PROCESSING,
      shippingAddressSnapshot: {
        recipientName: 'Rahul Verma',
        line1: 'Flat 402, Sunshine Heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400076',
        phone: '9876543214',
        country: 'India',
      },
      orderItems: {
        create: [
          {
            id: '00000000-0000-0000-0000-000000000301',
            variantId: '00000000-0000-0000-0001-000000000001',
            storeId: store1.id,
            productTitleSnapshot: 'Heavyweight Oversized Cotton Hoodie',
            variantAttributesSnapshot: { size: 'M', color: 'Onyx Black' },
            unitPrice: 1499.0,
            quantity: 1,
            totalPrice: 1499.0,
            subOrderStatus: SubOrderStatus.SHIPPED,
            otpCode: '492019',
            trackingNumber: 'TRK-AURA-8821',
            courierPartner: 'BlueDart Express',
          },
        ],
      },
      payments: {
        create: [
          {
            provider: PaymentProvider.RAZORPAY,
            transactionId: 'pay_demo_seeded_123',
            idempotencyKey: 'rzp_demo_order_001',
            amount: 1573.95,
            currency: 'INR',
            status: PaymentStatus.SUCCESS,
          },
        ],
      },
    },
  });

  console.log('✓ Seeded demo order with split sub-orders and OTP code (492019).');
  console.log('\n✨ Database seeding completed successfully!\n');
  console.log('Credentials Summary:');
  console.log('• Admin:    admin@markethub.com / Password123!');
  console.log('• Seller 1: seller1@markethub.com / Password123! (Aura Apparel)');
  console.log('• Seller 2: seller2@markethub.com / Password123! (TechNova Electronics)');
  console.log('• Seller 3: seller3@markethub.com / Password123! (GreenLeaf - Pending)');
  console.log('• Customer: customer@markethub.com / Password123!');
  console.log('• Delivery: delivery@markethub.com / Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
