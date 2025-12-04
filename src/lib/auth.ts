import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.AUTH_SECRET || "your-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

export interface User {
  id: number;
  login: string;
  avatar_url: string;
  access_token: string;
}

export async function createSession(user: User): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({
    id: user.id,
    login: user.login,
    avatar_url: user.avatar_url,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  // Store access token separately in a more secure way
  // In production, consider encrypting this or storing in a database
  cookieStore.set("access_token", user.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const accessToken = cookieStore.get("access_token")?.value;

    if (!session || !accessToken) {
      return null;
    }

    const { payload } = await jwtVerify(session, encodedKey);

    return {
      id: payload.id as number,
      login: payload.login as string,
      avatar_url: payload.avatar_url as string,
      access_token: accessToken,
    };
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("access_token");
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

