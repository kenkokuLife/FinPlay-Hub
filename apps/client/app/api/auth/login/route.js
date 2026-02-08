import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://api:3000";
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "登录失败" },
        { status: res.status }
      );
    }

    const { token } = await res.json();

    // Decode JWT payload to return user info
    const jwt = require("jsonwebtoken");
    const user = jwt.verify(token, JWT_SECRET);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role }
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch {
    return NextResponse.json({ error: "服务器连接失败" }, { status: 502 });
  }
}
