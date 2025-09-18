import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';

function PublicationsSection({ student }) {
  return (
    <div className={styles.card}>
      <h3>ผลงานตีพิมพ์และเอกสารที่เกี่ยวข้อง</h3>
      <div style={{padding: '25px'}}>
        <p>ส่วนนี้สำหรับอัปโหลดและแสดงรายการไฟล์ผลงานตีพิมพ์และเอกสารอื่นๆ</p>
        <input type="file" />
      </div>
    </div>
  );
}

export default PublicationsSection;