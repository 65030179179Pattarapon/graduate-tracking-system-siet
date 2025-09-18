import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';

function AccountSection({ student }) {
  return (
    <div className={styles.card}>
      <h3>การจัดการบัญชี</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>อีเมลปัจจุบัน (ไม่สามารถแก้ไขได้)</label>
          <input type="email" value={student.email || ''} disabled />
        </div>
        <div className={styles.formGroup}>
          <label>รหัสผ่านปัจจุบัน</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <div className={styles.formGroup}>
          <label>รหัสผ่านใหม่</label>
          <input type="password" placeholder="กรอกรหัสผ่านใหม่" />
        </div>
        <div className={styles.formGroup}>
          <label>ยืนยันรหัสผ่านใหม่</label>
          <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" />
        </div>
      </div>
    </div>
  );
}

export default AccountSection;