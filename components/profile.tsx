"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const Profile = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  return (
    <div className="flex items-center gap-6 h-12">
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-xs md:text-md md:font-medium text-white uppercase text-shadow">
              {session?.user.name} ({session?.user.role})
            </span>
            <span className="uppercase text-xs md:text-md text-white text-shadow">
              {session?.user.station?.name} ({session?.user.station?.stationId})
            </span>
          </div>
        </>
      )}

      <Button
        variant="secondary"
        className="h-8 w-17 md:w-24"
        onClick={() => {
          signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
                router.refresh();
              },
            },
          });
        }}
      >
        <LogOut className="text-xs md:text-md" />
        <span className="text-xs md:text-md">Logout</span>
      </Button>
    </div>
  );
};

export default Profile;
