export const dynamic = "force-dynamic";

import SecondCardForm from "./SecondCard";
import { getTimeData } from "@/app/actions/time-check";

export default async function Home() {
  const timeInformation = await getTimeData();

  return (
    <main className="w-full py-4 px-4">
      <SecondCardForm timeInfo={timeInformation} />
    </main>
  );
}
