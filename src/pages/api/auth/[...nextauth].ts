import NextAuth from "next-auth";
import { get_auth_options } from "src/server/auth";

export default function handler(req: any, res: any) {
  const host = req.headers.host;
  const is_vercel_hostname = host?.includes(".vercel.app");

  return NextAuth(req, res, get_auth_options(is_vercel_hostname));
}
