import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmailAsync, welcomeEmail } from "@/lib/email";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string | null;
      isSuperAdmin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
    isSuperAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
    isSuperAdmin: boolean;
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
        include: { adminUser: true },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      if (user.deletedAt) {
        throw new Error("This account has been deactivated");
      }

      if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        throw new Error("This account is currently suspended");
      }

      if (!user.hashedPassword) {
        throw new Error("This account uses social login. Please sign in with Google or Microsoft.");
      }

      const isPasswordValid = await compare(
        credentials.password,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      await db.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      const role = user.adminUser?.role ?? "USER";

      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role,
        tenantId: user.tenantId,
        isSuperAdmin: false,
      };
    },
  }),

  CredentialsProvider({
    id: "superadmin-credentials",
    name: "SuperAdmin Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const superAdmin = await db.superAdmin.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      if (!superAdmin) {
        throw new Error("Invalid email or password");
      }

      if (!superAdmin.hashedPassword) {
        throw new Error("Invalid email or password");
      }

      const isPasswordValid = await compare(
        credentials.password,
        superAdmin.hashedPassword
      );

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      await db.superAdmin.update({
        where: { id: superAdmin.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        tenantId: null,
        isSuperAdmin: true,
      };
    },
  }),
];

// Add Google provider if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add Microsoft provider if configured
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: "common", // allows any Microsoft account
    })
  );
}

/**
 * Find or create a user from an OAuth sign-in.
 * Returns the internal user record.
 */
async function findOrCreateOAuthUser(
  email: string,
  name: string,
  provider: string,
  photoUrl?: string | null
) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: { adminUser: true },
  });

  if (existing) {
    if (existing.deletedAt) {
      throw new Error("This account has been deactivated");
    }
    if (existing.suspendedUntil && new Date(existing.suspendedUntil) > new Date()) {
      throw new Error("This account is currently suspended");
    }

    await db.user.update({
      where: { id: existing.id },
      data: {
        lastActiveAt: new Date(),
        photoUrl: existing.photoUrl ?? photoUrl ?? null,
      },
    });

    return {
      id: existing.id,
      email: existing.email,
      name: existing.fullName,
      role: existing.adminUser?.role ?? "USER",
      tenantId: existing.tenantId,
      isSuperAdmin: false,
    };
  }

  // New user — find default tenant
  const defaultTenant = await db.tenant.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  if (!defaultTenant) {
    throw new Error("No active tenant found");
  }

  // Create user + profile + gamification state
  const newUser = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        fullName: name,
        hashedPassword: null,
        authProvider: provider,
        photoUrl: photoUrl ?? null,
        tenantId: defaultTenant.id,
      },
    });

    await tx.userProfile.create({
      data: { userId: user.id },
    });

    await tx.userGamificationState.create({
      data: { userId: user.id },
    });

    return user;
  });

  // Send welcome email
  const emailTemplate = welcomeEmail(name, defaultTenant.displayName);
  sendEmailAsync({ ...emailTemplate, to: normalizedEmail });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.fullName,
    role: "USER",
    tenantId: newUser.tenantId,
    isSuperAdmin: false,
  };
}

export const authOptions: NextAuthOptions = {
  providers,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account }) {
      // Credentials are already handled by authorize()
      if (account?.provider === "credentials" || account?.provider === "superadmin-credentials") return true;

      // OAuth sign-in — find or create user
      if (account && user.email) {
        try {
          const provider = account.provider === "azure-ad" ? "microsoft" : account.provider;
          const dbUser = await findOrCreateOAuthUser(
            user.email,
            user.name ?? user.email.split("@")[0],
            provider,
            user.image
          );
          // Attach DB user info to the user object so jwt callback can read it
          user.id = dbUser.id;
          user.role = dbUser.role;
          user.tenantId = dbUser.tenantId;
          user.name = dbUser.name;
          user.isSuperAdmin = false;
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Sign in failed";
          return `/login?error=${encodeURIComponent(message)}`;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.tenantId = user.tenantId ?? null;
        token.isSuperAdmin = (user as any).isSuperAdmin ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.userId,
        email: token.email,
        name: token.name,
        role: token.role,
        tenantId: token.tenantId,
        isSuperAdmin: token.isSuperAdmin ?? false,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET ?? "intent-dev-secret-change-in-production",
};
