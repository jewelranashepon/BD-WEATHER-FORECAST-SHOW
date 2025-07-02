"use client";

import { logs } from "@prisma/client";
import moment from "moment";
import { useState } from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogActionType } from "@/lib/log";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const LogsTable = ({
  logs: rawLogs,
  total: rawTotal,
  limit = 10,
}: {
  logs: logs[];
  total?: number;
  limit?: number;
}) => {
  // Handle error case or missing data
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const total = typeof rawTotal === 'number' ? rawTotal : logs.length;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  
  const [selectedDetails, setSelectedDetails] = useState<JSON | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Navigate to a specific page without resetting scroll position
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    // Use router.replace with scroll: false option to prevent scroll reset
    router.replace(`${pathname}?${params.toString()}`, { 
      scroll: false 
    });
  };

  const handleViewDetails = (details: JSON) => {
    setSelectedDetails(details);
    setIsDialogOpen(true);
  };

  // Function to get badge color based on action type
  const getActionBadgeStyle = (action: string) => {
    switch (action) {
      case LogActionType.CREATE:
        return "bg-green-100 text-green-800 border-green-300";
      case LogActionType.UPDATE:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case LogActionType.DELETE:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Logs</h1>
      <div className=" bg-white py-6 rounded-xl border shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="border-b-2 border-slate-300 bg-slate-100">
              <tr>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Time
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Name
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Role
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target User
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action Text
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Module
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actor?.name ?? ""}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actorEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.role}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetUser?.name ?? ""}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        getActionBadgeStyle(log.action)
                      )}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actionText}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.module}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.details ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleViewDetails(log.details)}
                        className="hover:bg-slate-100"
                      >
                        <Eye className="h-5 w-5" />
                        <span>View</span>
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > limit && (
          <div className="border-t pt-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{total > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Previous page button */}
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }).map((_, i) => {
                  // Calculate page number based on current page to show a window of pages
                  let pageNum;
                  const totalPages = Math.ceil(total / limit);
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near the start, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 pages before and 2 pages after current
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum <= 0 || pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => goToPage(pageNum)}
                      size="sm"
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {/* Next page button */}
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.min(Math.ceil(total / limit), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(total / limit)}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Log Details{" "}
              <span className="text-slate-500 text-sm">(Changes made)</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-auto">
            {selectedDetails && (
              <pre className="bg-slate-50 border p-4 rounded-md text-sm whitespace-pre-wrap break-words text-green-900">
                {JSON.stringify(selectedDetails, null, 2)}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
