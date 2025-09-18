import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';
import { useNavigate } from 'react-router-dom';

function HistorySection({ documents }) {
  const navigate = useNavigate();
  return (
    <div className={styles.card}>
      <h3>ประวัติการยื่นเอกสาร</h3>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>ชื่อเอกสาร</th>
            <th>วันที่ยื่น</th>
            <th>สถานะ</th>
            <th>ดูรายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? documents.map(doc => (
            <tr key={doc.doc_id}>
              <td>{doc.title}</td>
              <td>{new Date(doc.submitted_date).toLocaleDateString('th-TH')}</td>
              <td>{doc.status}</td>
              <td>
                <button 
                  className={styles.linkButton} 
                  onClick={() => navigate(`/admin/docs/${doc.doc_id}`)}
                >
                  ดูเอกสาร
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>ไม่พบประวัติการยื่นเอกสาร</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HistorySection;