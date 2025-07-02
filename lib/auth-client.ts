import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { twoFactorClient, customSessionClient } from "better-auth/client/plugins";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export const { signIn, signUp, signOut, useSession, admin, twoFactor } = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        district: {
          type: "string",
        },
        division: {
          type: "string",
        },
        upazila: {
          nullable: true,
          required: false,
          type: "string",
        },
        stationId: {
          required: true,
          type: "string",
        },
        role: {
          required: true,
          type: "string",
          enum: ["super_admin", "station_admin", "observer"],
        },
      },
    }),
    twoFactorClient({
      onTwoFactorRedirect() {
        redirect("/2fa");
      },
    }),
    adminClient(),
    customSessionClient<typeof auth>()
  ],
});
