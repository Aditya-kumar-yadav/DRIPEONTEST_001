import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting "DRIPEON" PostgreSQL premium database seeding...');

  // 1. Clear existing data in correct dependency sequence
  console.log('Clearing old table structures safely...');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.returnExchangeRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.siteSettings.deleteMany({});

  console.log('Deleted legacy tables rows.');

  // 2. Seeding Users
  console.log('Seeding administrative and guest users...');
  const users = [
    {
      id: "usr-admin",
      name: "DRIPEON Admin",
      email: "admin@dripeon.com",
      passwordHash: "$2a$12$ZMyhVvNidL8pInNf74SshOCr0yU/Ico0qZitWn7D1qI/mXunfS90e", // "admin"
      role: "ADMIN",
      phone: "+91 99999 99999",
      address: {
        street: "Fashion Boulevard, DLF Phase 3",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        country: "Worldwide"
      },
      emailVerified: true
    },
    {
      id: "usr-cust-demo",
      name: "Demo Collector",
      email: "customer@DRIPEON.com",
      passwordHash: "$2a$12$RptVd/aWeqW6x7H/F0yDquR6lT1HhE5D3m1w2Yg0fAtscUshc3H92", // "customer"
      role: "CUSTOMER",
      phone: "+91 99999 99999",
      address: {
        street: "Atelier Street, Taj Mahal Way",
        city: "New York",
        state: "New York",
        pincode: "400001",
        country: "Worldwide"
      },
      emailVerified: true
    },
    {
      id: "usr-cust-1",
      name: "Yuvraj Singh",
      email: "yraj15927@gmail.com",
      passwordHash: "$2a$12$RptVd/aWeqW6x7H/F0yDquR6lT1HhE5D3m1w2Yg0fAtscUshc3H92", // "customer"
      role: "CUSTOMER",
      phone: "+91 98765 43210",
      address: {
        street: "77 Luxury enclave",
        city: "New York",
        state: "New York",
        pincode: "400001",
        country: "Worldwide"
      },
      emailVerified: true
    }
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        phone: u.phone,
        address: u.address,
        emailVerified: u.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  // 3. Seeding Coupons
  console.log('Seeding discount coupons...');
  const coupons = [
    {
      id: "coupon-1",
      code: "DRIP10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 0,
      maxUses: 1000,
      usedCount: 0,
      isActive: true,
      expiresAt: "2028-12-31"
    },
    {
      id: "coupon-2",
      code: "FIRST500",
      discountType: "FLAT",
      discountValue: 500,
      minOrderValue: 3500,
      maxUses: 500,
      usedCount: 0,
      isActive: true,
      expiresAt: "2028-12-31"
    }
  ];

  for (const c of coupons) {
    await prisma.coupon.create({
      data: c
    });
  }

  // 4. Seeding Global Site Settings
  console.log('Seeding default landing parameters...');
  await prisma.siteSettings.create({
    data: {
      id: "settings-unique",
      announcementText: "FREE SHIPPING IN INDIA ON ORDERS OVER $5,000 | DRIPEON",
      showAnnouncement: true,
      heroTitle: "DRIPEON",
      heroSub: "A New Era Of Premium Worldwiden Fashion",
      freeShippingThreshold: 5000,
      shippingRate: 150,
      contactEmail: "DRIPEON@gmail.com"
    }
  });

  // 5. Seeding Product Catalog (Items, image galleries, color/size variants)
  console.log('Seeding luxury products catalog...');
  const products = [
    {
      id: "prod-jap-pant-1",
      name: "Black Tailored Japanese Pant",
      slug: "black-tailored-japanese-pant",
      description: "Tailored to perfection, this Japanese pant represents architectural design and sheer elegance. Engineered with premium cotton fabrics and traditional origami draping layouts.",
      category: "JAPANESE_PANT",
      fabric: "Premium Cotton",
      fit: "Tailored",
      closure: "Internal Tab",
      waistStyle: "Mid Rise",
      styleType: "Avant-garde Minimal",
      price: 1299,
      comparePrice: 2149,
      isActive: true,
      images: [
        {
          id: "img-jp1-1",
          imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-jp1-s", color: "Black", size: "S", stockQuantity: 15, sku: "DL-JP1-BLK-S" },
        { id: "var-jp1-m", color: "Black", size: "M", stockQuantity: 22, sku: "DL-JP1-BLK-M" },
        { id: "var-jp1-l", color: "Black", size: "L", stockQuantity: 18, sku: "DL-JP1-BLK-L" },
        { id: "var-jp1-xl", color: "Black", size: "XL", stockQuantity: 10, sku: "DL-JP1-BLK-XL" }
      ]
    },
    {
      id: "prod-gk-pant-1",
      name: "Navy Blue Tailored Gurkha Pant",
      slug: "navy-blue-tailored-gurkha-pant",
      description: "Classic beltless Gurkha pant featuring signature hand-finished double forward waist pleats and double slide buckle adjusters.",
      category: "GURKHA_PANT",
      fabric: "Premium Cotton Blend",
      fit: "Tailored",
      closure: "Side Buckles",
      waistStyle: "High Waist",
      styleType: "Traditional Tailoring",
      price: 1299,
      comparePrice: 2149,
      isActive: true,
      images: [
        {
          id: "img-gk1-1",
          imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-gk1-s", color: "Navy Blue", size: "S", stockQuantity: 15, sku: "DL-GK1-NVY-S" },
        { id: "var-gk1-m", color: "Navy Blue", size: "M", stockQuantity: 22, sku: "DL-GK1-NVY-M" },
        { id: "var-gk1-l", color: "Navy Blue", size: "L", stockQuantity: 18, sku: "DL-GK1-NVY-L" },
        { id: "var-gk1-xl", color: "Navy Blue", size: "XL", stockQuantity: 10, sku: "DL-GK1-NVY-XL" }
      ]
    },
    {
      id: "prod-sh-1",
      name: "Black Utility Shacket",
      slug: "black-utility-shacket",
      description: "A rugged yet impeccably tailored shacket that effortlessly bridges outer structure with utility presence.",
      category: "SHACKET",
      fabric: "Heavy Canvas Cotton",
      fit: "Regular",
      closure: "Steel Zip",
      waistStyle: "Regular",
      styleType: "Modern Streetwear",
      price: 2799,
      comparePrice: 4999,
      isActive: true,
      images: [
        {
          id: "img-sh1-1",
          imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-sh1-s", color: "Black", size: "S", stockQuantity: 15, sku: "DL-SH1-BLK-S" },
        { id: "var-sh1-m", color: "Black", size: "M", stockQuantity: 22, sku: "DL-SH1-BLK-M" },
        { id: "var-sh1-l", color: "Black", size: "L", stockQuantity: 18, sku: "DL-SH1-BLK-L" },
        { id: "var-sh1-xl", color: "Black", size: "XL", stockQuantity: 10, sku: "DL-SH1-BLK-XL" }
      ]
    },
    {
      id: "prod-sh-2",
      name: "Warm Brown Utility Shacket",
      slug: "warm-brown-utility-shacket",
      description: "Rich earth tone overshirt crafted from heavyweight suede-effect premium weft. Ideal layer for high-end structure.",
      category: "SHACKET",
      fabric: "Premium Suede Weave",
      fit: "Regular",
      closure: "Zip",
      waistStyle: "Regular",
      styleType: "Streetwear Luxe",
      price: 2799,
      comparePrice: 4999,
      isActive: true,
      images: [
        {
          id: "img-sh2-1",
          imageUrl: "https://images.unsplash.com/photo-1620012253295-c05ce3e85663?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-sh2-s", color: "Brown", size: "S", stockQuantity: 15, sku: "DL-SH2-BRN-S" },
        { id: "var-sh2-m", color: "Brown", size: "M", stockQuantity: 22, sku: "DL-SH2-BRN-M" },
        { id: "var-sh2-l", color: "Brown", size: "L", stockQuantity: 18, sku: "DL-SH2-BRN-L" },
        { id: "var-sh2-xl", color: "Brown", size: "XL", stockQuantity: 10, sku: "DL-SH2-BRN-XL" }
      ]
    },
    {
      id: "prod-gk-pant-2",
      name: "Black Tailored Gurkha Pant",
      slug: "black-tailored-gurkha-pant",
      description: "Classic high-rise trousers made in premium double-weave crease-resistant fabric. Stood out fit designed for comfort.",
      category: "GURKHA_PANT",
      fabric: "Premium Crepe Cotton",
      fit: "Tailored",
      closure: "Beltless Side Buckle",
      waistStyle: "High Waist",
      styleType: "Classic Draping",
      price: 1299,
      comparePrice: 2149,
      isActive: true,
      images: [
        {
          id: "img-gk2-1",
          imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-gk2-s", color: "Black", size: "S", stockQuantity: 15, sku: "DL-GK2-BLK-S" },
        { id: "var-gk2-m", color: "Black", size: "M", stockQuantity: 22, sku: "DL-GK2-BLK-M" },
        { id: "var-gk2-l", color: "Black", size: "L", stockQuantity: 18, sku: "DL-GK2-BLK-L" },
        { id: "var-gk2-xl", color: "Black", size: "XL", stockQuantity: 10, sku: "DL-GK2-BLK-XL" }
      ]
    },
    {
      id: "prod-gk-pant-3",
      name: "Ivory Tailored Gurkha Pant",
      slug: "ivory-tailored-gurkha-pant",
      description: "Beautiful clean off-white high-rise trousers. Finished with immaculate double blind hem and custom chrome buckle plates.",
      category: "GURKHA_PANT",
      fabric: "Silk Crepe Blend",
      fit: "Tailored",
      closure: "Buckles",
      waistStyle: "High Waist",
      styleType: "Contemporary Heritage",
      price: 1299,
      comparePrice: 2149,
      isActive: true,
      images: [
        {
          id: "img-gk3-1",
          imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
          sortOrder: 1
        }
      ],
      variants: [
        { id: "var-gk3-s", color: "Beige", size: "S", stockQuantity: 15, sku: "DL-GK3-IVR-S" },
        { id: "var-gk3-m", color: "Beige", size: "M", stockQuantity: 22, sku: "DL-GK3-IVR-M" },
        { id: "var-gk3-l", color: "Beige", size: "L", stockQuantity: 18, sku: "DL-GK3-IVR-L" },
        { id: "var-gk3-xl", color: "Beige", size: "XL", stockQuantity: 10, sku: "DL-GK3-IVR-XL" }
      ]
    }
  ];

  for (const item of products) {
    const { images, variants, ...prod } = item;
    await prisma.product.create({
      data: {
        ...prod,
        images: {
          createMany: {
            data: images.map(img => ({
              id: img.id,
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder
            }))
          }
        },
        variants: {
          createMany: {
            data: variants.map(v => ({
              id: v.id,
              color: v.color,
              size: v.size,
              stockQuantity: v.stockQuantity,
              sku: v.sku
            }))
          }
        }
      }
    });
  }

  // Seeding initial customer reviews for our flagship luxury clothing catalog items
  console.log('Seeding customer reviews...');
  const seedReviews = [
    {
      id: "seed-rev-1",
      productId: "prod-jap-pant-1",
      rating: 5,
      title: "Extremely Avant-garde Drape",
      comment: "I was hesitant, but the structured pleating is exceptional indeed. It sits so comfortably near active footwear. Highly requested silhouette style!",
      userName: "Nikhil Mehra",
      verifiedPurchase: true,
      helpfulCount: 12
    },
    {
      id: "seed-rev-2",
      productId: "prod-jap-pant-1",
      rating: 5,
      title: "Incredible Fabric Integrity",
      comment: "Superb construction quality. It feels premium, heavy weight but remarkably breathable during high-warmth New York afternoon schedules.",
      userName: "Ananya Roy",
      verifiedPurchase: true,
      helpfulCount: 5
    },
    {
      id: "seed-rev-3",
      productId: "prod-gk-pant-1",
      rating: 5,
      title: "Most comfort trousers ever",
      comment: "The gurkha buckles adjust tightly without making crease. Truly traditional yet futuristic. Fast custom shipping inside standard timelines.",
      userName: "Devendra Verma",
      verifiedPurchase: true,
      helpfulCount: 7
    }
  ];

  for (const sr of seedReviews) {
    await prisma.review.create({
      data: {
        id: sr.id,
        productId: sr.productId,
        rating: sr.rating,
        title: sr.title,
        comment: sr.comment,
        userName: sr.userName,
        verifiedPurchase: sr.verifiedPurchase,
        helpfulCount: sr.helpfulCount,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  console.log('Successfully completed "DRIPEON" premium database seeding protocol!');
}

main()
  .catch((e) => {
    console.error('Database seeding protocol aborted due to error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
