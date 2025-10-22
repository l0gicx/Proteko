// app/api/auth/register/route.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // <--- CHANGE HERE
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
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
  }
}