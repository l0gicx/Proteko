// app/api/auth/register/route.js
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
// DO NOT import Prisma at the top

export async function POST(request) {
  // DYNAMIC IMPORT: Import Prisma only when the function is called
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}