import { Button, Flex } from 'theme-ui';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface BasePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const pageButtonSx = {
  width: 34,
  height: 34,
  p: 0,
  fontSize: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
};

const BasePagination = ({ currentPage, totalPages, onPageChange }: BasePaginationProps) => {
  // Show at most 5 page numbers around the current page
  const firstPage = Math.max(1, currentPage - 2);
  const lastPage = Math.min(totalPages, currentPage + 2);
  const pageNumbers = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);

  return (
    <Flex sx={{ gap: 2, alignItems: 'center' }}>
      <Button variant="secondary" aria-label="Previous page" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} sx={pageButtonSx}>
        <FiChevronLeft size={16} />
      </Button>

      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          variant={pageNumber === currentPage ? 'primary' : 'secondary'}
          onClick={() => onPageChange(pageNumber)}
          sx={pageButtonSx}
        >
          {pageNumber}
        </Button>
      ))}

      <Button variant="secondary" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} sx={pageButtonSx}>
        <FiChevronRight size={16} />
      </Button>
    </Flex>
  );
};

export default BasePagination;