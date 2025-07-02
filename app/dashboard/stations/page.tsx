import { StationManagement } from "@/components/stationManagement";
import { stations as initialStations } from "@/data/stations";

export default function StationsAdminPage() {
  return (
    <div>
      <StationManagement initialStations={initialStations} />
    </div>
  );
}
