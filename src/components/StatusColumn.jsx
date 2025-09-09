import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/User_Page/StatusPage.module.css'; // ใช้ CSS จากหน้าหลักได้เลย

// ฟังก์ชันสำหรับแปลงวันที่
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  }) + ' น.';
};

const ROWS_PER_PAGE = 5;

// Component นี้จะรับ props 3 อย่าง: title, statusType, และ documents
function StatusColumn({ title, statusType, documents }) {
  const [currentPage, setCurrentPage] = useState(1);

  // --- Logic การแบ่งหน้า (Pagination) ---
  const totalPages = Math.ceil(documents.length / ROWS_PER_PAGE) || 1;
  const indexOfLastDoc = currentPage * ROWS_PER_PAGE;
  const indexOfFirstDoc = indexOfLastDoc - ROWS_PER_PAGE;
  const currentDocs = documents.slice(indexOfFirstDoc, indexOfLastDoc);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`${styles.statusBox} ${styles[statusType]}`}>
      <h3>{title}</h3>
      <ul>
        {currentDocs.length > 0 ? (
          currentDocs.map((doc, index) => {
            // กำหนดว่าจะใช้ key วันที่ตัวไหนในการแสดงผล
            const dateLabel = statusType === 'approved' ? 'วันที่อนุมัติ' : (statusType === 'rejected' ? 'วันที่ส่งกลับ' : 'วันที่ส่ง');
            const dateToShow = doc[`${statusType}_date`] || doc.submitted_date;

            return (
              <li key={doc.doc_id || index}>
                <Link to={`/student/docs/${doc.doc_id}`}>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docDetails}>{dateLabel}: {formatDate(dateToShow)}</span>
                </Link>
              </li>
            );
          })
        ) : (
          <li className={styles.emptyMessage}>ยังไม่มีเอกสารในสถานะนี้</li>
        )}
      </ul>
      
      {/* จะแสดง Pagination ก็ต่อเมื่อมีเอกสารมากกว่า 1 หน้า */}
      {documents.length > ROWS_PER_PAGE && (
        <div className={styles.paginationControls}>
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>ᐸ ก่อนหน้า</button>
          <span className={styles.pageInfo}>หน้า {currentPage} / {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage >= totalPages}>ถัดไป ᐳ</button>
        </div>
      )}
    </div>
  );
}

export default StatusColumn;