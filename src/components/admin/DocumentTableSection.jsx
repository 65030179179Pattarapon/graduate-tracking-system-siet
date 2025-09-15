import React, { useState, useEffect } from 'react';
import styles from './DocumentTableSection.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// --- 🔽 Mock Data: ข้อมูลจำลองสำหรับทดสอบ 🔽 ---
// ในการใช้งานจริง ส่วนนี้จะถูกแทนที่ด้วยการ fetch ข้อมูลจาก API
const mockDocuments = [
  {
    id: 1,
    documentId: 'DOC001',
    documentName: 'คำร้องขอสำเร็จการศึกษา',
    submissionDate: '2025-09-15T10:30:00Z',
    status: 'Pending',
    user: {
      studentId: '65012345',
      fullName: 'สมชาย ใจดี',
      email: 'somchai.j@example.com',
    },
  },
  {
    id: 2,
    documentId: 'DOC002',
    documentName: 'รายงานความก้าวหน้าวิทยานิพนธ์',
    submissionDate: '2025-09-14T15:00:00Z',
    status: 'Approved',
    user: {
      studentId: '64054321',
      fullName: 'สมหญิง จริงใจ',
      email: 'somyin.j@example.com',
    },
  },
  {
    id: 3,
    documentId: 'DOC003',
    documentName: 'คำร้องขอสอบหัวข้อโครงงาน',
    submissionDate: '2025-09-13T09:00:00Z',
    status: 'Rejected',
    user: {
      studentId: '66098765',
      fullName: 'มานะ พากเพียร',
      email: 'mana.p@example.com',
    },
  },
];

function DocumentTableSection() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ---  จำลองการเรียก API ---
    const fetchDocuments = async () => {
      try {
        // ใช้งานจริง: ให้เรียก API ที่นี่ เช่น const response = await fetch('/api/admin/documents');
        setTimeout(() => {
          setDocuments(mockDocuments);
          setIsLoading(false);
        }, 1000); // หน่วงเวลา 1 วินาทีเพื่อจำลองการโหลด
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลเอกสารได้');
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.sectionContainer}>
      <header className={styles.header}>
        <h2>รายการเอกสารทั้งหมด</h2>
      </header>
      
      <div className={styles.tableWrapper}>
        <table className={styles.documentTable}>
          <thead>
            <tr>
              <th>รหัสเอกสาร</th>
              <th>ชื่อเอกสาร</th>
              <th>อีเมล</th>
              <th>รหัสนักศึกษา</th>
              <th>ชื่อ-นามสกุล</th>
              <th>วันที่ส่ง</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.documentId}</td>
                  <td className={styles.documentName}>{doc.documentName}</td>
                  <td>{doc.user.email}</td>
                  <td>{doc.user.studentId}</td>
                  <td>{doc.user.fullName}</td>
                  <td>
                    {new Date(doc.submissionDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[doc.status.toLowerCase()]}`}>
                      {doc.status === 'Pending' ? 'รอตรวจสอบ' : doc.status === 'Approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button title="ดูรายละเอียด"><FontAwesomeIcon icon={faEye} /></button>
                    <button title="อนุมัติ"><FontAwesomeIcon icon={faCheckCircle} /></button>
                    <button title="ปฏิเสธ"><FontAwesomeIcon icon={faTimesCircle} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.noData}>ยังไม่มีเอกสารในระบบ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentTableSection;