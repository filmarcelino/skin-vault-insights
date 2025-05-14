
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface SearchPaginationProps {
  currentPage: number;
  totalPages?: number;
  setCurrentPage?: (page: number) => void;
  onPageChange?: (pageNumber: number) => void;  // Add this prop
  show?: boolean;
  itemsPerPage?: number;
  totalItems?: number;
  paginate?: (pageNumber: number) => void;
}

export const SearchPagination = ({
  currentPage,
  totalPages: propTotalPages,
  setCurrentPage,
  onPageChange,
  show = true,
  itemsPerPage,
  totalItems,
  paginate
}: SearchPaginationProps) => {
  if (!show) return null;
  
  // Calculate totalPages if not provided directly
  const totalPages = propTotalPages || (itemsPerPage && totalItems ? Math.ceil(totalItems / itemsPerPage) : 1);
  
  // Use the appropriate page changing function
  const changePage = (page: number) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    } else if (onPageChange) {
      onPageChange(page);
    } else if (paginate) {
      paginate(page);
    }
  };

  // Display up to 5 page numbers, with ellipsis if needed
  const pageNumbers: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    
    if (currentPage > 3) {
      pageNumbers.push("...");
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pageNumbers.push("...");
    }
    
    pageNumbers.push(totalPages);
  }

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => changePage(Math.max(1, currentPage - 1))}
            className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
          />
        </PaginationItem>
        
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === "number" ? (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => changePage(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            ) : (
              <span className="px-2">...</span>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
            className={`cursor-pointer ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
