import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create an Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In real applications, hash the password
      role: 'ADMIN',
    },
  });

  // Create a Test User
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'USER',
    },
  });

  // Create a Few Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Sample Product 1',
        description: 'This is a sample product description.',
        price: 10.99,
        tags: 'sample,product1',
        image: 'https://via.placeholder.com/150',
      },
      {
        name: 'Sample Product 2',
        description: 'Another sample product description.',
        price: 15.99,
        tags: 'sample,product2',
        image: 'https://via.placeholder.com/150',
      },
    ],
  });

  // Create an Address for the Test User
  await prisma.address.create({
    data: {
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      postalCode: 94103,
      address: '123 Test Street',
      userId: testUser.id,
    },
  });

  // Create a Test Order
  const testOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      netAmount: 26.98, // Sum of product prices
      address: '123 Test Street, San Francisco, CA',
      status: 'PENDING',
    },
  });

  // Link Products to the Order
  await prisma.orderProduct.createMany({
    data: [
      {
        orderId: testOrder.id,
        productId: 1, // Assuming this ID exists
        quantity: 1,
      },
      {
        orderId: testOrder.id,
        productId: 2, // Assuming this ID exists
        quantity: 1,
      },
    ],
  });

  console.log('Project initialized with basic seed data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
