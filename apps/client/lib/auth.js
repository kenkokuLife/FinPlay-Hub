import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export function getUserFromCookie() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserIdFromCookie() {
  const user = getUserFromCookie();
  return user?.id ? String(user.id) : "anonymous";
}
