// app/api/auth/register/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  // We are not doing anything with the database for now.
  // We are just creating the simplest possible API endpoint.
  return NextResponse.json({ message: "Registration endpoint is working" });
}