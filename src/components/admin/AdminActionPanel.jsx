import React from 'react';
import styles from './AdminActionPanel.module.css'; // ✅ 1. นำเข้า CSS ใหม่

function AdminActionPanel({ document, onAction }) {
  
  const renderActions = () => {
    switch (document.status) {
      case 'รอตรวจ':
        return (
          <div className={styles.actionBody}>
            <p className={styles.actionInfo}>
              <b>ขั้นตอนต่อไป:</b> ส่งต่อเอกสารให้ผู้เกี่ยวข้องอนุมัติ
            </p>
            <div className={styles.actionButtons}>
              <button onClick={() => onAction('ส่งต่อ')} className={styles.primaryButton}>ส่งต่อ</button>
              <button 
                onClick={() => {
                    const reason = prompt("กรุณาใส่เหตุผลในการส่งกลับ (ถ้ามี):");
                    // ดำเนินการต่อแม้ไม่มีเหตุผล แต่จะดีกว่าถ้าบังคับใส่
                    if (reason !== null) { // prompt returns null if cancelled
                      onAction('ส่งกลับแก้ไข', reason);
                    }
                }} 
                className={styles.dangerButton}
              >
                ส่งกลับแก้ไข
              </button>
            </div>
          </div>
        );
      case 'รออาจารย์อนุมัติ':
        const pendingCount = document.approvers?.filter(a => a.status === 'pending').length || 0;
        return (
          <div className={styles.actionBody}>
            <p className={styles.waitingInfo}>กำลังรอการอนุมัติจากกรรมการ {pendingCount} ท่าน...</p>
          </div>
        );
      default:
        return (
          <div className={styles.actionBody}>
            <p className={styles.waitingInfo}>เอกสารนี้ดำเนินการเสร็จสิ้นแล้ว</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.actionCard}>
      <h3>การดำเนินการ</h3>
      {renderActions()}
    </div>
  );
}
export default AdminActionPanel;