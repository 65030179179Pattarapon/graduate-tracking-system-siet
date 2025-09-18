import React from 'react';
import styles from '../../../pages/Admin_Page/ManageStudentDetailPage.module.css';

function ThesisSection({ student }) {
  return (
    <div className={styles.card}>
      <h3>ข้อมูลวิทยานิพนธ์</h3>
       <div className={styles.formGrid}>
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}> 
            <label>ชื่อหัวข้อวิทยานิพนธ์ (ภาษาไทย)</label>
            <textarea rows="3" defaultValue={student.thesis_title_th || ''}></textarea>
          </div>
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>ชื่อหัวข้อวิทยานิพนธ์ (ภาษาอังกฤษ)</label>
            <textarea rows="3" defaultValue={student.thesis_title_en || ''}></textarea>
          </div>
          <div className={styles.formGroup}><label>วันที่อนุมัติหัวข้อ</label><input type="date" defaultValue={student.proposal_approval_date?.split('T')[0] || ''} /></div>
          <div className={styles.formGroup}><label>วันที่สอบ</label><input type="date" /></div>
          <div className={styles.formGroup}><label>ผลการสอบ</label><input type="text" /></div>
      </div>
    </div>
  );
}

export default ThesisSection;