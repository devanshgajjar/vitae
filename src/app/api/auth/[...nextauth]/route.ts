import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Build providers array based on available environment variables
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }));
}

// Always add email/password authentication as fallback
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      action: { label: "Action", type: "hidden" }, // signin or signup
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const { email, password, action } = credentials;

      try {
        if (action === "signup") {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (existingUser) {
            throw new Error("User already exists");
          }

          // Hash password and create user
          const hashedPassword = await bcrypt.hash(password, 12);
          const user = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0], // Use email prefix as default name
              // Store hashed password in a custom field (you'll need to add this to schema)
              accounts: {
                create: {
                  type: "credentials",
                  provider: "credentials",
                  providerAccountId: email,
                  // Store hashed password in access_token field as workaround
                  access_token: hashedPassword,
                }
              }
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } else {
          // Sign in - find user and verify password
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              accounts: {
                where: {
                  provider: "credentials"
                }
              }
            }
          });

          if (!user || !user.accounts[0]?.access_token) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.accounts[0].access_token);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
  })
);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session?.user && token?.uid) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }: { user: any; token: any }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
