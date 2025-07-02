"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LogsPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export const LogsPagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
}: LogsPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Navigate to a specific page
  const goToPage = (page: number) => {
    const url = `${pathname}?page=${page}&limit=${itemsPerPage}`;
    router.push(url);
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of page window
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust window to always show 3 pages (if possible)
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages in the window
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems <= itemsPerPage) {
    return null; // Don't show pagination if all items fit on one page
  }

  return (
    <div className="flex justify-between items-center my-6 px-4">
      <div>
        <p className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {/* Previous page button */}
        <Button
          variant="outline"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          size="sm"
        >
          Previous
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => {
          if (page < 0) {
            // Render ellipsis
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => goToPage(page)}
              size="sm"
              className="min-w-[40px]"
            >
              {page}
            </Button>
          );
        })}

        {/* Next page button */}
        <Button
          variant="outline"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
