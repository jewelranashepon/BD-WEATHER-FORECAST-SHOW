export const dynamic = "force-dynamic";

import { FirstCardForm } from "./FirstCardForm";
import { getTimeData } from "@/app/actions/time-check";

export default async function FirstCardPage() {
  const timeInformation = await getTimeData();

  // Check if timeInformation is an error object
  if ('error' in timeInformation) {
    // Handle the error case
    return (
      <main className="container mx-auto">
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{timeInformation.error}</p>
        </div>
      </main>
    );
  }

  // If not an error, it's safe to pass as TimeInfo[]
  return (
    <main className="container mx-auto">
      <FirstCardForm timeInfo={timeInformation} />
    </main>
  );
}
