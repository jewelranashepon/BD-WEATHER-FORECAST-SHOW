import Sidebar from "./../../components/sidebar";
import { LocationProvider } from "@/contexts/divisionContext";
import { HourProvider } from "@/contexts/hourContext";
import Profile from "@/components/profile";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex fixed size-full bg-gray-50">
        <Sidebar />
        <div className="flex w-full flex-col overflow-hidden">
          <div className="bg-blue-400 flex flex-col p-2 items-end">
            <Profile />
          </div>
          <div className="grow overflow-y-auto relative p-6">
            <LocationProvider>
              <HourProvider>
                {children}
              </HourProvider>
            </LocationProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
