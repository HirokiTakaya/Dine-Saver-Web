import React from 'react';
import ReactPaginate from 'react-paginate';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (selectedPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ itemsPerPage, totalItems, currentPage, onPageChange }) => {
  // Calculate the total number of pages
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  // Handle page click
  const handlePageClick = (data: { selected: number }) => {
    onPageChange(data.selected + 1);  // Convert zero-based index to one-based index
  };

  return (
    <ReactPaginate
      previousLabel={'<'}
      nextLabel={'>'}
      breakLabel={'...'}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={handlePageClick}
      containerClassName={'pagination'}
      activeClassName={'active'}
      pageClassName={'page-item'}
      previousLinkClassName={'page-link'}
      nextLinkClassName={'page-link'}
      breakLinkClassName={'page-link'}
      pageLinkClassName={'page-link'}
      forcePage={currentPage - 1}  // Ensure that pagination highlights the correct page
    />
  );
};

export default Pagination;
