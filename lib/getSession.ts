import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: await headers(),
  });

  return session;
};
