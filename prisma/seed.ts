// prisma/seed.ts
import prisma from '../src/connect';
import bcrypt from 'bcrypt';

async function main() {


    // Optionally, create an Admin User
    const adminEmail = 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const newAdmin = await prisma.user.create({
            data: {
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('Admin user created:', newAdmin.email);
    } else {
        console.log('Admin user already exists.');
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
