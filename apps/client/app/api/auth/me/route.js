import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  const user = getUserFromCookie();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role }
  });
}
