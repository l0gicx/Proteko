// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs"; 

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma"; // <-- IMPORT the singleton instance
import bcrypt from "bcryptjs";

// DO NOT create a new PrismaClient here

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ... (the authorize function remains the same, it will use the imported 'prisma')
        try {
          const { email, password } = credentials;
          if (!email || !password) return null;
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
          });
          if (!user || !user.password) return null;
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
});