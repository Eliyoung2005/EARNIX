import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { decode, encode } from "next-auth/jwt";

const ADMIN_COOKIE_NAME = "earnix_admin_session";
const SECRET = process.env.NEXTAUTH_SECRET || "earnix-super-secret-key-for-jwt-2026";

/**
 * Saves the admin JWT token to a dedicated httpOnly cookie 'earnix_admin_session'
 * so that logging into a regular user account in another tab won't kick out the admin session.
 */
export async function setAdminSessionCookie(tokenPayload: any) {
  try {
    const cookieStore = await cookies();
    const encodedToken = await encode({
      token: tokenPayload,
      secret: SECRET,
    });

    cookieStore.set(ADMIN_COOKIE_NAME, encodedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  } catch (err) {
    console.error("Failed to set admin session cookie:", err);
  }
}

/**
 * Clears the admin session cookie.
 */
export async function clearAdminSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.error("Failed to clear admin session cookie:", err);
  }
}

/**
 * Retrieves the active session for Admin routes.
 * 1. Checks default NextAuth getServerSession. If it's an Admin, returns it.
 * 2. If default session is non-admin or null, checks the dedicated 'earnix_admin_session' cookie.
 */
export async function getAdminSession() {
  // 1. Try standard getServerSession first
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = ((session.user as any).role as string) || "";
    if (["ADMIN", "SUB_ADMIN", "SUPER_ADMIN"].includes(role)) {
      return session;
    }
  }

  // 2. Fallback to dual admin session cookie
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (adminCookie) {
      const decoded = await decode({ token: adminCookie, secret: SECRET });

      if (decoded && decoded.id) {
        const role = (decoded.role as string) || "";
        if (["ADMIN", "SUB_ADMIN", "SUPER_ADMIN"].includes(role)) {
          return {
            user: {
              id: decoded.id as string,
              name: (decoded.name as string) || "",
              email: (decoded.email as string) || "",
              role: role,
              plan: (decoded.plan as string) || "FREE",
            },
          };
        }
      }
    }
  } catch (err) {
    console.error("Error decoding admin session cookie:", err);
  }

  return null;
}
