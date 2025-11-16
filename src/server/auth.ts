import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { env } from "src/env.mjs";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "src/db";
import { accounts, sessions, users, verificationTokens } from "src/db/schema";
import { Adapter } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export function get_auth_options(is_vercel_hostname: boolean) {
  const authOptions: NextAuthOptions = {
    callbacks: {
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
          // session.user.role = user.role; <-- put other properties on the session here
        }
        return session;
      },
    },
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }) as Adapter,
    providers: [
      GithubProvider({
        clientId: is_vercel_hostname
          ? env.GITHUB_VERCEL_CLIENT_ID
          : env.GITHUB_CLIENT_ID,
        clientSecret: is_vercel_hostname
          ? env.GITHUB_VERCEL_CLIENT_SECRET
          : env.GITHUB_CLIENT_SECRET,
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      /**
       * ...add more providers here
       *
       * Most other providers require a bit more work than the Discord provider.
       * For example, the GitHub provider requires you to add the
       * `refresh_token_expires_in` field to the Account model. Refer to the
       * NextAuth.js docs for the provider you want to use. Example:
       * @see https://next-auth.js.org/providers/github
       **/
    ],
  };
  return authOptions;
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const host = ctx.req.headers.host;
  if (!host) {
    throw new Error("'ctx.req.headers.host' is undefined");
  }
  const is_vercel_hostname = host?.includes(".vercel.app");

  return getServerSession(
    ctx.req,
    ctx.res,
    get_auth_options(is_vercel_hostname)
  );
};
