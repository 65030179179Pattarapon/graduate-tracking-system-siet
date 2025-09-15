import React, { useState } from 'react';
import styles from './AdminActionCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// onAction คือฟังก์ชันที่จะถูกส่งมาจากหน้าแม่ (AdminDocumentDetailPage)
function AdminActionCard({ onAction }) {
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    onAction('approve', comment);
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert('กรุณากรอกเหตุผลในช่อง "ความคิดเห็น" ก่อนทำการตีกลับเอกสาร');
      return;
    }
    onAction('reject', comment);
  };

  return (
    <div className={styles.actionCard}>
      <h3><i className="fas fa-tasks"></i> ดำเนินการเอกสาร</h3>
      <div className={styles.actionBody}>
        <label htmlFor="admin-comment">ความคิดเห็น / เหตุผล (ถ้ามี)</label>
        <textarea
          id="admin-comment"
          rows="4"
          placeholder="เช่น ตีกลับเนื่องจากเอกสารไม่ชัดเจน..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <div className={styles.buttonGroup}>
          <button className={styles.rejectButton} onClick={handleReject}>
            <FontAwesomeIcon icon={faTimesCircle} /> ตีกลับ / แก้ไข
          </button>
          <button className={styles.approveButton} onClick={handleApprove}>
            <FontAwesomeIcon icon={faCheckCircle} /> อนุมัติเอกสาร
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminActionCard;