import React, { useState, useEffect } from 'react';
import styles from './PaginationControls.module.css';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    let pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(currentPage); // Reset to current page if input is invalid
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    // Logic to show a limited number of pages, e.g., [1, '...', 4, 5, 6, '...', 10]
    // For simplicity, we'll show all pages for now if they are few
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button key={i} onClick={() => onPageChange(i)} className={currentPage === i ? styles.active : ''}>
            {i}
          </button>
        );
      }
    } else {
      // More complex logic for many pages can be added here
      pages.push(<button key={1} onClick={() => onPageChange(1)} className={currentPage === 1 ? styles.active : ''}>1</button>);
      pages.push(<span key="ellipsis-start">...</span>);
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
          pages.push(<button key={i} onClick={() => onPageChange(i)} className={currentPage === i ? styles.active : ''}>{i}</button>);
      }
      pages.push(<span key="ellipsis-end">...</span>);
      pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className={currentPage === totalPages ? styles.active : ''}>{totalPages}</button>);
    }
    return pages;
  };

  return (
    <div className={styles.paginationControls}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &laquo; ก่อนหน้า
      </button>
      <div className={styles.pageNumbers}>
        {renderPageNumbers()}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        ถัดไป &raquo;
      </button>
      <form onSubmit={handleGoToPage} className={styles.goToPageForm}>
        <input 
            type="number" 
            value={inputPage} 
            onChange={handleInputChange} 
            className={styles.pageInput} 
            min="1"
            max={totalPages}
        />
        <button type="submit">ไป</button>
      </form>
    </div>
  );
}

export default PaginationControls;