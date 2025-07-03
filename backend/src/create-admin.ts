import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createAdmin() {
  try {
    const email = 'mittalvaibhav73@gmail.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return;
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN', // Make sure this matches your enum
      }
    });
    
    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();