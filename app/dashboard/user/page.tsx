export const dynamic = "force-dynamic";

import { LogsTable } from "./logs-table";
import { UserTable } from "./user-table";
import { getLogs } from "@/app/actions/logs";

const UserPage = async ({ searchParams }: { searchParams: Promise<{ page?: string; limit?: string }> }) => {
  const { page, limit } = await searchParams;
  const parsedPage = parseInt(page || "1");
  const parsedLimit = parseInt(limit || "10");

  const offset = (parsedPage - 1) * parsedLimit;
  
  // Fetch logs with pagination
  const logsData = await getLogs({ limit: parsedLimit, offset });
  
  return (
    <>
      <UserTable />
      <LogsTable 
        logs={logsData.logs} 
        total={logsData.total} 
        limit={parsedLimit} 
        offset={offset}
      />
    </>
  );
};

export default UserPage;
