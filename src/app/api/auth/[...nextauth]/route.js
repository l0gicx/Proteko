// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs"; 

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      // Define the fields your login form will send.
      // This tells NextAuth what to expect in the 'credentials' object.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- Authorize function started ---");
        try {
          const { email, password } = credentials;

          if (!email || !password) {
            console.log("Authorize failed: Missing email or password.");
            return null;
          }
          console.log(`Attempting to find user with email: ${email}`);

          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: email,
                mode: 'insensitive',
              },
            },
          });

          if (!user || !user.password) {
            console.log("Authorize failed: No user found or user has no password.");
            return null;
          }
          console.log(`User found: ${user.name} (ID: ${user.id})`);

          console.log("Comparing passwords...");
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.log("Authorize failed: Invalid password.");
            return null;
          }

          console.log("Password is valid. Login successful.");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };

        } catch (error) {
          console.error("CRITICAL ERROR in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
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
  pages: {
    signIn: "/login",
  },
  // CORRECTED: Use the new environment variable name for NextAuth v5
  secret: process.env.AUTH_SECRET,
});