// src/components/admin/RejectionModal.jsx
import React, { useState } from 'react';
import styles from './RejectionModal.module.css';

function RejectionModal({ isOpen, onClose, onConfirm }) {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!comment.trim()) {
      alert('กรุณากรอกเหตุผลในการส่งกลับ');
      return;
    }
    onConfirm(comment);
    setComment(''); // Reset comment after submission
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3>เหตุผลในการส่งกลับแก้ไข</h3>
        <p>กรุณาระบุรายละเอียดเพื่อให้ผู้ยื่นนำไปปรับปรุงแก้ไข</p>
        <textarea
          className={styles.commentTextarea}
          rows="4"
          placeholder="กรอกเหตุผลที่นี่..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          autoFocus
        />
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            ยกเลิก
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            ยืนยันและส่งกลับ
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectionModal;