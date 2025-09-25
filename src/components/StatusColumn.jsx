import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/User_Page/StatusPage.module.css';

// ฟังก์ชันสำหรับแปลงวันที่
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  }) + ' น.';
};

// ✅ 1. สร้าง Object สำหรับจับคู่ประเภทฟอร์มกับ Path
const formPathMap = {
  'ฟอร์ม 1': '/student/form1',
  'ฟอร์ม 2': '/student/form2',
  'ฟอร์ม 3': '/student/form3',
  'ฟอร์ม 4': '/student/form4',
  'ฟอร์ม 5': '/student/form5',
  'ฟอร์ม 6': '/student/form6',
  'ผลสอบภาษาอังกฤษ': '/student/exam-submit',
  'ผลสอบวัดคุณสมบัติ': '/student/exam-submit',
};

const ROWS_PER_PAGE = 5;

// ✅ 2. เพิ่ม navigate เข้ามาใน props
function StatusColumn({ title, statusType, documents, navigate }) {
  const [currentPage, setCurrentPage] = useState(1);

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
            const dateLabel = statusType === 'approved' ? 'วันที่อนุมัติ' : (statusType === 'rejected' ? 'วันที่ส่งกลับ' : 'วันที่ส่ง');
            const dateToShow = doc.action_date || doc.submitted_date;

            // ✅ 3. เพิ่ม Logic ในการตัดสินใจเลือก URL ที่จะไป
            let destinationUrl = `/student/docs/${doc.doc_id}`; // URL ปกติ
            
            // ถ้าเป็นเอกสารที่ "ส่งกลับแก้ไข" และมี Path ใน formPathMap
            if (statusType === 'rejected' && doc.status === 'ส่งกลับแก้ไข' && formPathMap[doc.type]) {
              // ให้เปลี่ยน URL ไปยังหน้าฟอร์มพร้อมส่ง doc_id ไปเป็น query parameter
              destinationUrl = `${formPathMap[doc.type]}?edit=${doc.doc_id}`;
            }

            return (
              <li key={doc.doc_id || index}>
                {/* ✅ 4. ใช้ destinationUrl ที่เราสร้างขึ้น */}
                <Link to={destinationUrl}>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docDetails}>{dateLabel}: {formatDate(dateToShow)}</span>
                  {doc.admin_comment && statusType === 'rejected' && (
                    <span className={styles.docComment}>เหตุผล: {doc.admin_comment}</span>
                  )}
                </Link>
              </li>
            );
          })
        ) : (
          <li className={styles.emptyMessage}>ยังไม่มีเอกสารในสถานะนี้</li>
        )}
      </ul>
      
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